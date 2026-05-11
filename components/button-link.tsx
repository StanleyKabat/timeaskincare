import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export function ButtonLink({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition duration-300 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[var(--color-powder)] focus:ring-offset-2",
        variant === "primary" &&
          "bg-[var(--color-powder)] text-[var(--color-ink)] shadow-[0_12px_34px_rgba(226,138,180,0.24)] hover:bg-[var(--color-charcoal)]",
        variant === "secondary" &&
          "border border-[var(--color-powder)] bg-[var(--color-surface)] text-[var(--color-charcoal)] hover:bg-[var(--color-blush)]",
        variant === "ghost" &&
          "text-[var(--color-charcoal)] hover:bg-[var(--color-blush)]",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
