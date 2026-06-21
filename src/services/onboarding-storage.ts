import type { OnboardingTourId } from "../types/onboarding";

const ONBOARDING_STORAGE_KEY = "labgraph-onboarding";

type SeenToursStorage = Partial<Record<OnboardingTourId, boolean>>;

const readSeenTours = (): SeenToursStorage => {
    const storedValue = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);

    if (!storedValue) {
        return {};
    }

    try {
        return JSON.parse(storedValue) as SeenToursStorage;
    } catch {
        return {};
    }
};

export const hasSeenOnboardingTour = (tourId: OnboardingTourId) => {
    const seenTours = readSeenTours();

    return Boolean(seenTours[tourId]);
};

export const setOnboardingTourSeen = (
    tourId: OnboardingTourId,
    seen: boolean,
) => {
    const seenTours = readSeenTours();
    const nextSeenTours = {
        ...seenTours,
        [tourId]: seen,
    };

    window.localStorage.setItem(
        ONBOARDING_STORAGE_KEY,
        JSON.stringify(nextSeenTours),
    );
};
