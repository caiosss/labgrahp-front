import type { AbntTableConfig } from "../../types/table";
import { createRandomUUID } from "../create-random-uuid";

export const initialTable: AbntTableConfig = {
  title: "Tabela 1 – Dados experimentais obtidos em laboratório",
  source: "Fonte: Elaborado pelos autores.",
  appearance: {
    fontFamily: "Arial",
    fontSize: 12,
    cellPadding: 12,
    textAlign: "center",
    showHorizontalBorders: true,
  },
  columns: [
    { id: createRandomUUID(), label: "Amostra" },
    { id: createRandomUUID(), label: "Absorbância" },
    { id: createRandomUUID(), label: "Concentração" },
  ],
  rows: [],
};