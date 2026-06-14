import { createContext, useCallback, useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconHelp, PenguinMark } from "@/components/icons";
import { GuidedTour } from "./GuidedTour";
import { TOUR_STEPS } from "./steps";

const TOUR_DONE_KEY = "penguwave-tour-done";

interface OnboardingValue {
  /** Start the guided tour from the beginning. */
  startTour: () => void;
}

const OnboardingContext = createContext<OnboardingValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useOnboarding(): OnboardingValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within an OnboardingProvider");
  return ctx;
}

/**
 * Manages first-time onboarding: shows a "first time here?" prompt once, then a
 * spotlight tour. Completion is remembered in localStorage. The help button can
 * relaunch the tour anytime via `useOnboarding().startTour()`.
 */
export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [promptOpen, setPromptOpen] = useState(() => !localStorage.getItem(TOUR_DONE_KEY));
  const [step, setStep] = useState<number | null>(null);

  const finish = useCallback(() => {
    localStorage.setItem(TOUR_DONE_KEY, "1");
    setStep(null);
    setPromptOpen(false);
  }, []);

  const startTour = useCallback(() => {
    setPromptOpen(false);
    setStep(0);
  }, []);

  const value: OnboardingValue = { startTour };

  return (
    <OnboardingContext.Provider value={value}>
      {children}

      {promptOpen && (
        <FirstTimePrompt
          onYes={startTour}
          onNo={() => {
            localStorage.setItem(TOUR_DONE_KEY, "1");
            setPromptOpen(false);
          }}
        />
      )}

      {step !== null && (
        <GuidedTour
          index={step}
          onNext={() => setStep((s) => Math.min((s ?? 0) + 1, TOUR_STEPS.length - 1))}
          onBack={() => setStep((s) => Math.max((s ?? 0) - 1, 0))}
          onClose={finish}
        />
      )}
    </OnboardingContext.Provider>
  );
}

function FirstTimePrompt({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
      <div className="overlay-in fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden />
      <Card
        role="dialog"
        aria-modal="true"
        aria-labelledby="ftp-title"
        className="modal-pop relative z-10 w-full max-w-sm p-6 text-center"
      >
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ice/15 ring-1 ring-ice-bright/30">
          <PenguinMark className="text-ice-bright" style={{ fontSize: "1.8rem" }} />
        </span>
        <h2 id="ftp-title" className="mt-4 text-lg font-semibold">
          First time here?
        </h2>
        <p className="mt-1.5 text-sm text-ink-muted">
          Take a quick 60-second tour of the console — navigation, triage, filters, and export.
        </p>
        <div className="mt-5 flex items-center justify-center gap-2">
          <Button variant="ghost" size="sm" onClick={onNo}>
            No thanks
          </Button>
          <Button size="sm" onClick={onYes}>
            Show me around
          </Button>
        </div>
      </Card>
    </div>
  );
}

/** Persistent help button — relaunches the guided tour. */
export function HelpButton() {
  const { startTour } = useOnboarding();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={startTour}
      data-tour="help"
      aria-label="Open the guided tour"
    >
      <IconHelp /> <span className="hidden sm:inline">Help &amp; tour</span>
    </Button>
  );
}
