"use client";

import { useState } from "react";
import { HomePage } from "./pages/home";
import { TableEditorPage } from "./pages/table-editor";
import { ChartEditorPage } from "./pages/chart-editor";
import type { ProjectDto } from "./types/project-dto";



type Screen =
  | { type: "home" }
  | { type: "chart-editor"; projectId?: string }
  | { type: "table-editor"; projectId?: string };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ type: "home" });

  const openProject = (project: ProjectDto) => {
    setScreen({
      type: project.type === "chart" ? "chart-editor" : "table-editor",
      projectId: project.id,
    });
  };

   if (screen.type === "chart-editor") {
    return (
      <ChartEditorPage
        projectId={screen.projectId}
        onBack={() => setScreen({ type: "home" })}
      />
    );
  }

  if (screen.type === "table-editor") {
    return (
      <TableEditorPage
        projectId={screen.projectId}
        onBack={() => setScreen({ type: "home" })}
      />
    );
  }

  return (
    <HomePage
      onCreateChart={() => setScreen({ type: "chart-editor" })}
      onCreateTable={() => setScreen({ type: "table-editor" })}
      onOpenProject={openProject}
    />
  );
}
