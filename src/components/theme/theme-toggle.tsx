import { Moon, Sun } from "lucide-react";
import type { AppTheme } from "../../hooks/use-app-theme";

interface ThemeToggleProps {
    onToggle: () => void;
    theme: AppTheme;
}

export const ThemeToggle = ({ onToggle, theme }: ThemeToggleProps) => {
    const isDarkTheme = theme === "dark";

    return (
        <button
            aria-label={
                isDarkTheme ? "Ativar modo claro" : "Ativar modo escuro"
            }
            className="fixed right-4 top-4 z-40 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 sm:right-6 sm:top-6"
            onClick={onToggle}
            title={isDarkTheme ? "Modo claro" : "Modo escuro"}
        >
            {isDarkTheme ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
};
