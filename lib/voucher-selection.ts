import { giftVoucherTreatments } from "@/data/site";

export type VoucherType = "services" | "value";

export type VoucherSelection =
  | {
      voucherType: "services";
      services: string[];
      amount: number;
    }
  | {
      voucherType: "value";
      services: [];
      amount: number;
    };

export const voucherValuePresets = [30, 50, 70, 100, 150] as const;
export const voucherValueLimits = { min: 30, max: 300 } as const;

function cleanServiceName(value: unknown) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, 160);
}

function parseWholeEuroAmount(value: unknown): number {
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    (typeof value === "string" && !/^\d+$/.test(value.trim()))
  ) {
    throw new Error("Hodnota poukazu musí byť celé číslo v eurách.");
  }

  const amount = Number(value);
  if (!Number.isSafeInteger(amount)) {
    throw new Error("Hodnota poukazu musí byť celé číslo v eurách.");
  }
  if (amount < voucherValueLimits.min || amount > voucherValueLimits.max) {
    throw new Error(
      `Hodnota poukazu musí byť od ${voucherValueLimits.min} € do ${voucherValueLimits.max} €.`,
    );
  }
  return amount;
}

/**
 * Resolves a browser payload against canonical server-owned voucher prices.
 * Browser-provided totals and service display names are deliberately ignored.
 */
export function resolveVoucherSelection(input: unknown): VoucherSelection {
  if (!input || typeof input !== "object") {
    throw new Error("Vyber typ darčekového poukazu.");
  }

  const data = input as Record<string, unknown>;
  if (data.voucherType === "value") {
    return {
      voucherType: "value",
      services: [],
      amount: parseWholeEuroAmount(data.valueAmount),
    };
  }

  if (data.voucherType !== "services") {
    throw new Error("Vyber typ darčekového poukazu.");
  }

  const submittedServices = Array.isArray(data.services)
    ? data.services.map(cleanServiceName).filter(Boolean)
    : [];
  const services = [...new Set(submittedServices)];
  const canonicalPrices = new Map(
    giftVoucherTreatments.map((service) => [service.name, service.amount]),
  );

  if (
    services.length === 0 ||
    services.length !== submittedServices.length ||
    services.some((service) => !canonicalPrices.has(service))
  ) {
    throw new Error("Vyber jednu alebo viac dostupných služieb pre poukaz.");
  }

  return {
    voucherType: "services",
    services,
    amount: services.reduce((total, service) => total + (canonicalPrices.get(service) ?? 0), 0),
  };
}
