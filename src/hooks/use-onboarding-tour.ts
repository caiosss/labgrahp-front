import { useEffect, useMemo, useState } from "react";
import {
    hasSeenOnboardingTour,
    setOnboardingTourSeen,
} from "../services/onboarding-storage";
import type { OnboardingStep, OnboardingTourId } from "../types/onboarding";

export const useOnboardingTour = (
    tourId: OnboardingTourId,
    steps: OnboardingStep[],
) => {
    const [hasSeenTour, setHasSeenTour] = useState(() =>
        hasSeenOnboardingTour(tourId),
    );
    const [isOpen, setIsOpen] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    useEffect(() => {
        if (!hasSeenTour && steps.length > 0) {
            const timeoutId = window.setTimeout(() => {
                setCurrentStepIndex(0);
                setIsOpen(true);
            }, 0);

            return () => window.clearTimeout(timeoutId);
        }
    }, [hasSeenTour, steps.length]);

    const currentStep = useMemo(
        () => steps[currentStepIndex],
        [currentStepIndex, steps],
    );

    const startTour = () => {
        setCurrentStepIndex(0);
        setIsOpen(true);
    };

    const finishTour = () => {
        setOnboardingTourSeen(tourId, true);
        setHasSeenTour(true);
        setCurrentStepIndex(0);
        setIsOpen(false);
    };

    const nextStep = () => {
        if (currentStepIndex >= steps.length - 1) {
            finishTour();
            return;
        }

        setCurrentStepIndex((current) => current + 1);
    };

    const previousStep = () => {
        setCurrentStepIndex((current) => Math.max(current - 1, 0));
    };

    // Para testar novamente o primeiro acesso, limpe a chave
    // "labgraph-onboarding" no localStorage do navegador.
    const skipTour = finishTour;

    return {
        currentStep,
        currentStepIndex,
        isOpen,
        nextStep,
        previousStep,
        skipTour,
        startTour,
    };
};
