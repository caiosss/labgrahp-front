"use client";

import { useState } from "react";
import { HomePage } from "./pages/home";
import { TableEditorPage } from "./pages/table-editor";
import { ChartEditorPage } from "./pages/chart-editor";
import type { ProjectDto } from "./types/project-dto";
import { ThemeToggle } from "./components/theme/theme-toggle";
import { useAppTheme } from "./hooks/use-app-theme";



type Screen =
  | { type: "home" }
  | { type: "chart-editor"; projectId?: string }
  | { type: "table-editor"; projectId?: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ type: "home" });
  const appTheme = useAppTheme();

  const openProject = (project: ProjectDto) => {
    setScreen({
      type: project.type === "chart" ? "chart-editor" : "table-editor",
      projectId: project.id,
    });
  };

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
