import { describe, expect, it } from "vitest";

import { resolveVoucherSelection } from "./voucher-selection";

describe("voucher selection", () => {
  it("derives a multi-service total from canonical prices", () => {
    expect(
      resolveVoucherSelection({
        voucherType: "services",
        services: ["Základné ošetrenie", "Úprava a farbenie obočia"],
        amount: 1,
      }),
    ).toEqual({
      voucherType: "services",
      services: ["Základné ošetrenie", "Úprava a farbenie obočia"],
      amount: 53,
    });
  });

  it("rejects unknown and duplicate services", () => {
    expect(() =>
      resolveVoucherSelection({ voucherType: "services", services: ["Neznáma služba"] }),
    ).toThrow();
    expect(() =>
      resolveVoucherSelection({
        voucherType: "services",
        services: ["Laminácia obočia", "Laminácia obočia"],
      }),
    ).toThrow();
  });

  it.each([30, 50, 300, "70"])("accepts a whole-euro value of %s", (valueAmount) => {
    expect(resolveVoucherSelection({ voucherType: "value", valueAmount }).amount).toBe(
      Number(valueAmount),
    );
  });

  it.each([undefined, "", "abc", 0, -30, 29, 301, 30.5, "30.5"])(
    "rejects invalid value %s",
    (valueAmount) => {
      expect(() => resolveVoucherSelection({ voucherType: "value", valueAmount })).toThrow();
    },
  );
});
