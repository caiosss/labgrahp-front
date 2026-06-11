"use client";

import { useState } from "react";
import { HomePage } from "./pages/home";
import { TableEditorPage } from "./pages/table-editor";
import { ChartEditorPage } from "./pages/chart-editor";



type Screen = "home" | "chart-editor" | "table-editor";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");

   if (screen === "chart-editor") {
    return <ChartEditorPage onBack={() => setScreen("home")} />;
  }

  if (screen === "table-editor") {
    return <TableEditorPage onBack={() => setScreen("home")} />;
  }

  return (
    <HomePage
      onCreateChart={() => setScreen("chart-editor")}
      onCreateTable={() => setScreen("table-editor")}
    />
  );
}