import { Quote } from "lucide-react";

type ReviewCardProps = {
  service: string;
  text: string;
};

export function ReviewCard({ service, text }: ReviewCardProps) {
  return (
    <article className="interactive-card flex h-full flex-col rounded-lg border border-[var(--color-line)] bg-[linear-gradient(145deg,var(--color-surface),var(--color-surface-elevated))] p-4 shadow-[0_22px_55px_rgba(0,0,0,0.18)] sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5 sm:gap-4">
        <p className="rounded-full bg-[var(--color-blush)] px-3 py-1 text-xs font-semibold text-[var(--color-powder)]">
          {service}
        </p>
        <Quote className="shrink-0 text-[var(--color-powder)]" size={20} />
      </div>
      <blockquote className="text-sm leading-6 text-[var(--color-charcoal)] sm:leading-7">
        “{text}”
      </blockquote>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-stone)] sm:mt-5 sm:tracking-[0.16em]">
        Zákazníčka Timea Skincare
      </p>
    </article>
  );
}
