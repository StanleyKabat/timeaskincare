import crypto from "node:crypto";

import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

import { toEnglishServiceName } from "@/data/booking-en";
import { giftVoucherPaymentConfig, siteConfig } from "@/data/site";
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
import {
  resolveVoucherSelection,
  type VoucherType,
} from "@/lib/voucher-selection";
import {
  formatVoucherDate,
  getNewVoucherValidUntil,
  getVoucherValidUntil,
} from "@/lib/voucher-validity";

export type VoucherLocale = "sk" | "en";

export type VoucherRequest = {
  name: string;
  email: string;
  phone: string;
  voucherType: VoucherType;
  /** Canonical Slovak service names (internal, never translated). */
  services: string[];
  /** Server-derived service total or server-validated whole-euro value. */
  amount: number;
  /** Giver name. */
  from: string;
  /** Recipient name. */
  forName: string;
  note?: string;
  locale?: VoucherLocale;
  /** Issued-at (ms). Anchors the deterministic voucher code + issue date. */
  iat?: number;
  /** Signed calendar expiry for new vouchers; absent on legacy 12-month tokens. */
  validUntil?: number;
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

/**
 * Returns the amount captured by server-side validation and signed into the
 * owner token. Keeping it in the signed payload makes retries deterministic
 * even if salon prices change after the order.
 */
export function getVoucherAmount(voucher: VoucherRequest): number {
  if (!Number.isFinite(voucher.amount) || voucher.amount <= 0) {
    throw new Error("Neplatná suma darčekového poukazu.");
  }
  return voucher.amount;
}

export function formatAmount(amount: number): string {
  return Number.isInteger(amount)
    ? `${amount} €`
    : `${amount.toFixed(2).replace(".", ",")} €`;
}

/**
 * Validates a fresh voucher request from the browser. The amount is NOT taken
 * from the client for service vouchers; canonical prices are applied here.
 * Value vouchers are constrained to whole euros between the configured limits.
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
  const from = cleanText(String(data.from || ""), 80);
  const forName = cleanText(String(data.for ?? data.forName ?? ""), 80);
  const note = cleanText(String(data.note || ""), 600);
  const selection = resolveVoucherSelection(data);

  if (!name) {
    throw new Error("Doplň meno a priezvisko.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Doplň platný e-mail.");
  }

  if (!/^[+0-9 ()-]{7,20}$/.test(phone)) {
    throw new Error("Doplň platný telefón.");
  }

  if (!from) {
    throw new Error("Doplň, od koho je darčeková poukážka.");
  }

  if (!forName) {
    throw new Error("Doplň, pre koho je darčeková poukážka.");
  }

  const iat = Date.now();
  return {
    name,
    email,
    phone,
    voucherType: selection.voucherType,
    services: selection.services,
    amount: selection.amount,
    from,
    forName,
    note,
    locale,
    iat,
    validUntil: getNewVoucherValidUntil(iat),
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
  return formatVoucherDate(iat, locale);
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
        voucher.voucherType,
        voucher.services.join("|"),
        String(getVoucherAmount(voucher)),
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
  return voucher.voucherType === "services"
    ? `${giftVoucherPaymentConfig.notePrefix} - ošetrenia - od ${voucher.from} pre ${voucher.forName}`
    : `${giftVoucherPaymentConfig.notePrefix} - hodnota ${getVoucherAmount(voucher)} EUR - od ${voucher.from} pre ${voucher.forName}`;
}

/** Service names shown to the customer (localized for EN). */
export function displayVoucherServices(voucher: VoucherRequest): string[] {
  return voucher.locale === "en"
    ? voucher.services.map(toEnglishServiceName)
    : voucher.services;
}

function voucherTypeLabel(voucher: VoucherRequest, locale: VoucherLocale): string {
  if (voucher.voucherType === "value") {
    return locale === "en" ? "Value voucher" : "Poukaz v hodnote";
  }
  if (locale === "en") {
    return voucher.services.length > 1
      ? "Voucher for treatments"
      : "Voucher for a treatment";
  }
  return voucher.services.length > 1 ? "Poukaz na ošetrenia" : "Poukaz na ošetrenie";
}

export function getVoucherGiftDetailLines(
  voucher: VoucherRequest,
  locale: VoucherLocale,
): string[] {
  if (voucher.voucherType === "value") {
    const amount = formatAmount(getVoucherAmount(voucher));
    return [locale === "en" ? `Voucher value: ${amount}` : `Hodnota poukazu: ${amount}`];
  }

  const services =
    locale === "en" ? voucher.services.map(toEnglishServiceName) : voucher.services;
  return [
    locale === "en" ? "Selected treatments:" : "Vybrané ošetrenia:",
    ...services.map((service) => `- ${service}`),
  ];
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
  const amount = formatAmount(getVoucherAmount(voucher));
  const message = getVoucherPaymentMessage(voucher);
  const code = getVoucherCode(voucher);
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
    `Voucher type: ${voucherTypeLabel(voucher, "en")}`,
    ...getVoucherGiftDetailLines(voucher, "en"),
    `From: ${voucher.from}`,
    `For: ${voucher.forName}`,
    `Voucher code: ${code}`,
    `Contact: ${voucher.name}, ${voucher.email}, ${voucher.phone}`,
  ];
  const voucherLinesSk = [
    `Typ poukazu: ${voucherTypeLabel(voucher, "sk")}`,
    ...getVoucherGiftDetailLines(voucher, "sk"),
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
    `Typ poukazu: ${voucherTypeLabel(voucher, "sk")}`,
    ...getVoucherGiftDetailLines(voucher, "sk"),
    `Suma spolu: ${amount}`,
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

// Palette for the dark, elegant voucher design (light text on a warm dark bg).
const PDF_COLORS = {
  bgDark: rgb(0.07, 0.062, 0.056),
  glow: rgb(0.62, 0.58, 0.54),
  warmGlow: rgb(0.48, 0.39, 0.33),
  coolGlow: rgb(0.52, 0.52, 0.5),
  white: rgb(0.98, 0.97, 0.95),
  soft: rgb(0.87, 0.84, 0.8),
  muted: rgb(0.72, 0.69, 0.65),
  powder: rgb(0.92, 0.66, 0.79),
};

// Exact aspect ratio of the supplied Canva reference (1116.75 × 528 pt).
const VOUCHER_PAGE = {
  width: 1116.75,
  height: 528,
  contentWidth: 820,
  footerMargin: 58,
} as const;

// Unit four-point star (sparkle), centered at (0,0), spanning -1..1. Scaled to
// the desired radius. Vertically/horizontally symmetric, so SVG y-flip is moot.
const SPARKLE_PATH =
  "M 0 -1 C 0.18 -0.18 0.18 -0.18 1 0 C 0.18 0.18 0.18 0.18 0 1 " +
  "C -0.18 0.18 -0.18 0.18 -1 0 C -0.18 -0.18 -0.18 -0.18 0 -1 Z";

function drawSparkle(
  page: PDFPage,
  cx: number,
  cy: number,
  radius: number,
  opacity = 1,
) {
  page.drawSvgPath(SPARKLE_PATH, {
    x: cx,
    y: cy,
    scale: radius,
    color: PDF_COLORS.white,
    opacity,
  });
}

/** Soft layered Canva-like background, recreated with translucent ellipses. */
function drawVoucherBackground(page: PDFPage, width: number, height: number) {
  page.drawRectangle({ x: 0, y: 0, width, height, color: PDF_COLORS.bgDark });

  const glows = [
    {
      x: width * 0.28,
      y: height * 0.86,
      xScale: width * 0.72,
      yScale: height * 0.45,
      color: PDF_COLORS.coolGlow,
      opacity: 0.024,
    },
    {
      x: width * 0.2,
      y: height * 0.36,
      xScale: width * 0.54,
      yScale: height * 0.62,
      color: PDF_COLORS.warmGlow,
      opacity: 0.022,
    },
    {
      x: width * 0.57,
      y: height * 0.58,
      xScale: width * 0.65,
      yScale: height * 0.7,
      color: PDF_COLORS.glow,
      opacity: 0.014,
    },
  ];

  for (const glow of glows) {
    const steps = 42;
    for (let i = 0; i < steps; i += 1) {
      const frac = i / steps;
      page.drawEllipse({
        x: glow.x,
        y: glow.y,
        xScale: glow.xScale * (1 - frac * 0.96),
        yScale: glow.yScale * (1 - frac * 0.96),
        color: glow.color,
        opacity: glow.opacity,
      });
    }
  }
}

function centeredX(page: PDFPage, text: string, font: PDFFont, size: number) {
  return (page.getWidth() - font.widthOfTextAtSize(text, size)) / 2;
}

function drawCentered(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  color = PDF_COLORS.white,
  opacity = 1,
) {
  page.drawText(text, { x: centeredX(page, text, font, size), y, size, font, color, opacity });
}

/** Largest size (<= maxSize, >= minSize) at which `text` fits within `maxWidth`. */
function fitSize(
  text: string,
  font: PDFFont,
  maxSize: number,
  maxWidth: number,
  minSize = 12,
) {
  let size = maxSize;
  while (size > minSize && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 0.5;
  }
  return size;
}

function fitWithEllipsis(text: string, font: PDFFont, size: number, maxWidth: number) {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) {
    return text;
  }

  let fitted = text;
  while (
    fitted.length > 1 &&
    font.widthOfTextAtSize(`${fitted.trimEnd()}…`, size) > maxWidth
  ) {
    fitted = fitted.slice(0, -1);
  }
  return `${fitted.trimEnd()}…`;
}

/** Instagram handle from the stored profile URL, e.g. "@timea.skincare". */
function instagramHandle(): string | null {
  const raw = siteConfig.instagram;
  if (!raw) return null;
  const segment = raw.replace(/\/+$/, "").split("/").pop();
  return segment ? `@${segment}` : null;
}

/** Builds the branded, localized dark PDF gift voucher. Returns raw PDF bytes. */
export async function generateVoucherPdf(voucher: VoucherRequest): Promise<Uint8Array> {
  const isEnglish = voucher.locale === "en";
  const amount = formatAmount(getVoucherAmount(voucher));
  const code = getVoucherCode(voucher);
  const iat = typeof voucher.iat === "number" ? voucher.iat : Date.now();
  const validUntil = formatVoucherDate(
    getVoucherValidUntil(voucher),
    voucher.locale ?? "sk",
  );
  const serviceLabels = displayVoucherServices(voucher);
  const isValueVoucher = voucher.voucherType === "value";
  const isPlural = serviceLabels.length > 1;

  const strings = isEnglish
    ? {
        title: "Gift Voucher",
        subtitle: isValueVoucher ? "value" : "for",
        treatmentType: isPlural ? "treatments" : "a treatment",
        forLabel: "For",
        fromLabel: "From",
        issued: "Issued",
        codeLabel: "Voucher code",
        validityLabel: "Valid until",
        note: "One-time redemption by arranging an appointment at Timea Skincare.",
        valueRule: [
          "The voucher can be used for services at Timea Skincare.",
          "If the selected service costs more than the voucher value, the difference can be paid.",
          "The voucher cannot be exchanged for cash.",
        ],
      }
    : {
        title: "Darčekový poukaz",
        subtitle: isValueVoucher ? "v hodnote" : "na",
        treatmentType: isPlural ? "ošetrenia" : "ošetrenie",
        forLabel: "Pre",
        fromLabel: "Od",
        issued: "Vystavené",
        codeLabel: "Kód poukazu",
        validityLabel: "Platnosť do",
        note: "Jednorazové uplatnenie po dohode termínu v salóne Timea Skincare.",
        valueRule: [
          "Poukaz je možné využiť na služby v salóne Timea Skincare.",
          "Ak je cena služby vyššia ako hodnota poukazu, rozdiel je možné doplatiť.",
          "Poukaz nie je možné zameniť za hotovosť.",
        ],
      };

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(Buffer.from(PT_SERIF_REGULAR_BASE64, "base64"), {
    subset: true,
  });
  const fontBold = await doc.embedFont(Buffer.from(PT_SERIF_BOLD_BASE64, "base64"), {
    subset: true,
  });

  const { width, height, contentWidth, footerMargin } = VOUCHER_PAGE;
  const page = doc.addPage([width, height]);

  drawVoucherBackground(page, width, height);

  // Decorations are restricted to edge zones outside the 820 pt text column.
  const sparkles = [
    [48, 469, 29, 0.96],
    [101, 472, 10, 0.82],
    [70, 399, 17, 0.9],
    [width - 47, 471, 23, 0.95],
    [width - 94, 405, 28, 0.94],
    [width - 43, 360, 12, 0.78],
    [57, 278, 13, 0.7],
    [width - 56, 278, 14, 0.72],
  ] as const;
  sparkles.forEach(([x, y, radius, opacity]) =>
    drawSparkle(page, x, y, radius, opacity),
  );

  page.drawRectangle({
    x: 9,
    y: 9,
    width: width - 18,
    height: height - 18,
    borderColor: PDF_COLORS.soft,
    borderWidth: 0.6,
    opacity: 0.18,
  });

  // Reference-style title stack: large title, separate preposition, then type.
  const titleSize = fitSize(strings.title, fontBold, 74, contentWidth, 54);
  drawCentered(page, strings.title, 423, fontBold, titleSize, PDF_COLORS.white);
  drawCentered(page, strings.subtitle, 382, fontBold, 25, PDF_COLORS.soft);

  if (isValueVoucher) {
    drawCentered(page, amount, 274, fontBold, 70, PDF_COLORS.white);
    strings.valueRule.forEach((line, index) => {
      drawCentered(page, line, 222 - index * 15, font, 10, PDF_COLORS.muted);
    });
  } else {
    drawCentered(page, strings.treatmentType, 340, fontBold, 29, PDF_COLORS.soft);
  }

  if (!isValueVoucher && serviceLabels.length === 1) {
    const service = serviceLabels[0];
    const serviceSize = fitSize(service, fontBold, 32, contentWidth - 80, 18);
    drawCentered(page, service, 274, fontBold, serviceSize, PDF_COLORS.white);
  } else if (!isValueVoucher && serviceLabels.length <= 5) {
    const lineGap = serviceLabels.length <= 3 ? 28 : 22;
    const startY = serviceLabels.length <= 3 ? 304 : 312;
    serviceLabels.forEach((service, index) => {
      const label = `• ${service}`;
      const serviceSize = fitSize(label, fontBold, 21, contentWidth - 100, 13);
      drawCentered(
        page,
        label,
        startY - index * lineGap,
        fontBold,
        serviceSize,
        PDF_COLORS.white,
      );
    });
  } else if (!isValueVoucher) {
    const firstColumnLength = Math.ceil(serviceLabels.length / 2);
    const columns = [
      serviceLabels.slice(0, firstColumnLength),
      serviceLabels.slice(firstColumnLength),
    ];
    const columnWidth = 355;
    const columnX = [width / 2 - 385, width / 2 + 30];
    columns.forEach((services, columnIndex) => {
      services.forEach((service, rowIndex) => {
        const label = `• ${service}`;
        const serviceSize = fitSize(label, font, 16, columnWidth, 10);
        page.drawText(label, {
          x: columnX[columnIndex],
          y: 307 - rowIndex * 18,
          size: serviceSize,
          font,
          color: PDF_COLORS.white,
        });
      });
    });
  }

  // Everything below this divider is a protected, decoration-free info zone.
  page.drawLine({
    start: { x: width / 2 - 190, y: 176 },
    end: { x: width / 2 + 190, y: 176 },
    thickness: 0.8,
    color: PDF_COLORS.muted,
    opacity: 0.42,
  });

  // Recipient / giver and optional dedication.
  drawCentered(
    page,
    `${strings.forLabel}: ${voucher.forName}`,
    151,
    font,
    13,
    PDF_COLORS.white,
  );
  drawCentered(
    page,
    `${strings.fromLabel}: ${voucher.from}`,
    131,
    font,
    13,
    PDF_COLORS.white,
  );
  if (voucher.note) {
    const dedication = fitWithEllipsis(
      `“${voucher.note}”`,
      font,
      9,
      contentWidth,
    );
    drawCentered(
      page,
      dedication,
      113,
      font,
      9,
      PDF_COLORS.soft,
    );
  }

  // Info block: code · issued · validity · redeem note.
  drawCentered(
    page,
    `${strings.codeLabel}: ${code}   •   ${strings.issued}: ${issueDateHuman(
      iat,
      voucher.locale ?? "sk",
    )}`,
    93,
    font,
    10,
    PDF_COLORS.soft,
  );
  drawCentered(
    page,
    `${strings.validityLabel}: ${validUntil}`,
    77,
    font,
    9.5,
    PDF_COLORS.soft,
  );
  const redeemNote = fitWithEllipsis(strings.note, font, 8.5, contentWidth);
  drawCentered(page, redeemNote, 61, font, 8.5, PDF_COLORS.muted);

  // Footer: contact bottom-left, address bottom-right.
  const handle = instagramHandle();
  const leftX = footerMargin;
  if (handle) {
    page.drawText(handle, { x: leftX, y: 34, size: 9, font, color: PDF_COLORS.soft });
  }
  page.drawText(siteConfig.phone, {
    x: leftX,
    y: handle ? 19 : 27,
    size: 9,
    font,
    color: PDF_COLORS.soft,
  });

  const rightMargin = footerMargin;
  const addrSize = 9;
  const addrWidth = font.widthOfTextAtSize(siteConfig.address, addrSize);
  page.drawText(siteConfig.address, {
    x: width - rightMargin - addrWidth,
    y: 34,
    size: addrSize,
    font,
    color: PDF_COLORS.soft,
  });
  const siteText = "timeaskincare.sk";
  const siteWidth = font.widthOfTextAtSize(siteText, addrSize);
  page.drawText(siteText, {
    x: width - rightMargin - siteWidth,
    y: 19,
    size: addrSize,
    font,
    color: PDF_COLORS.muted,
  });

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
  const amount = formatAmount(getVoucherAmount(voucher));
  const validUntilTimestamp = getVoucherValidUntil(voucher);
  const validUntilEn = formatVoucherDate(validUntilTimestamp, "en");
  const validUntilSk = formatVoucherDate(validUntilTimestamp, "sk");
  const selectionLinesEn = getVoucherGiftDetailLines(voucher, "en");
  const selectionLinesSk = getVoucherGiftDetailLines(voucher, "sk");

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
        `Voucher type: ${voucherTypeLabel(voucher, "en")}`,
        ...selectionLinesEn,
        `For: ${voucher.forName}`,
        `From: ${voucher.from}`,
        `Voucher code: ${code}`,
        "",
        voucher.voucherType === "value"
          ? "The voucher can be used for services at Timea Skincare. If the selected service costs more than the voucher value, the difference can be paid. The voucher cannot be exchanged for cash."
          : "The voucher can be redeemed by arranging an appointment at Timea Skincare.",
        "The voucher is intended for one-time redemption.",
        `Voucher validity: 4 calendar months from issue, until ${validUntilEn}.`,
        "",
        "Timea Skincare",
        siteConfig.phone,
      ].join("\n")
    : [
        `Dobrý deň, ${voucher.name},`,
        "",
        "tvoju platbu som overila — ďakujem. Darčekový poukaz nájdeš v prílohe tohto e-mailu vo formáte PDF.",
        "",
        `Typ poukazu: ${voucherTypeLabel(voucher, "sk")}`,
        ...selectionLinesSk,
        `Pre: ${voucher.forName}`,
        `Od: ${voucher.from}`,
        `Kód poukazu: ${code}`,
        "",
        voucher.voucherType === "value"
          ? "Poukaz je možné využiť na služby v salóne Timea Skincare. Ak je cena služby vyššia ako hodnota poukazu, rozdiel je možné doplatiť. Poukaz nie je možné zameniť za hotovosť."
          : "Poukaz je možné uplatniť po dohode termínu v salóne Timea Skincare.",
        "Poukaz je určený na jednorazové uplatnenie.",
        `Platnosť poukazu: 4 kalendárne mesiace od vystavenia, do ${validUntilSk}.`,
        "",
        "Timea Skincare",
        siteConfig.phone,
      ].join("\n");

  const detailLinesEn = [
    `Voucher type: ${voucherTypeLabel(voucher, "en")}`,
    ...selectionLinesEn,
    `For: ${voucher.forName}`,
    `From: ${voucher.from}`,
    `Voucher code: ${code}`,
  ];
  const detailLinesSk = [
    `Typ poukazu: ${voucherTypeLabel(voucher, "sk")}`,
    ...selectionLinesSk,
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
         <p style="font-size:13px;color:#8b8d88;margin:0 0 8px;">${escapeHtml(
           voucher.voucherType === "value"
             ? "The voucher can be used for services at Timea Skincare. If the selected service costs more than the voucher value, the difference can be paid. The voucher cannot be exchanged for cash."
             : "The voucher can be redeemed by arranging an appointment at Timea Skincare.",
         )} One-time redemption. Voucher validity: 4 calendar months from issue, until ${escapeHtml(validUntilEn)}.</p>
         <p style="margin:0;">Timea Skincare<br/>${escapeHtml(siteConfig.phone)}</p>`,
      )
    : emailLayout(
        "Tvoj darčekový poukaz",
        `<p>Dobrý deň, ${escapeHtml(voucher.name)},</p>
         <p>tvoju platbu som overila — ďakujem. Darčekový poukaz nájdeš v prílohe tohto e-mailu vo formáte <strong>PDF</strong>.</p>
         ${summaryHtml(detailLinesSk)}
         <p style="font-size:13px;color:#8b8d88;margin:0 0 8px;">${escapeHtml(
           voucher.voucherType === "value"
             ? "Poukaz je možné využiť na služby v salóne Timea Skincare. Ak je cena služby vyššia ako hodnota poukazu, rozdiel je možné doplatiť. Poukaz nie je možné zameniť za hotovosť."
             : "Poukaz je možné uplatniť po dohode termínu v salóne Timea Skincare.",
         )} Jednorazové uplatnenie. Platnosť poukazu: 4 kalendárne mesiace od vystavenia, do ${escapeHtml(validUntilSk)}.</p>
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
