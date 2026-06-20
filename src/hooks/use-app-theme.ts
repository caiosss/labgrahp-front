import { useCallback, useEffect, useMemo, useState } from "react";

export type AppTheme = "light" | "dark";

const THEME_STORAGE_KEY = "labgraph-theme";

export const APP_LOGOS: Record<AppTheme, string> = {
    dark: "/logo/labgraph-dark.png",
    light: "/logo/labgraph-ligth.png",
};

const getSystemTheme = (): AppTheme => {
    if (typeof window === "undefined") {
        return "light";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
};

const getInitialTheme = (): AppTheme => {
    if (typeof window === "undefined") {
        return "light";
    }

    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    return savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : getSystemTheme();
};

const updateFavicon = (theme: AppTheme) => {
    const favicon =
        document.querySelector<HTMLLinkElement>('link[rel="icon"]') ??
        document.createElement("link");

    favicon.id = "app-favicon";
    favicon.rel = "icon";
    favicon.type = "image/png";
    favicon.href = APP_LOGOS[theme];
    document.head.appendChild(favicon);
};

export const useAppTheme = () => {
    const [theme, setTheme] = useState<AppTheme>(() => getInitialTheme());
    const [hasManualTheme, setHasManualTheme] = useState(() => {
        if (typeof window === "undefined") {
            return false;
        }

        const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
        return savedTheme === "dark" || savedTheme === "light";
    });

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
        updateFavicon(theme);

        const metaThemeColor = document.querySelector<HTMLMetaElement>(
            'meta[name="theme-color"]',
        );

        if (metaThemeColor) {
            metaThemeColor.content = theme === "dark" ? "#020617" : "#f8fafc";
        }
    }, [theme]);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleSystemThemeChange = () => {
            if (!hasManualTheme) {
                setTheme(getSystemTheme());
            }
        };

        mediaQuery.addEventListener("change", handleSystemThemeChange);

        return () => {
            mediaQuery.removeEventListener("change", handleSystemThemeChange);
        };
    }, [hasManualTheme]);

    const toggleTheme = useCallback(() => {
        setTheme((currentTheme) => {
            const nextTheme = currentTheme === "dark" ? "light" : "dark";

            window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
            setHasManualTheme(true);

            return nextTheme;
        });
    }, []);

    return useMemo(
        () => ({
            logoSrc: APP_LOGOS[theme],
            theme,
            toggleTheme,
        }),
        [theme, toggleTheme],
    );
};
