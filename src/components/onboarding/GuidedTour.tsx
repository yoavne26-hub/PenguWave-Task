import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IconClose } from "@/components/icons";
import { TOUR_STEPS } from "./steps";

interface GuidedTourProps {
  index: number;
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
}

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 8;
const TOOLTIP_W = 320;

/** Spotlight overlay that walks through the console, one step at a time. */
export function GuidedTour({ index, onNext, onBack, onClose }: GuidedTourProps) {
  const step = TOUR_STEPS[index];
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [box, setBox] = useState<Box | null>(null);

  const measure = useCallback(() => {
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    if (!el) {
      setBox(null);
      return;
    }
    el.scrollIntoView({ block: "center", behavior: "auto" });
    const r = el.getBoundingClientRect();
    setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step.target]);

  // Switch route if the step lives on another page, then measure the target.
  useLayoutEffect(() => {
    if (step.route && pathname !== step.route) {
      navigate(step.route);
      return; // re-runs once pathname updates
    }
    let raf = 0;
    let tries = 0;
    const tick = () => {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el || tries > 20) {
        measure();
        return;
      }
      tries += 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step.route, step.target, pathname, navigate, measure]);

  // Keep the spotlight aligned on resize/scroll, and wire keyboard controls.
  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" || e.key === "Enter") onNext();
      else if (e.key === "ArrowLeft") onBack();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [measure, onClose, onNext, onBack]);

  const isLast = index === TOUR_STEPS.length - 1;
  const tip = tooltipPosition(box);

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Product tour">
      {/* Click-blocker (no accidental dismiss; use Skip/Esc). */}
      <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} aria-hidden />

      {/* Spotlight: a dimming box-shadow with a cutout around the target. */}
      {box && (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-xl ring-2 ring-ice-bright transition-all duration-200"
          style={{
            top: box.top - PAD,
            left: box.left - PAD,
            width: box.width + PAD * 2,
            height: box.height + PAD * 2,
            boxShadow: "0 0 0 9999px rgba(5, 10, 20, 0.7)",
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        className="modal-pop absolute w-[320px] max-w-[calc(100vw-24px)]"
        style={tip}
      >
        <div className="frost rounded-xl p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ice-cyan/80">
              Step {index + 1} of {TOUR_STEPS.length}
            </span>
            <button
              onClick={onClose}
              aria-label="Skip tour"
              className="text-ink-muted hover:text-ink"
            >
              <IconClose />
            </button>
          </div>
          <h3 className="mt-2 text-base font-semibold text-ink">{step.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{step.body}</p>
          <div className="mt-4 flex items-center justify-between gap-2">
            <button onClick={onClose} className="text-xs text-ink-muted hover:text-ink">
              Skip tour
            </button>
            <div className="flex items-center gap-2">
              {index > 0 && (
                <Button variant="ghost" size="sm" onClick={onBack}>
                  Back
                </Button>
              )}
              <Button size="sm" onClick={isLast ? onClose : onNext}>
                {isLast ? "Done" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Choose a tooltip anchor with the most room: right → below → above → center. */
function tooltipPosition(box: Box | null): React.CSSProperties {
  if (!box) {
    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const clampLeft = (l: number) => Math.max(12, Math.min(l, vw - TOOLTIP_W - 12));

  // Right of the target (good for tall left-rail items).
  if (box.left + box.width + TOOLTIP_W + 24 < vw && box.height > 180) {
    return { left: box.left + box.width + 16, top: Math.max(12, Math.min(box.top, vh - 240)) };
  }
  // Below.
  if (vh - (box.top + box.height) > 200) {
    return { top: box.top + box.height + 14, left: clampLeft(box.left) };
  }
  // Above.
  if (box.top > 220) {
    return { top: box.top - 200, left: clampLeft(box.left) };
  }
  return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
}
