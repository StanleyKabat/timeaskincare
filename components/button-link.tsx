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
          "border border-[rgba(226,138,180,0.45)] bg-[linear-gradient(135deg,#d979a8_0%,#e28ab4_100%)] text-[#1c1718] shadow-[0_12px_34px_rgba(217,121,168,0.28)] hover:brightness-105",
        variant === "secondary" &&
          "border border-[rgba(247,241,235,0.32)] bg-[rgba(14,10,14,0.55)] text-[var(--color-charcoal)] hover:border-[rgba(226,138,180,0.45)] hover:bg-[rgba(226,138,180,0.08)]",
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
