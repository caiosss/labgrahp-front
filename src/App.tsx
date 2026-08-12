"use client";

import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { AppNavigation } from "./components/navigation/app-navigation";
import { ThemeToggle } from "./components/theme/theme-toggle";
import { useAppTheme } from "./hooks/use-app-theme";
import { useAuth } from "./hooks/use-auth";
import { AuthCallbackPage } from "./pages/auth-callback";
import { HomePage } from "./pages/home";
import { fetchSharedProject } from "./services/share-api";
import { useProjectStore } from "./store/project-store";
import type { ProjectDto } from "./types/project-dto";
import { createRandomUUID } from "./utils/create-random-uuid";

const AccountPage = lazy(() =>
  import("./pages/account").then((module) => ({ default: module.AccountPage })),
);
const AuthPage = lazy(() =>
  import("./pages/auth-page").then((module) => ({ default: module.AuthPage })),
);
const ChartEditorPage = lazy(() =>
  import("./pages/chart-editor").then((module) => ({ default: module.ChartEditorPage })),
);
const TableEditorPage = lazy(() =>
  import("./pages/table-editor").then((module) => ({ default: module.TableEditorPage })),
);

const getPathname = () => window.location.pathname.replace(/\/$/, "") || "/";

const getEditorProjectId = (pathname: string, type: "chart" | "table") => {
  const match = pathname.match(new RegExp(`^/editor/${type}/([^/]+)$`));
  return match ? decodeURIComponent(match[1]) : undefined;
};

export default function App() {
  const [pathname, setPathname] = useState(getPathname);
  const [isSharedProjectLoading, setIsSharedProjectLoading] = useState(() =>
    getPathname().startsWith("/share/"),
  );
  const appTheme = useAppTheme();
  const { isLoading: isAuthLoading } = useAuth();
  const upsertProject = useProjectStore((state) => state.upsertProject);

  const navigate = useCallback((path: string, replace = false) => {
    if (replace) window.history.replaceState({}, "", path);
    else if (getPathname() !== path) window.history.pushState({}, "", path);

    setPathname(getPathname());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handlePopState = () => setPathname(getPathname());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const shareMatch = pathname.match(/^\/share\/([^/]+)$/);
    if (!shareMatch) return;

    let active = true;
    const openSharedProject = async () => {
      try {
        const share = await fetchSharedProject(shareMatch[1]);
        const now = new Date().toISOString();
        const sharedProject: ProjectDto = {
          ...share.project,
          id: createRandomUUID(),
          name: `${share.project.name} (compartilhado)`,
          createdAt: now,
          updatedAt: now,
        };

        if (!active) return;
        upsertProject(sharedProject);
        navigate(`/editor/${sharedProject.type}/${sharedProject.id}`, true);
      } catch (error) {
        console.warn("Não foi possível abrir o projeto compartilhado.", error);
        if (active) navigate("/", true);
      } finally {
        if (active) setIsSharedProjectLoading(false);
      }
    };

    void openSharedProject();
    return () => { active = false; };
  }, [navigate, pathname, upsertProject]);

  const openProject = (project: ProjectDto) => {
    navigate(`/editor/${project.type}/${encodeURIComponent(project.id)}`);
  };

  if (pathname === "/auth/callback") return <AuthCallbackPage />;

  const renderPage = () => {
    if (isAuthLoading || isSharedProjectLoading) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <p className="text-sm text-slate-600">
            {isSharedProjectLoading ? "Abrindo projeto compartilhado..." : "Restaurando sua sessão..."}
          </p>
        </main>
      );
    }

    if (pathname === "/login") return <AuthPage mode="login" onNavigate={navigate} />;
    if (pathname === "/register") return <AuthPage mode="register" onNavigate={navigate} />;
    if (pathname === "/account") return <AccountPage onNavigate={navigate} />;

    if (pathname === "/editor/chart" || pathname.startsWith("/editor/chart/")) {
      return <ChartEditorPage onBack={() => navigate("/")} projectId={getEditorProjectId(pathname, "chart")} />;
    }

    if (pathname === "/editor/table" || pathname.startsWith("/editor/table/")) {
      return <TableEditorPage onBack={() => navigate("/")} projectId={getEditorProjectId(pathname, "table")} />;
    }

    return (
      <HomePage
        logoSrc={appTheme.logoSrc}
        onCreateChart={() => navigate("/editor/chart")}
        onCreateTable={() => navigate("/editor/table")}
        onOpenProject={openProject}
      />
    );
  };

  return (
    <>
      <div className="pb-24 md:pb-0">
        <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">Carregando...</main>}>
          {renderPage()}
        </Suspense>
      </div>
      <AppNavigation currentPath={pathname} onNavigate={navigate} />
      <ThemeToggle theme={appTheme.theme} onToggle={appTheme.toggleTheme} />
    </>
  );
}
