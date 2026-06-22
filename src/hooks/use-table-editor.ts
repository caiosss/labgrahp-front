import { useEffect, useRef, useState } from "react";
import type { AbntColumn, AbntRow, AbntTableConfig } from "../types/table";
import { useProjectStore } from "../store/project-store";
import { initialTable } from "../utils/constants/initial-table";
import { createRandomUUID } from "../utils/create-random-uuid";
import { exportElementAsPNG } from "../utils/export-png";
import { cloneProjectConfig, createTableProjectDto } from "../utils/project-dto";
import {
    deleteTableDraftFromApi,
    saveProjectToApi,
    saveTableDraftToApi,
} from "../services/project-api";

export const useTableEditor = (projectId?: string) => {
    const getProjectById = useProjectStore((state) => state.getProjectById);
    const upsertProject = useProjectStore((state) => state.upsertProject);
    const tableDraft = useProjectStore((state) => state.tableDraft);
    const setTableDraft = useProjectStore((state) => state.setTableDraft);
    const clearTableDraft = useProjectStore((state) => state.clearTableDraft);
    const sourceProject = projectId ? getProjectById(projectId) : undefined;

    const matchingDraft =
        tableDraft &&
            (!sourceProject ||
                (sourceProject.type === "table" && tableDraft.projectId === sourceProject.id))
            ? tableDraft
            : undefined;
    
            const sourceTable = sourceProject?.type === "table" ? sourceProject.table : matchingDraft?.table ?? initialTable;

    const previewRef = useRef<HTMLDivElement>(null);
    const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(
        sourceProject?.type === "table" ? sourceProject.id : undefined,
    );
    const [lastSavedAt, setLastSavedAt] = useState<string | undefined>(
        sourceProject?.type === "table" ? sourceProject.updatedAt : undefined,
    );
    const [table, setTable] = useState<AbntTableConfig>(() =>
        cloneProjectConfig(sourceTable),
    );

    const currentDraftIdRef = useRef<string | undefined>(matchingDraft?.id);

    const exportPNG = async () => {
        if (!previewRef.current) {
            return;
        }

        await exportElementAsPNG(
            previewRef.current,
            `${table.title || "tabela-abnt"}.png`,
        );
    };

    useEffect(() => {
        const draft = {
            id: currentDraftIdRef.current ?? createRandomUUID(),
            type: "table-draft" as const,
            projectId: currentProjectId,
            schemaVersion: 1 as const,
            updatedAt: new Date().toISOString(),
            table: cloneProjectConfig(table),
        };

        currentDraftIdRef.current = draft.id;
        setTableDraft(draft);

        const timeoutId = window.setTimeout(() => {
            void saveTableDraftToApi(draft).catch((error) => {
                console.warn("Não foi possível salvar o rascunho da tabela.", error);
            });
        }, 700);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [table, currentProjectId, setTableDraft]);

    const updateTable = <K extends keyof AbntTableConfig>(
        key: K,
        value: AbntTableConfig[K],
    ) => {
        setTable((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const updateAppearance = <K extends keyof AbntTableConfig["appearance"]>(
        key: K,
        value: AbntTableConfig["appearance"][K],
    ) => {
        setTable((current) => ({
            ...current,
            appearance: {
                ...current.appearance,
                [key]: value,
            },
        }));
    };

    const updateColumnLabel = (columnId: string, label: string) => {
        setTable((current) => ({
            ...current,
            columns: current.columns.map((column) =>
                column.id === columnId ? { ...column, label } : column,
            ),
        }));
    };

    const addColumn = () => {
        const newColumn: AbntColumn = {
            id: createRandomUUID(),
            label: `Coluna ${table.columns.length + 1}`,
        };

        setTable((current) => ({
            ...current,
            columns: [...current.columns, newColumn],
            rows: current.rows.map((row) => ({
                ...row,
                values: {
                    ...row.values,
                    [newColumn.id]: "",
                },
            })),
        }));
    };

    const removeColumn = (columnId: string) => {
        setTable((current) => ({
            ...current,
            columns: current.columns.filter((column) => column.id !== columnId),
            rows: current.rows.map((row) => {
                const values = { ...row.values };
                delete values[columnId];

                return {
                    ...row,
                    values,
                };
            }),
        }));
    };

    const addRow = () => {
        setTable((current) => {
            const values: Record<string, string> = {};

            current.columns.forEach((column) => {
                values[column.id] = "";
            });

            const newRow: AbntRow = {
                id: createRandomUUID(),
                values,
            };

            return {
                ...current,
                rows: [...current.rows, newRow],
            };
        });
    };

    const removeRow = (rowId: string) => {
        setTable((current) => ({
            ...current,
            rows: current.rows.filter((row) => row.id !== rowId),
        }));
    };

    const updateCell = (rowId: string, columnId: string, value: string) => {
        setTable((current) => ({
            ...current,
            rows: current.rows.map((row) =>
                row.id === rowId
                    ? {
                        ...row,
                        values: {
                            ...row.values,
                            [columnId]: value,
                        },
                    }
                    : row,
            ),
        }));
    };

    const saveProject = async () => {
        const currentProject = currentProjectId
            ? getProjectById(currentProjectId)
            : undefined;
        const projectDto = createTableProjectDto(table, currentProject);
        const savedProject = await saveProjectToApi(projectDto);

        upsertProject(savedProject);
        setCurrentProjectId(savedProject.id);
        setLastSavedAt(savedProject.updatedAt);

        return savedProject;
    };

    const clearTable = () => {
        clearTableDraft();
        currentDraftIdRef.current = undefined;
        setLastSavedAt(undefined);
        setTable(cloneProjectConfig(initialTable));

        void deleteTableDraftFromApi().catch((error) => {
            console.warn("Não foi possível limpar o rascunho da tabela na API.", error);
        });
    };

    return {
        table,
        currentProjectId,
        previewRef,
        lastSavedAt,
        lastDraftSavedAt: tableDraft?.updatedAt,
        exportPNG,
        updateTable,
        updateAppearance,
        updateColumnLabel,
        addColumn,
        removeColumn,
        addRow,
        removeRow,
        updateCell,
        saveProject,
        clearTable,
    };
};
