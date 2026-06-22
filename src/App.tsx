"use client";

import { useEffect, useState } from "react";
import { HomePage } from "./pages/home";
import { TableEditorPage } from "./pages/table-editor";
import { ChartEditorPage } from "./pages/chart-editor";
import type { ProjectDto } from "./types/project-dto";
import { ThemeToggle } from "./components/theme/theme-toggle";
import { useAppTheme } from "./hooks/use-app-theme";
import { fetchSharedProject } from "./services/share-api";
import { useProjectStore } from "./store/project-store";
import { createRandomUUID } from "./utils/create-random-uuid";



type Screen =
  | { type: "home" }
  | { type: "shared-loading" }
  | { type: "chart-editor"; projectId?: string }
  | { type: "table-editor"; projectId?: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ type: "home" });
  const appTheme = useAppTheme();
  const upsertProject = useProjectStore((state) => state.upsertProject);

  useEffect(() => {
    const shareMatch = window.location.pathname.match(/^\/share\/([^/]+)$/);

    if (!shareMatch) {
      return;
    }

    let shouldUpdateState = true;

    const openSharedProject = async () => {
      setScreen({ type: "shared-loading" });

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

        if (shouldUpdateState) {
          upsertProject(sharedProject);
          setScreen({
            type: sharedProject.type === "chart" ? "chart-editor" : "table-editor",
            projectId: sharedProject.id,
          });
        }
      } catch (error) {
        console.warn("Não foi possível abrir o projeto compartilhado.", error);

        if (shouldUpdateState) {
          setScreen({ type: "home" });
        }
      }
    };

    void openSharedProject();

    return () => {
      shouldUpdateState = false;
    };
  }, [upsertProject]);

  const openProject = (project: ProjectDto) => {
    setScreen({
      type: project.type === "chart" ? "chart-editor" : "table-editor",
      projectId: project.id,
    });
  };

  if (screen.type === "shared-loading") {
    return (
      <>
        <ThemeToggle theme={appTheme.theme} onToggle={appTheme.toggleTheme} />
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <p className="text-sm text-slate-600">Abrindo projeto compartilhado...</p>
        </main>
      </>
    );
  }

  if (screen.type === "chart-editor") {
    return (
      <>
        <ThemeToggle theme={appTheme.theme} onToggle={appTheme.toggleTheme} />
        <ChartEditorPage
          projectId={screen.projectId}
          onBack={() => setScreen({ type: "home" })}
        />
      </>
    );
  }

  if (screen.type === "table-editor") {
    return (
      <>
        <ThemeToggle theme={appTheme.theme} onToggle={appTheme.toggleTheme} />
        <TableEditorPage
          projectId={screen.projectId}
          onBack={() => setScreen({ type: "home" })}
        />
      </>
    );
  }

  return (
    <>
      <ThemeToggle theme={appTheme.theme} onToggle={appTheme.toggleTheme} />
      <HomePage
        logoSrc={appTheme.logoSrc}
        onCreateChart={() => setScreen({ type: "chart-editor" })}
        onCreateTable={() => setScreen({ type: "table-editor" })}
        onOpenProject={openProject}
      />
    </>
  );
}
