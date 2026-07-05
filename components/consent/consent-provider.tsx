"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  applyConsentUpdate,
  readStoredConsent,
  writeStoredConsent,
  type ConsentState,
} from "@/lib/consent";

type ConsentContextValue = {
  /** True once the component has mounted on the client (avoids SSR flash). */
  mounted: boolean;
  /** True once the user has made (or previously stored) a consent choice. */
  decided: boolean;
  consent: ConsentState;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  save: (next: ConsentState) => void;
  acceptAll: () => void;
  rejectOptional: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }
  return ctx;
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [decided, setDecided] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({
    analytics: false,
    marketing: false,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = readStoredConsent();
    if (stored) {
      setConsent(stored);
      setDecided(true);
      // Re-apply the stored choice to Consent Mode before any tag loads.
      applyConsentUpdate(stored);
    }
  }, []);

  const save = useCallback((next: ConsentState) => {
    writeStoredConsent(next);
    setConsent(next);
    setDecided(true);
    applyConsentUpdate(next);
    setSettingsOpen(false);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      mounted,
      decided,
      consent,
      settingsOpen,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
      save,
      acceptAll: () => save({ analytics: true, marketing: true }),
      rejectOptional: () => save({ analytics: false, marketing: false }),
    }),
    [mounted, decided, consent, settingsOpen, save],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}
