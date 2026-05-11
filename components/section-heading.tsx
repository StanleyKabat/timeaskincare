type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  text?: string;
};

export function SectionHeading({ eyebrow, title, text }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-powder)] sm:mb-3 sm:text-sm sm:tracking-[0.18em]">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-[1.75rem] font-semibold leading-[1.12] text-[var(--color-charcoal)] sm:text-4xl sm:leading-tight">
        {title}
      </h1>
      {text ? (
        <p className="mt-3 text-sm leading-6 text-[var(--color-stone)] sm:mt-4 sm:text-base sm:leading-7">
          {text}
        </p>
      ) : null}
    </div>
  );
}
