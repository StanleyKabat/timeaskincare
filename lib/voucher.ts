import crypto from "node:crypto";

import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

import { toEnglishServiceName } from "@/data/booking-en";
import { giftVoucherPaymentConfig, giftVoucherTreatments, siteConfig } from "@/data/site";
import {
  emailButton,
  emailLayout,
  escapeHtml,
  sendEmail,
  summaryHtml,
  type EmailAttachment,
} from "@/lib/booking-integrations";
import { createVoucherToken } from "@/lib/voucher-token";
import { PT_SERIF_BOLD_BASE64, PT_SERIF_REGULAR_BASE64 } from "@/lib/voucher-font";

export type VoucherLocale = "sk" | "en";

export type VoucherRequest = {
  name: string;
  email: string;
  phone: string;
  /** Canonical Slovak treatment name (internal, never translated). */
  treatment: string;
  /** Giver name. */
  from: string;
  /** Recipient name. */
  forName: string;
  note?: string;
  locale?: VoucherLocale;
  /** Issued-at (ms). Anchors the deterministic voucher code + issue date. */
  iat?: number;
};

const TIMEZONE = "Europe/Bratislava";

function cleanText(value: string, maxLength = 160) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function requireEmailConfigured() {
  if (!process.env.RESEND_API_KEY || !process.env.BOOKING_FROM_EMAIL) {
    throw new Error("E-mailová služba nie je nakonfigurovaná.");
  }
}

/** Looks up the canonical voucher amount server-side; never trusts the client. */
export function getVoucherAmount(treatment: string): number {
  const match = giftVoucherTreatments.find((item) => item.name === treatment);
  if (!match) {
    throw new Error("Neplatný typ ošetrenia pre poukážku.");
  }
  return match.amount;
}

export function formatAmount(amount: number): string {
  return Number.isInteger(amount)
    ? `${amount} €`
    : `${amount.toFixed(2).replace(".", ",")} €`;
}

/**
 * Validates a fresh voucher request from the browser. The amount is NOT taken
 * from the client — only the canonical treatment name is trusted, and the
 * amount is derived from it here.
 */
export function validateVoucherRequest(input: unknown): VoucherRequest {
  if (!input || typeof input !== "object") {
    throw new Error("Objednávka poukazu nemá správny formát.");
  }

  const data = input as Record<string, unknown>;
  const locale: VoucherLocale = data.locale === "en" ? "en" : "sk";
  const name = cleanText(String(data.name || ""), 120);
  const email = cleanText(String(data.email || ""), 180);
  const phone = cleanText(String(data.phone || ""), 40);
  const treatment = cleanText(String(data.treatment || ""), 160);
  const from = cleanText(String(data.from || ""), 80);
  const forName = cleanText(String(data.for ?? data.forName ?? ""), 80);
  const note = cleanText(String(data.note || ""), 600);

  if (!name) {
    throw new Error("Doplň meno a priezvisko.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Doplň platný e-mail.");
  }

  if (!/^[+0-9 ()-]{7,20}$/.test(phone)) {
    throw new Error("Doplň platný telefón.");
  }

  if (!giftVoucherTreatments.some((item) => item.name === treatment)) {
    throw new Error("Vyber typ ošetrenia pre darčekový poukaz.");
  }

  if (!from) {
    throw new Error("Doplň, od koho je darčeková poukážka.");
  }

  if (!forName) {
    throw new Error("Doplň, pre koho je darčeková poukážka.");
  }

  return {
    name,
    email,
    phone,
    treatment,
    from,
    forName,
    note,
    locale,
    iat: Date.now(),
  };
}

function voucherDateYmd(iat: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(iat))
    .replace(/-/g, "");
}

function issueDateHuman(iat: number, locale: VoucherLocale): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "sk-SK", {
    timeZone: TIMEZONE,
    day: "numeric",
    month: locale === "en" ? "long" : "numeric",
    year: "numeric",
  }).format(new Date(iat));
}

/**
 * Deterministic, readable voucher code: TS-YYYYMMDD-XXXX. Derived only from
 * stable signed-token fields, so re-clicking the owner send link produces the
 * exact same code (idempotent voucher content without a database).
 */
export function getVoucherCode(voucher: VoucherRequest): string {
  const iat = typeof voucher.iat === "number" ? voucher.iat : Date.now();
  const hash = crypto
    .createHash("sha256")
    .update(
      [
        voucher.email.trim().toLowerCase(),
        voucher.treatment,
        voucher.from,
        voucher.forName,
        String(iat),
      ].join("::"),
    )
    .digest("hex");

  return `TS-${voucherDateYmd(iat)}-${hash.slice(0, 4).toUpperCase()}`;
}

