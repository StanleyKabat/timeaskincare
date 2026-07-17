import type { Metadata } from "next";
import Link from "next/link";

import { verifyBookingToken } from "@/lib/booking-token";
import type { BookingRequest } from "@/lib/booking-integrations";

export const metadata: Metadata = {
  title: "Správa rezervácie",
  robots: { index: false, follow: false },
};

type SearchParams = {
  token?: string;
  intent?: string;
  status?: string;
};

function formatDateHuman(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) {
    return date;
  }

  return `${day}. ${month}. ${year}`;
}

function SummaryCard({ booking }: { booking: BookingRequest }) {
  const rows: Array<[string, string]> = [
    ["Meno", booking.name],
    ["E-mail", booking.email],
    ["Telefón", booking.phone],
    ["Služby", booking.services.join(", ")],
    ["Dátum", formatDateHuman(booking.date)],
    ["Čas", booking.time],
    ["Trvanie", `${booking.durationMinutes} min`],
  ];

  if (booking.note) {
    rows.push(["Poznámka", booking.note]);
  }

  return (
    <dl className="mt-6 grid gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-4 text-sm sm:p-6">
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-wrap gap-x-3 gap-y-0.5">
          <dt className="min-w-28 font-semibold text-[var(--color-charcoal)]">{label}</dt>
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

export default async function ReservationManagePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const token = params.token ?? "";
  const status = params.status ?? "";
  const intent = params.intent ?? "";
  const booking = token ? verifyBookingToken(token) : null;

  if (status === "confirmed") {
    return (
      <Shell>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-powder)]">
          Rezervácia
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--color-charcoal)] sm:text-3xl">
          Rezervácia potvrdená
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-stone)]">
          Termín bol úspešne potvrdený. Zákazníčke aj tebe som poslala potvrdzovací e-mail
          spolu s možnosťou pridať termín do kalendára.
        </p>
        {booking ? <SummaryCard booking={booking} /> : null}
        <Link
          href="/"
          className="mt-6 inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-line)] px-5 py-2 text-sm font-semibold text-[var(--color-charcoal)] transition hover:bg-[var(--color-blush)]"
        >
          Späť na úvod
        </Link>
      </Shell>
    );
  }

  if (status === "declined") {
    return (
      <Shell>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-powder)]">
          Rezervácia
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--color-charcoal)] sm:text-3xl">
          Rezervácia odmietnutá
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-stone)]">
          Termín bol označený ako odmietnutý a zákazníčke som poslala e-mail s tým, že sa jej
          ozvem alebo si môže zvoliť iný čas.
        </p>
        {booking ? <SummaryCard booking={booking} /> : null}
        <Link
          href="/"
          className="mt-6 inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-line)] px-5 py-2 text-sm font-semibold text-[var(--color-charcoal)] transition hover:bg-[var(--color-blush)]"
        >
          Späť na úvod
        </Link>
      </Shell>
    );
  }

  if (status === "time-mismatch") {
    return (
      <Shell>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-powder)]">
          Rezervácia
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--color-charcoal)] sm:text-3xl">
          Čas sa nezhoduje
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-stone)]">
          Čas rezervácie sa nezhoduje s pôvodnou požiadavkou. Rezervácia nebola potvrdená.
          Skontroluj údaje a kontaktuj zákazníčku.
        </p>
        {booking ? <SummaryCard booking={booking} /> : null}
        <Link
          href="/"
          className="mt-6 inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-line)] px-5 py-2 text-sm font-semibold text-[var(--color-charcoal)] transition hover:bg-[var(--color-blush)]"
        >
          Späť na úvod
        </Link>
      </Shell>
    );
  }

  if (!booking) {
    return (
      <Shell>
        <h1 className="text-2xl font-semibold text-[var(--color-charcoal)] sm:text-3xl">
          Odkaz nie je platný
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-stone)]">
          {status === "error"
            ? "Pri spracovaní rezervácie nastala chyba. Skús to prosím znova z e-mailu."
            : "Tento potvrdzovací odkaz je neplatný alebo už expiroval. Otvor prosím odkaz priamo z e-mailu so žiadosťou o rezerváciu."}
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-line)] px-5 py-2 text-sm font-semibold text-[var(--color-charcoal)] transition hover:bg-[var(--color-blush)]"
        >
          Späť na úvod
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-powder)]">
        Žiadosť o rezerváciu
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-[var(--color-charcoal)] sm:text-3xl">
        {intent === "decline" ? "Odmietnuť rezerváciu?" : "Potvrdiť rezerváciu?"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-[var(--color-stone)]">
        Skontroluj údaje a vyber, či chceš rezerváciu potvrdiť alebo odmietnuť. Zákazníčke
        sa odošle e-mail až po tvojom kliknutí.
      </p>

      <SummaryCard booking={booking} />

      <form
        method="post"
        action="/api/booking/confirm"
        className="mt-6 flex flex-col gap-3 sm:flex-row"
      >
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          name="action"
          value="confirm"
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-[var(--color-powder)] px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)] shadow-[0_12px_34px_rgba(226,138,180,0.24)] transition hover:bg-[var(--color-charcoal)]"
        >
          Potvrdiť rezerváciu
        </button>
        <button
          type="submit"
          name="action"
          value="decline"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-semibold text-[var(--color-charcoal)] transition hover:bg-[var(--color-blush)]"
        >
          Odmietnuť rezerváciu
        </button>
      </form>
    </Shell>
  );
}
