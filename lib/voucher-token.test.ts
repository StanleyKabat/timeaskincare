import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { PDFDocument } from "pdf-lib";
import { beforeAll, describe, expect, it } from "vitest";

import {
  generateVoucherPdf,
  getVoucherCode,
  getVoucherGiftDetailLines,
  type VoucherRequest,
} from "./voucher";
import { createVoucherToken, verifyVoucherToken } from "./voucher-token";

const serviceVoucher: VoucherRequest = {
  voucherType: "services",
  services: ["Základné ošetrenie", "Úprava a farbenie obočia"],
  amount: 53,
  name: "Anna Test",
  email: "anna@example.com",
  phone: "+421 900 111 222",
  from: "Martina",
  forName: "Lucia",
  note: "Všetko najlepšie",
  locale: "sk",
  iat: Date.parse("2026-07-12T10:00:00.000Z"),
};

beforeAll(() => {
  process.env.BOOKING_SIGNING_SECRET = "voucher-test-secret";
});

describe("voucher tokens", () => {
  it("round-trips a multi-service voucher without exposing fields as query params", () => {
    const token = createVoucherToken(serviceVoucher);
    expect(token).not.toContain("anna@example.com");
    expect(verifyVoucherToken(token)).toEqual(serviceVoucher);
  });

  it("round-trips a value voucher", () => {
    const voucher: VoucherRequest = {
      ...serviceVoucher,
      voucherType: "value",
      services: [],
      amount: 70,
      locale: "en",
    };
    expect(verifyVoucherToken(createVoucherToken(voucher))).toEqual(voucher);
  });

  it("rejects tampering and keeps the voucher code deterministic", () => {
    const token = createVoucherToken(serviceVoucher);
    expect(verifyVoucherToken(`${token}x`)).toBeNull();
    expect(getVoucherCode(serviceVoucher)).toBe(getVoucherCode(serviceVoucher));
  });

  it("generates wide PDFs for SK and EN service and value variants", async () => {
    const variants: Array<[string, VoucherRequest]> = [
      [
        "sk-service-one",
        {
          ...serviceVoucher,
          services: ["Luxusné ošetrenie"],
          amount: 70,
        },
      ],
      [
        "sk-service-multiple",
        {
          ...serviceVoucher,
          services: [
            "Základné ošetrenie",
            "Kompletné ošetrenie",
            "Luxusné ošetrenie",
            "Úprava obočia",
            "Úprava a farbenie obočia",
            "Laminácia obočia",
            "Farbenie mihalníc",
            "Laminácia mihalníc",
            "Laminácia obočia + laminácia mihalníc",
            "Depilácia hornej pery",
            "Depilácia brady",
            "Depilácia hornej pery + brady",
            "Masáž tváre a dekoltu k základnému alebo kompletnému ošetreniu",
          ],
          amount: 326,
        },
      ],
      [
        "sk-value-50",
        {
          ...serviceVoucher,
          voucherType: "value",
          services: [],
          amount: 50,
        },
      ],
      [
        "en-service",
        {
          ...serviceVoucher,
          locale: "en",
        },
      ],
      [
        "en-value",
        {
          ...serviceVoucher,
          voucherType: "value",
          services: [],
          amount: 100,
          locale: "en",
        },
      ],
    ];
    const outputDir = process.env.VOUCHER_PREVIEW_DIR;
    if (outputDir) {
      mkdirSync(outputDir, { recursive: true });
    }

    for (const [name, voucher] of variants) {
      const pdf = await generateVoucherPdf(voucher);
      expect(Buffer.from(pdf).subarray(0, 4).toString()).toBe("%PDF");
      expect(pdf.length).toBeGreaterThan(1_000);

      const document = await PDFDocument.load(pdf);
      const page = document.getPage(0);
      expect(page.getWidth()).toBeCloseTo(1116.75, 2);
      expect(page.getHeight()).toBeCloseTo(528, 2);
      expect(page.getWidth() / page.getHeight()).toBeCloseTo(2.115, 3);

      if (outputDir) {
        writeFileSync(join(outputDir, `${name}.pdf`), pdf);
      }
    }
  });

  it("hides service prices in gift details but keeps value voucher amounts", () => {
    const serviceDetails = getVoucherGiftDetailLines(serviceVoucher, "sk");
    expect(serviceDetails).toContain("Vybrané ošetrenia:");
    expect(serviceDetails.join(" ")).not.toMatch(/€|hodnot/i);

    const valueDetails = getVoucherGiftDetailLines(
      {
        ...serviceVoucher,
        voucherType: "value",
        services: [],
        amount: 70,
      },
      "en",
    );
    expect(valueDetails).toEqual(["Voucher value: 70 €"]);
  });
});
