import { BarChart3, Home, LogIn, Table2, UserRound } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../hooks/use-auth";

interface AppNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const AppNavigation = ({ currentPath, onNavigate }: AppNavigationProps) => {
  const { isAuthenticated, user } = useAuth();
  const accountPath = isAuthenticated ? "/account" : "/login";
  const items = [
    { icon: Home, label: "Início", path: "/" },
    { icon: BarChart3, label: "Gráfico", path: "/editor/chart" },
    { icon: Table2, label: "Tabela", path: "/editor/table" },
    {
      icon: isAuthenticated ? UserRound : LogIn,
      label: isAuthenticated ? user?.name.split(" ")[0] || "Conta" : "Entrar",
      path: accountPath,
    },
  ];

  const isActive = (path: string) =>
    path === "/"
      ? currentPath === "/"
      : currentPath === path || currentPath.startsWith(`${path}/`);

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className="app-main-nav fixed left-1/2 top-4 z-40 hidden -translate-x-1/2 items-center gap-1 rounded-2xl border border-slate-200 bg-white/90 p-1.5 shadow-lg shadow-slate-900/5 backdrop-blur md:flex"
      >
        {items.map(({ icon: Icon, label, path }) => (
          <button
            aria-current={isActive(path) ? "page" : undefined}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium transition",
              isActive(path)
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
            )}
            key={path}
            onClick={() => onNavigate(path)}
            type="button"
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>

      <nav
        aria-label="Navegação principal"
        className="pwa-bottom-nav fixed inset-x-2 bottom-2 z-40 grid grid-cols-4 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-2xl shadow-slate-950/15 backdrop-blur md:hidden"
      >
        {items.map(({ icon: Icon, label, path }) => (
          <button
            aria-current={isActive(path) ? "page" : undefined}
            className={cn(
              "flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium transition",
              isActive(path)
                ? "bg-slate-900 text-white"
                : "text-slate-600 active:bg-slate-100",
            )}
            key={path}
            onClick={() => onNavigate(path)}
            type="button"
          >
            <Icon size={19} />
            <span className="max-w-full truncate">{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};
