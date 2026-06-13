import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { OnboardingStep } from "../../types/onboarding";

interface OnboardingTourProps {
    currentStepIndex: number;
    isOpen: boolean;
    onNext: () => void;
    onPrevious: () => void;
    onSkip: () => void;
    steps: OnboardingStep[];
}

interface TargetRect {
    bottom: number;
    height: number;
    left: number;
    right: number;
    top: number;
    width: number;
}

const getTargetRect = (target: HTMLElement): TargetRect => {
    const rect = target.getBoundingClientRect();

    return {
        bottom: rect.bottom,
        height: rect.height,
        left: rect.left,
        right: rect.right,
        top: rect.top,
        width: rect.width,
    };
};

const getHighlightStyle = (targetRect?: TargetRect): CSSProperties => {
    if (!targetRect) {
        return {
            bottom: "1rem",
            left: "1rem",
            right: "1rem",
            top: "1rem",
        };
    }

    return {
        height: Math.max(targetRect.height + 16, 56),
        left: Math.max(targetRect.left - 8, 8),
        top: Math.max(targetRect.top - 8, 8),
        width: Math.max(targetRect.width + 16, 56),
    };
};

const getTooltipStyle = (targetRect?: TargetRect): CSSProperties => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (!targetRect || viewportWidth < 768) {
        return {
            bottom: 16,
            left: 16,
            right: 16,
        };
    }

    const gap = 16;
    const tooltipWidth = 360;
    const tooltipHeight = 260;
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
        top: Math.min(
            Math.max(targetRect.top, 16),
            viewportHeight - tooltipHeight - 16,
        ),
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
    const [targetRect, setTargetRect] = useState<TargetRect | undefined>();
    const isLastStep = currentStepIndex === steps.length - 1;

    useEffect(() => {
        if (!isOpen || !currentStep) {
            return;
        }

        const target = document.querySelector<HTMLElement>(
            `[data-tour="${currentStep.target}"]`,
        );

        if (!target) {
            const timeoutId = window.setTimeout(() => setTargetRect(undefined), 0);
            return () => window.clearTimeout(timeoutId);
        }

        target.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
        });

        const updateTargetRect = () => {
            setTargetRect(getTargetRect(target));
        };

        const timeoutId = window.setTimeout(updateTargetRect, 250);
        updateTargetRect();

        window.addEventListener("resize", updateTargetRect);
        window.addEventListener("scroll", updateTargetRect, true);

        const resizeObserver =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver(updateTargetRect)
                : undefined;
        resizeObserver?.observe(target);

        return () => {
            window.clearTimeout(timeoutId);
            window.removeEventListener("resize", updateTargetRect);
            window.removeEventListener("scroll", updateTargetRect, true);
            resizeObserver?.disconnect();
        };
    }, [currentStep, isOpen]);

    const highlightStyle = useMemo(
        () => getHighlightStyle(targetRect),
        [targetRect],
    );
    const tooltipStyle = useMemo(
        () => getTooltipStyle(targetRect),
        [targetRect],
    );

    if (!isOpen || !currentStep) {
        return null;
    }

    return (
        <div aria-live="polite" className="fixed inset-0 z-50 pointer-events-none">
            <div
                className="fixed rounded-2xl border-2 border-blue-300 shadow-[0_0_0_9999px_rgba(15,23,42,0.72)] transition-all duration-200"
                style={highlightStyle}
            />

            <aside
                aria-modal="true"
                className="pointer-events-auto fixed rounded-xl bg-white p-4 shadow-2xl ring-1 ring-slate-200 sm:p-5"
                role="dialog"
                style={tooltipStyle}
            >
                <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                        <span className="text-xs font-medium uppercase tracking-wide text-blue-700">
                            Passo {currentStepIndex + 1} de {steps.length}
                        </span>
                        <h2 className="mt-1 text-base font-semibold text-slate-950">
                            {currentStep.title}
                        </h2>
                    </div>

                    <button
                        aria-label="Pular tutorial"
                        className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        onClick={onSkip}
                    >
                        <X size={18} />
                    </button>
                </div>

                <p className="text-sm leading-6 text-slate-600">
                    {currentStep.description}
                </p>

                {currentStep.example && (
                    <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-950">
                        <strong>Exemplo:</strong> {currentStep.example}
                    </div>
                )}

                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={currentStepIndex === 0}
                        onClick={onPrevious}
                    >
                        <ChevronLeft size={16} />
                        Voltar
                    </button>

                    <div className="flex gap-2">
                        <button
                            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
                            onClick={onSkip}
                        >
                            Pular
                        </button>

                        <button
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
                            onClick={onNext}
                        >
                            {isLastStep ? (
                                <>
                                    Concluir
                                    <Check size={16} />
                                </>
                            ) : (
                                <>
                                    Próximo
                                    <ChevronRight size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
};
