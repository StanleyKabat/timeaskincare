"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  /** Each step adds 55ms to transition-delay when the element reveals (staggered lists). */
  staggerIndex?: number;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ScrollReveal({ children, className = "", staggerIndex = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [canAnimate, setCanAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const isAlreadyInView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;

    setCanAnimate(true);
    setVisible(isAlreadyInView);

    // Reveal once, then stop observing. Toggling visibility back off when an
    // element leaves the viewport caused constant style/paint churn on every
    // scroll (in both directions), which made scrolling feel janky. Revealing a
    // single time keeps the exact same entrance animation without any per-scroll
    // work afterwards.
    if (isAlreadyInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.04 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const delayMs = staggerIndex > 0 ? staggerIndex * 55 : 0;

  return (
    <div
      ref={ref}
      className={`scroll-reveal${canAnimate && !visible ? " scroll-reveal-pending" : ""}${
        canAnimate && visible ? " scroll-reveal-visible" : ""
      }${className ? ` ${className}` : ""}`.trim()}
      style={delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