/** Bank-transfer reference. Matches the /api/booking/voucher-qr message. */
export function getVoucherPaymentMessage(voucher: VoucherRequest): string {
  return `${giftVoucherPaymentConfig.notePrefix} - ${voucher.treatment} - od ${voucher.from} pre ${voucher.forName}`;
}

/** Treatment name shown to the customer (English display name for EN locale). */
function displayTreatment(voucher: VoucherRequest): string {
  return voucher.locale === "en"
    ? toEnglishServiceName(voucher.treatment)
    : voucher.treatment;
}

// ---------------------------------------------------------------------------
// E-mails
// ---------------------------------------------------------------------------

/**
 * Step 1: the customer clicked "I have sent the payment". Sends:
 *  - a localized "request received" e-mail to the customer,
 *  - an owner e-mail to Timea with a secure link to confirm the payment and
 *    send the PDF voucher.
 * Throws if either e-mail fails so the API never reports a false success.
 */
export async function sendVoucherRequestEmails(voucher: VoucherRequest, baseUrl: string) {
  requireEmailConfigured();

  const isEnglish = voucher.locale === "en";
  const amount = formatAmount(getVoucherAmount(voucher.treatment));
  const message = getVoucherPaymentMessage(voucher);
  const code = getVoucherCode(voucher);
  const treatmentLabel = displayTreatment(voucher);
  const token = createVoucherToken(voucher);
  const confirmUrl = `${baseUrl}/rezervacia/poukaz?token=${encodeURIComponent(token)}`;

  // --- Customer "request received" e-mail (localized) ---
  const customerSubject = isEnglish
    ? "Gift voucher request received | Timea Skincare"
    : "Objednávka darčekového poukazu prijatá | Timea Skincare";

  const paymentLinesEn = [
    `Amount: ${amount}`,
    `IBAN: ${giftVoucherPaymentConfig.iban}`,
    `Payment message: ${message}`,
  ];
  const paymentLinesSk = [
    `Suma: ${amount}`,
    `IBAN: ${giftVoucherPaymentConfig.iban}`,
    `Správa pre prijímateľa: ${message}`,
  ];
  const voucherLinesEn = [
    `Voucher: ${treatmentLabel}`,
    `From: ${voucher.from}`,
    `For: ${voucher.forName}`,
    `Voucher code: ${code}`,
    `Contact: ${voucher.name}, ${voucher.email}, ${voucher.phone}`,
  ];
  const voucherLinesSk = [
    `Poukaz: ${treatmentLabel}`,
    `Od: ${voucher.from}`,
    `Pre: ${voucher.forName}`,
    `Kód poukazu: ${code}`,
    `Kontakt: ${voucher.name}, ${voucher.email}, ${voucher.phone}`,
  ];

  const customerText = isEnglish
    ? [
        `Hello ${voucher.name},`,
        "",
        "thank you for your gift voucher order at Timea Skincare. Your request has been received.",
        "The payment is made by bank transfer, so the PDF gift voucher will be sent to your email after the payment has been verified. It is not delivered automatically.",
        "",
        "Payment details:",
        ...paymentLinesEn,
        "",
        "Voucher details:",
        ...voucherLinesEn,
        "",
        "Thank you,",
        "Timea Skincare",
        siteConfig.phone,
      ].join("\n")
    : [
        `Dobrý deň, ${voucher.name},`,
        "",
        "ďakujem za objednávku darčekového poukazu v Timea Skincare. Tvoju objednávku som prijala.",
        "Platba prebieha bankovým prevodom, preto ti darčekový poukaz vo formáte PDF pošlem na e-mail až po overení platby. Nie je doručený automaticky.",
        "",
        "Platobné údaje:",
        ...paymentLinesSk,
        "",
        "Údaje poukazu:",
        ...voucherLinesSk,
        "",
        "Ďakujem,",
        "Timea Skincare",
        siteConfig.phone,
      ].join("\n");

  const customerHtml = isEnglish
    ? emailLayout(
        "Gift voucher request received",
        `<p>Hello ${escapeHtml(voucher.name)},</p>
         <p>thank you for your gift voucher order at Timea Skincare. Your request has been received.</p>
         <p>The payment is made by <strong>bank transfer</strong>, so the PDF gift voucher will be sent to your email <strong>after the payment has been verified</strong> — it is not delivered automatically.</p>
         <p style="margin:16px 0 4px;font-weight:600;">Payment details</p>
         ${summaryHtml(paymentLinesEn)}
         <p style="margin:0 0 4px;font-weight:600;">Voucher details</p>
         ${summaryHtml(voucherLinesEn)}
         <p style="margin:0;">Thank you,<br/>Timea Skincare<br/>${escapeHtml(siteConfig.phone)}</p>`,
      )
    : emailLayout(
        "Objednávka darčekového poukazu prijatá",
        `<p>Dobrý deň, ${escapeHtml(voucher.name)},</p>
         <p>ďakujem za objednávku darčekového poukazu v Timea Skincare. Tvoju objednávku som prijala.</p>
         <p>Platba prebieha <strong>bankovým prevodom</strong>, preto ti darčekový poukaz vo formáte PDF pošlem na e-mail <strong>až po overení platby</strong> — nie je doručený automaticky.</p>
         <p style="margin:16px 0 4px;font-weight:600;">Platobné údaje</p>
         ${summaryHtml(paymentLinesSk)}
         <p style="margin:0 0 4px;font-weight:600;">Údaje poukazu</p>
         ${summaryHtml(voucherLinesSk)}
         <p style="margin:0;">Ďakujem,<br/>Timea Skincare<br/>${escapeHtml(siteConfig.phone)}</p>`,
      );

  // --- Owner e-mail (Slovak) with the secure confirm link ---
  const ownerLines = [
    `Meno: ${voucher.name}`,
    `E-mail: ${voucher.email}`,
    `Telefón: ${voucher.phone}`,
    `Typ ošetrenia: ${voucher.treatment}`,
    `Suma: ${amount}`,
    `Od: ${voucher.from}`,
    `Pre: ${voucher.forName}`,
    `Správa pre prijímateľa: ${message}`,
    `Kód poukazu: ${code}`,
    `Jazyk zákazníčky: ${isEnglish ? "angličtina" : "slovenčina"}`,
    voucher.note ? `Poznámka: ${voucher.note}` : "",
  ].filter(Boolean);

  const ownerText = [
    "Nová objednávka darčekového poukazu.",
    "",
    "DÔLEŽITÉ: platbu over ručne na bankovom účte. PDF poukaz sa odošle až po tvojom potvrdení.",
    "",
    ...ownerLines,
    "",
    `Platba prijatá – odoslať PDF poukaz: ${confirmUrl}`,
  ].join("\n");

  const ownerHtml = emailLayout(
    "Nová objednávka darčekového poukazu",
    `<p>Máš novú <strong>objednávku darčekového poukazu</strong>.</p>
     <p style="background:#fff4d6;border:1px solid #f0dca0;border-radius:10px;padding:10px 14px;margin:0 0 14px;font-size:14px;">
       <strong>Platbu over ručne</strong> na bankovom účte. PDF poukaz sa zákazníčke odošle až po tvojom potvrdení nižšie.
     </p>
     ${summaryHtml(ownerLines)}
     <p style="margin:0 0 12px;">${emailButton(confirmUrl, "Platba prijatá – odoslať PDF poukaz")}</p>
     <p style="font-size:13px;color:#8b8d88;margin:0;">Po kliknutí sa otvorí stránka, kde po overení platby finálne odošleš PDF poukaz zákazníčke.</p>`,
  );

  await Promise.all([
    sendEmail(voucher.email, customerSubject, customerText, { html: customerHtml }),
    sendEmail(
      siteConfig.email,
      `Objednávka poukazu – ${voucher.name} (${amount})`,
      ownerText,
      { html: ownerHtml },
    ),
  ]);

  return { code };
}

