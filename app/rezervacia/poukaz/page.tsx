import type { Metadata } from "next";
import Link from "next/link";

import {
  formatAmount,
  getVoucherAmount,
  getVoucherCode,
  getVoucherPaymentMessage,
  type VoucherRequest,
} from "@/lib/voucher";
import { verifyVoucherToken } from "@/lib/voucher-token";

export const metadata: Metadata = {
  title: "Darčekový poukaz",
  robots: { index: false, follow: false },
};

type SearchParams = {
  token?: string;
  status?: string;
};

function VoucherCard({ voucher }: { voucher: VoucherRequest }) {
  let amount = "";
  try {
    amount = formatAmount(getVoucherAmount(voucher.treatment));
  } catch {
    amount = "-";
  }

  const rows: Array<[string, string]> = [
    ["Meno", voucher.name],
    ["E-mail", voucher.email],
    ["Telefón", voucher.phone],
    ["Typ ošetrenia", voucher.treatment],
    ["Suma", amount],
    ["Od koho", voucher.from],
    ["Pre koho", voucher.forName],
    ["Správa pre prijímateľa", getVoucherPaymentMessage(voucher)],
    ["Kód poukazu", getVoucherCode(voucher)],
    ["Jazyk", voucher.locale === "en" ? "angličtina" : "slovenčina"],
  ];

  if (voucher.note) {
    rows.push(["Poznámka", voucher.note]);
  }

  return (
    <dl className="mt-6 grid gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-4 text-sm sm:p-6">
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-wrap gap-x-3 gap-y-0.5">
          <dt className="min-w-32 font-semibold text-[var(--color-charcoal)]">{label}</dt>
          <dd className="min-w-0 break-words text-[var(--color-stone)]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[0_22px_55px_rgba(0,0,0,0.14)] sm:p-10">
        {children}
      </div>
    </section>
  );
}

function BackLink() {
  return (
    <Link
      href="/"
      className="mt-6 inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-line)] px-5 py-2 text-sm font-semibold text-[var(--color-charcoal)] transition hover:bg-[var(--color-blush)]"
    >
      Späť na úvod
    </Link>
  );
}

export default async function VoucherManagePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const token = params.token ?? "";
  const status = params.status ?? "";
  const voucher = token ? verifyVoucherToken(token) : null;

  if (status === "sent") {
    return (
      <Shell>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-powder)]">
          Darčekový poukaz
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--color-charcoal)] sm:text-3xl">
          Poukaz odoslaný
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-stone)]">
          Darčekový poukaz vo formáte PDF som odoslala zákazníčke na e-mail a kópiu si dostala aj
          ty. Ak by si potrebovala poukaz poslať znova, klikni na tlačidlo nižšie – vygeneruje sa
          rovnaký poukaz s rovnakým kódom.
        </p>
        {voucher ? <VoucherCard voucher={voucher} /> : null}
        {voucher ? (
          <form method="post" action="/api/booking/voucher-send" className="mt-6">
            <input type="hidden" name="token" value={token} />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-semibold text-[var(--color-charcoal)] transition hover:bg-[var(--color-blush)]"
            >
              Odoslať poukaz znova
            </button>
          </form>
        ) : null}
        <div>
          <BackLink />
        </div>
      </Shell>
    );
  }

  if (!voucher) {
    return (
      <Shell>
        <h1 className="text-2xl font-semibold text-[var(--color-charcoal)] sm:text-3xl">
          Odkaz nie je platný
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-stone)]">
          {status === "error"
            ? "Pri odosielaní darčekového poukazu nastala chyba. Skús to prosím znova z e-mailu."
            : "Tento odkaz na poukaz je neplatný alebo už expiroval. Otvor prosím odkaz priamo z e-mailu s objednávkou poukazu."}
        </p>
        <BackLink />
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-powder)]">
        Objednávka darčekového poukazu
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-[var(--color-charcoal)] sm:text-3xl">
        Potvrdiť platbu a odoslať poukaz
      </h1>
      <p className="mt-3 text-sm leading-6 text-[var(--color-stone)]">
        Najprv over platbu na bankovom účte. Až potom klikni na tlačidlo – zákazníčke sa vygeneruje
        a odošle darčekový poukaz vo formáte PDF.
      </p>

      {status === "error" ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
          Pri odosielaní poukazu nastala chyba. Skús to prosím znova.
        </p>
      ) : null}

      <VoucherCard voucher={voucher} />

      <form method="post" action="/api/booking/voucher-send" className="mt-6">
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-powder)] px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)] shadow-[0_12px_34px_rgba(226,138,180,0.24)] transition hover:bg-[var(--color-charcoal)] sm:w-auto"
        >
          Platba prijatá – odoslať PDF poukaz
        </button>
      </form>
    </Shell>
  );
}
