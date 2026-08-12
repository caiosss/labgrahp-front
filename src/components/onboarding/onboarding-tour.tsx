import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Check, ChevronLeft, ChevronRight, Lightbulb, X } from "lucide-react";
import type { OnboardingStep } from "../../types/onboarding";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

interface OnboardingTourProps {
  currentStepIndex: number;
  isOpen: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  steps: OnboardingStep[];
}

interface TargetRect {
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
}

const getTargetRect = (target: HTMLElement): TargetRect => {
  const rect = target.getBoundingClientRect();
  return { height: rect.height, left: rect.left, right: rect.right, top: rect.top, width: rect.width };
};

const getHighlightStyle = (targetRect?: TargetRect): CSSProperties => {
  if (!targetRect) return { bottom: "1rem", left: "1rem", right: "1rem", top: "1rem" };
  return {
    height: Math.max(targetRect.height + 16, 56),
    left: Math.max(targetRect.left - 8, 8),
    top: Math.max(targetRect.top - 8, 8),
    width: Math.min(Math.max(targetRect.width + 16, 56), window.innerWidth - 16),
  };
};

const getTooltipStyle = (targetRect?: TargetRect): CSSProperties => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (!targetRect || viewportWidth < 768) {
    return {
      bottom: "calc(0.75rem + env(safe-area-inset-bottom))",
      left: 12,
      right: 12,
    };
  }

  const gap = 16;
  const tooltipWidth = 380;
  const tooltipHeight = 310;
  const fitsRight = targetRect.right + gap + tooltipWidth <= viewportWidth - 16;
  const fitsLeft = targetRect.left - gap - tooltipWidth >= 16;
  const left = fitsRight
    ? targetRect.right + gap
    : fitsLeft
      ? targetRect.left - gap - tooltipWidth
      : Math.min(Math.max(targetRect.left, 16), viewportWidth - tooltipWidth - 16);

  return {
    left,
    maxWidth: tooltipWidth,
    top: Math.min(Math.max(targetRect.top, 16), viewportHeight - tooltipHeight - 16),
    width: tooltipWidth,
  };
};

export const OnboardingTour = ({
  currentStepIndex,
  isOpen,
  onNext,
  onPrevious,
  onSkip,
  steps,
}: OnboardingTourProps) => {
  const currentStep = steps[currentStepIndex];
  const [targetRect, setTargetRect] = useState<TargetRect>();
  const dialogRef = useRef<HTMLElement>(null);
  const isLastStep = currentStepIndex === steps.length - 1;

  useEffect(() => {
    if (!isOpen || !currentStep) return;
    const target = document.querySelector<HTMLElement>(`[data-tour="${currentStep.target}"]`);

    if (!target) {
      const timeoutId = window.setTimeout(() => setTargetRect(undefined), 0);
      return () => window.clearTimeout(timeoutId);
    }

    target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    const updateTargetRect = () => setTargetRect(getTargetRect(target));
    const timeoutId = window.setTimeout(updateTargetRect, 260);
    updateTargetRect();
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, true);
    const resizeObserver = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(updateTargetRect);
    resizeObserver?.observe(target);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
      resizeObserver?.disconnect();
    };
  }, [currentStep, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onSkip();
      if (event.key === "ArrowRight") onNext();
      if (event.key === "ArrowLeft" && currentStepIndex > 0) onPrevious();
    };
    window.addEventListener("keydown", handleKeyDown);
    const timeoutId = window.setTimeout(() => dialogRef.current?.focus(), 300);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentStepIndex, isOpen, onNext, onPrevious, onSkip]);

  const highlightStyle = useMemo(() => getHighlightStyle(targetRect), [targetRect]);
  const tooltipStyle = useMemo(() => getTooltipStyle(targetRect), [targetRect]);

  if (!isOpen || !currentStep) return null;

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-0 z-50">
      <div className="fixed rounded-2xl border-2 border-blue-400 bg-blue-400/5 shadow-[0_0_0_9999px_rgba(15,23,42,0.72)] transition-all duration-300" style={highlightStyle} />

      <aside
        aria-describedby="tour-description"
        aria-labelledby="tour-title"
        aria-modal="true"
        className="pointer-events-auto fixed overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-2xl outline-none"
        ref={dialogRef}
        role="dialog"
        style={tooltipStyle}
        tabIndex={-1}
      >
        <div className="border-b border-slate-100 px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Lightbulb size={18} /></span>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">Passo {currentStepIndex + 1} de {steps.length}</span>
                <h2 className="mt-1 text-base font-semibold" id="tour-title">{currentStep.title}</h2>
              </div>
            </div>
            <Button aria-label="Fechar tutorial" onClick={onSkip} size="icon" variant="outline"><X size={17} /></Button>
          </div>
          <Progress className="mt-4" value={((currentStepIndex + 1) / steps.length) * 100} />
        </div>

        <div className="px-5 py-4">
          <p className="text-sm leading-6 text-slate-600" id="tour-description">{currentStep.description}</p>
          {currentStep.example && (
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-blue-950">
              <strong className="font-semibold">Exemplo:</strong> {currentStep.example}
            </div>
          )}
          <div className="mt-5 flex items-center justify-between gap-2">
            <Button disabled={currentStepIndex === 0} onClick={onPrevious} variant="outline"><ChevronLeft size={16} /> Voltar</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={onNext}>
              {isLastStep ? <><Check size={16} /> Concluir</> : <>Próximo <ChevronRight size={16} /></>}
            </Button>
          </div>
          <button className="mx-auto mt-3 block text-xs text-slate-500 hover:text-slate-800" onClick={onSkip}>Pular tutorial</button>
        </div>
      </aside>
    </div>
  );
};