// ---------------------------------------------------------------------------
// PDF voucher
// ---------------------------------------------------------------------------

const COLORS = {
  charcoal: rgb(0.141, 0.15, 0.161),
  powder: rgb(0.851, 0.475, 0.659),
  stone: rgb(0.545, 0.553, 0.533),
  blush: rgb(0.965, 0.863, 0.906),
  line: rgb(0.909, 0.909, 0.898),
};

function drawCentered(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  color = COLORS.charcoal,
) {
  const width = page.getWidth();
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (width - textWidth) / 2, y, size, font, color });
}

/** Builds the branded, localized PDF gift voucher. Returns raw PDF bytes. */
export async function generateVoucherPdf(voucher: VoucherRequest): Promise<Uint8Array> {
  const isEnglish = voucher.locale === "en";
  const amount = formatAmount(getVoucherAmount(voucher.treatment));
  const code = getVoucherCode(voucher);
  const iat = typeof voucher.iat === "number" ? voucher.iat : Date.now();
  const treatmentLabel = displayTreatment(voucher);

  const strings = isEnglish
    ? {
        title: "Gift Voucher",
        value: "Value",
        treatment: "Treatment",
        forLabel: "For",
        fromLabel: "From",
        issued: "Issued",
        codeLabel: "Voucher code",
        note: "The voucher can be redeemed by arranging an appointment at Timea Skincare.",
        validity: "Voucher validity: 12 months from the date of issue.",
      }
    : {
        title: "Darčekový poukaz",
        value: "Hodnota",
        treatment: "Ošetrenie",
        forLabel: "Pre",
        fromLabel: "Od",
        issued: "Vystavené",
        codeLabel: "Kód poukazu",
        note: "Poukaz je možné uplatniť po dohode termínu v salóne Timea Skincare.",
        validity: "Platnosť poukazu: 12 mesiacov od vystavenia.",
      };

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(Buffer.from(PT_SERIF_REGULAR_BASE64, "base64"), {
    subset: true,
  });
  const fontBold = await doc.embedFont(Buffer.from(PT_SERIF_BOLD_BASE64, "base64"), {
    subset: true,
  });

  // A5 landscape.
  const width = 595.28;
  const height = 419.53;
  const page = doc.addPage([width, height]);

  // Background + decorative inner frame.
  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.98, 0.973, 0.965) });
  page.drawRectangle({
    x: 22,
    y: 22,
    width: width - 44,
    height: height - 44,
    borderColor: COLORS.powder,
    borderWidth: 1.4,
  });
  page.drawRectangle({ x: 22, y: height - 92, width: width - 44, height: 70, color: COLORS.blush });

  // Brand + title.
  drawCentered(page, "TIMEA SKINCARE", height - 52, fontBold, 13, COLORS.powder);
  drawCentered(page, strings.title, height - 80, font, 15, COLORS.charcoal);
  drawCentered(page, treatmentLabel, height - 132, fontBold, 26, COLORS.charcoal);
  drawCentered(page, `${strings.value}: ${amount}`, height - 162, font, 16, COLORS.stone);

  // Divider.
  page.drawLine({
    start: { x: 90, y: height - 186 },
    end: { x: width - 90, y: height - 186 },
    thickness: 1,
    color: COLORS.line,
  });

  // Recipient / giver block.
  const leftX = 70;
  const rightX = width / 2 + 20;
  let rowY = height - 220;
  const detailRow = (label: string, value: string, x: number, y: number) => {
    page.drawText(label.toUpperCase(), { x, y, size: 9, font, color: COLORS.stone });
    page.drawText(value, { x, y: y - 16, size: 14, font: fontBold, color: COLORS.charcoal });
  };
  detailRow(strings.forLabel, voucher.forName, leftX, rowY);
  detailRow(strings.fromLabel, voucher.from, rightX, rowY);
  rowY -= 46;
  detailRow(strings.issued, issueDateHuman(iat, voucher.locale ?? "sk"), leftX, rowY);
  detailRow(strings.codeLabel, code, rightX, rowY);

  // Note + validity.
  page.drawText(strings.note, { x: leftX, y: 96, size: 10, font, color: COLORS.stone });
  page.drawText(strings.validity, {
    x: leftX,
    y: 80,
    size: 10,
    font: fontBold,
    color: COLORS.charcoal,
  });

  // Salon contact footer.
  const footer = `${siteConfig.address}  •  ${siteConfig.phone}  •  timeaskincare.sk`;
  drawCentered(page, footer, 44, font, 9, COLORS.stone);

  return doc.save();
}

