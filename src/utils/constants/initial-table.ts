import type { AbntTableConfig } from "../../types/table";
import { createRandomUUID } from "../create-random-uuid";

const sampleColumnId = createRandomUUID();
const absorbanceColumnId = createRandomUUID();
const concentrationColumnId = createRandomUUID();

export const initialTable: AbntTableConfig = {
    title: "Tabela 1 - Dados experimentais obtidos em laboratorio",
    source: "Fonte: Elaborado pelos autores.",
    appearance: {
        fontFamily: "Arial",
        fontSize: 12,
        cellPadding: 12,
        textAlign: "center",
        showHorizontalBorders: true,
    },
    columns: [
        { id: sampleColumnId, label: "Amostra" },
        { id: absorbanceColumnId, label: "Absorbancia" },
        { id: concentrationColumnId, label: "Concentração" },
    ],
    rows: [
        {
            id: createRandomUUID(),
            values: {
                [sampleColumnId]: "Amostra 1",
                [absorbanceColumnId]: "0,245",
                [concentrationColumnId]: "10 mg/L",
            },
        },
        {
            id: createRandomUUID(),
            values: {
                [sampleColumnId]: "Amostra 2",
                [absorbanceColumnId]: "0,381",
                [concentrationColumnId]: "20 mg/L",
            },
        },
    ],
};
