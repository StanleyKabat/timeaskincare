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

  it("generates PDFs for multi-service and value vouchers", async () => {
    const servicePdf = await generateVoucherPdf(serviceVoucher);
    const valuePdf = await generateVoucherPdf({
      ...serviceVoucher,
      voucherType: "value",
      services: [],
      amount: 70,
      locale: "en",
    });

    expect(Buffer.from(servicePdf).subarray(0, 4).toString()).toBe("%PDF");
    expect(Buffer.from(valuePdf).subarray(0, 4).toString()).toBe("%PDF");
    expect(servicePdf.length).toBeGreaterThan(1_000);
    expect(valuePdf.length).toBeGreaterThan(1_000);
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