/**
 * Step 2: Timea confirmed the payment. Generates the PDF voucher and e-mails it
 * to the customer (localized) plus a copy/confirmation to Timea. Throws on
 * failure so the owner sees an error and can safely retry from the same link.
 */
export async function sendVoucherPdfEmails(voucher: VoucherRequest) {
  requireEmailConfigured();

  const isEnglish = voucher.locale === "en";
  const code = getVoucherCode(voucher);
  const amount = formatAmount(getVoucherAmount(voucher.treatment));
  const treatmentLabel = displayTreatment(voucher);

  const pdfBytes = await generateVoucherPdf(voucher);
  const attachment: EmailAttachment = {
    filename: `Timea-Skincare-${code}.pdf`,
    content: Buffer.from(pdfBytes).toString("base64"),
    contentType: "application/pdf",
  };

  const customerSubject = isEnglish
    ? "Your gift voucher | Timea Skincare"
    : "Tvoj darčekový poukaz | Timea Skincare";

  const customerText = isEnglish
    ? [
        `Hello ${voucher.name},`,
        "",
        "your payment has been verified — thank you. Your gift voucher is attached to this email as a PDF.",
        "",
        `Voucher: ${treatmentLabel}`,
        `Value: ${amount}`,
        `For: ${voucher.forName}`,
        `From: ${voucher.from}`,
        `Voucher code: ${code}`,
        "",
        "The voucher can be redeemed by arranging an appointment at Timea Skincare.",
        "Voucher validity: 12 months from the date of issue.",
        "",
        "Timea Skincare",
        siteConfig.phone,
      ].join("\n")
    : [
        `Dobrý deň, ${voucher.name},`,
        "",
        "tvoju platbu som overila — ďakujem. Darčekový poukaz nájdeš v prílohe tohto e-mailu vo formáte PDF.",
        "",
        `Poukaz: ${treatmentLabel}`,
        `Hodnota: ${amount}`,
        `Pre: ${voucher.forName}`,
        `Od: ${voucher.from}`,
        `Kód poukazu: ${code}`,
        "",
        "Poukaz je možné uplatniť po dohode termínu v salóne Timea Skincare.",
        "Platnosť poukazu: 12 mesiacov od vystavenia.",
        "",
        "Timea Skincare",
        siteConfig.phone,
      ].join("\n");

  const detailLinesEn = [
    `Voucher: ${treatmentLabel}`,
    `Value: ${amount}`,
    `For: ${voucher.forName}`,
    `From: ${voucher.from}`,
    `Voucher code: ${code}`,
  ];
  const detailLinesSk = [
    `Poukaz: ${treatmentLabel}`,
    `Hodnota: ${amount}`,
    `Pre: ${voucher.forName}`,
    `Od: ${voucher.from}`,
    `Kód poukazu: ${code}`,
  ];

  const customerHtml = isEnglish
    ? emailLayout(
        "Your gift voucher",
        `<p>Hello ${escapeHtml(voucher.name)},</p>
         <p>your payment has been verified — thank you. Your gift voucher is attached to this email as a <strong>PDF</strong>.</p>
         ${summaryHtml(detailLinesEn)}
         <p style="font-size:13px;color:#8b8d88;margin:0 0 8px;">The voucher can be redeemed by arranging an appointment at Timea Skincare. Voucher validity: 12 months from the date of issue.</p>
         <p style="margin:0;">Timea Skincare<br/>${escapeHtml(siteConfig.phone)}</p>`,
      )
    : emailLayout(
        "Tvoj darčekový poukaz",
        `<p>Dobrý deň, ${escapeHtml(voucher.name)},</p>
         <p>tvoju platbu som overila — ďakujem. Darčekový poukaz nájdeš v prílohe tohto e-mailu vo formáte <strong>PDF</strong>.</p>
         ${summaryHtml(detailLinesSk)}
         <p style="font-size:13px;color:#8b8d88;margin:0 0 8px;">Poukaz je možné uplatniť po dohode termínu v salóne Timea Skincare. Platnosť poukazu: 12 mesiacov od vystavenia.</p>
         <p style="margin:0;">Timea Skincare<br/>${escapeHtml(siteConfig.phone)}</p>`,
      );

  const ownerText = [
    "Darčekový poukaz bol odoslaný zákazníčke.",
    "",
    `Meno: ${voucher.name}`,
    `E-mail: ${voucher.email}`,
    `Suma: ${amount}`,
    `Kód poukazu: ${code}`,
    `Jazyk: ${isEnglish ? "angličtina" : "slovenčina"}`,
    "",
    "Kópia poukazu je v prílohe.",
  ].join("\n");

  const ownerHtml = emailLayout(
    "Darčekový poukaz odoslaný",
    `<p>Darčekový poukaz bol <strong>odoslaný zákazníčke</strong>. Kópia je v prílohe.</p>
     ${summaryHtml([
       `Meno: ${voucher.name}`,
       `E-mail: ${voucher.email}`,
       `Suma: ${amount}`,
       `Kód poukazu: ${code}`,
       `Jazyk: ${isEnglish ? "angličtina" : "slovenčina"}`,
     ])}`,
  );

  await Promise.all([
    sendEmail(voucher.email, customerSubject, customerText, {
      html: customerHtml,
      attachments: [attachment],
    }),
    sendEmail(siteConfig.email, `Poukaz odoslaný – ${voucher.name} (${code})`, ownerText, {
      html: ownerHtml,
      attachments: [attachment],
    }),
  ]);

  return { code };
}
