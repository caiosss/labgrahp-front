import { useEffect, useRef, useState } from "react";
import type { ChartAxisConfig, ChartConfig, ChartSeries, DataPoint } from "../types/chart";
import { useProjectStore } from "../store/project-store";
import { initialChart, initialExponentialFit, initialLinearFit } from "../utils/constants/initial-chart";
import { createRandomUUID } from "../utils/create-random-uuid";
import { generateGaussianPeak } from "../utils/generate-gaussian-peak";
import { cloneProjectConfig, createChartProjectDto } from "../utils/project-dto";
import {
    deleteChartDraftFromApi,
    saveChartDraftToApi,
    saveProjectToApi,
} from "../services/project-api";

export const useChartEditor = (projectId?: string) => {
    const getProjectById = useProjectStore((state) => state.getProjectById);
    const upsertProject = useProjectStore((state) => state.upsertProject);
    const chartDraft = useProjectStore((state) => state.chartDraft);
    const setChartDraft = useProjectStore((state) => state.setChartDraft);
    const clearChartDraft = useProjectStore((state) => state.clearChartDraft);
    const sourceProject = projectId ? getProjectById(projectId) : undefined;
    const matchingDraft =
        chartDraft &&
            (!sourceProject ||
                (sourceProject.type === "chart" && chartDraft.projectId === sourceProject.id))
            ? chartDraft
            : undefined;
    const sourceChart =
        matchingDraft?.chart ??
        (sourceProject?.type === "chart" ? sourceProject.chart : initialChart);

    const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(
        sourceProject?.type === "chart" ? sourceProject.id : matchingDraft?.projectId,
    );
    const [lastSavedAt, setLastSavedAt] = useState<string | undefined>(
        sourceProject?.type === "chart" ? sourceProject.updatedAt : undefined,
    );
    const currentDraftIdRef = useRef<string | undefined>(matchingDraft?.id);
    const [chart, setChart] = useState<ChartConfig>(() =>
        cloneProjectConfig(sourceChart),
    );

    useEffect(() => {
        const draft = {
            id: currentDraftIdRef.current ?? createRandomUUID(),
            type: "chart-draft" as const,
            projectId: currentProjectId,
            schemaVersion: 1 as const,
            updatedAt: new Date().toISOString(),
            chart: cloneProjectConfig(chart),
        };

        currentDraftIdRef.current = draft.id;
        setChartDraft(draft);

        const timeoutId = window.setTimeout(() => {
            void saveChartDraftToApi(draft).catch((error) => {
                console.warn("Não foi possível salvar o rascunho do gráfico.", error);
            });
        }, 700);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [chart, currentProjectId, setChartDraft]);

    const updateChart = <K extends keyof ChartConfig>(
        key: K,
        value: ChartConfig[K],
    ) => {
        setChart((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const updateAxis = (
        axis: "xAxis" | "yAxis",
        key: keyof ChartAxisConfig,
        value: string,
    ) => {
        setChart((current) => ({
            ...current,
            [axis]: {
                ...current[axis],
                [key]: value,
            },
        }));
    };

    const updateSeries = (
        seriesId: string,
        key: keyof ChartSeries,
        value: ChartSeries[keyof ChartSeries],
    ) => {
        setChart((current) => ({
            ...current,
            series: current.series.map((serie) =>
                serie.id === seriesId
                    ? {
                        ...serie,
                        [key]: value,
                    }
                    : serie,
            ),
        }));
    };

    const addSeries = () => {
        const newSeries: ChartSeries = {
            id: createRandomUUID(),
            type: "manual",
            name: `Amostra ${chart.series.length + 1}`,
            color: "#16a34a",
            markerSize: "8",
            markerSymbol: "circle",
            lineWidth: "2",
            lineDash: "solid",
            lineShape: "linear",
            exponentialFit: { ...initialExponentialFit },
            linearFit: { ...initialLinearFit },
            points: [
                { id: createRandomUUID(), x: "0", y: "0" },
                { id: createRandomUUID(), x: "1", y: "1" },
            ],
        };

        setChart((current) => ({
            ...current,
            series: [...current.series, newSeries],
        }));
    };

    const removeSeries = (seriesId: string) => {
        setChart((current) => ({
            ...current,
            series: current.series.filter((serie) => serie.id !== seriesId),
        }));
    };

    const addPoint = (seriesId: string) => {
        const newPoint: DataPoint = {
            id: createRandomUUID(),
            x: "",
            y: "",
        };

        setChart((current) => ({
            ...current,
            series: current.series.map((serie) =>
                serie.id === seriesId
                    ? {
                        ...serie,
                        points: [...serie.points, newPoint],
                    }
                    : serie,
            ),
        }));
    };

    const removePoint = (seriesId: string, pointId: string) => {
        setChart((current) => ({
            ...current,
            series: current.series.map((serie) =>
                serie.id === seriesId
                    ? {
                        ...serie,
                        points: serie.points.filter((point) => point.id !== pointId),
                    }
                    : serie,
            ),
        }));
    };

    const updatePoint = (
        seriesId: string,
        pointId: string,
        key: keyof DataPoint,
        value: string,
    ) => {
        setChart((current) => ({
            ...current,
            series: current.series.map((serie) =>
                serie.id === seriesId
                    ? {
                        ...serie,
                        points: serie.points.map((point) =>
                            point.id === pointId
                                ? {
                                    ...point,
                                    [key]: value,
                                }
                                : point,
                        ),
                    }
                    : serie,
            ),
        }));
    };

    const updateAppearance = (
        key: keyof ChartConfig["appearance"],
        value: string,
    ) => {
        setChart((current) => ({
            ...current,
            appearance: {
                ...current.appearance,
                [key]: value,
            },
        }));
    };

    const addGaussianPeakSeries = () => {
        const gaussianPeak = {
            xMin: "320",
            xMax: "800",
            peakX: "660",
            amplitude: "1",
            width: "35",
            baseline: "0.03",
            step: "2",
        };

        const newSeries: ChartSeries = {
            id: createRandomUUID(),
            type: "gaussian-peak",
            name: "Curva de pico",
            color: "#dc2626",
            markerSize: "0",
            markerSymbol: "circle",
            lineWidth: "2",
            lineDash: "solid",
            lineShape: "spline",
            exponentialFit: { ...initialExponentialFit },
            linearFit: { ...initialLinearFit },
            gaussianPeak,
            points: generateGaussianPeak(gaussianPeak),
        };

        setChart((current) => ({
            ...current,
            series: [...current.series, newSeries],
        }));
    };

    const updateGaussianPeak = (
        seriesId: string,
        key: keyof NonNullable<ChartSeries["gaussianPeak"]>,
        value: string,
    ) => {
        setChart((current) => ({
            ...current,
            series: current.series.map((serie) => {
                if (serie.id !== seriesId || !serie.gaussianPeak) {
                    return serie;
                }

                const gaussianPeak = {
                    ...serie.gaussianPeak,
                    [key]: value,
                };

                return {
                    ...serie,
                    gaussianPeak,
                    points: generateGaussianPeak(gaussianPeak),
                };
            }),
        }));
    };

    const saveProject = async () => {
        const currentProject = currentProjectId
            ? getProjectById(currentProjectId)
            : undefined;
        const projectDto = createChartProjectDto(chart, currentProject);
        const savedProject = await saveProjectToApi(projectDto);

        upsertProject(savedProject);
        setCurrentProjectId(savedProject.id);
        setLastSavedAt(savedProject.updatedAt);

        return savedProject;
    };

    const clearChart = () => {
        clearChartDraft();
        currentDraftIdRef.current = undefined;
        setLastSavedAt(undefined);
        setChart(cloneProjectConfig(initialChart));

        void deleteChartDraftFromApi().catch((error) => {
            console.warn("Não foi possível limpar o rascunho do gráfico na API.", error);
        });
    };

    return {
        chart,
        currentProjectId,
        lastSavedAt,
        lastDraftSavedAt: chartDraft?.updatedAt,
        updateChart,
        updateAxis,
        updateSeries,
        addSeries,
        removeSeries,
        addPoint,
        removePoint,
        updatePoint,
        updateAppearance,
        addGaussianPeakSeries,
        updateGaussianPeak,
        saveProject,
        clearChart,
    };
};
