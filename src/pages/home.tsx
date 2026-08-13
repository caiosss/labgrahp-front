import { BarChart3, LoaderCircle, Table2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
    fetchChartDraft,
    deleteProjectFromApi,
    fetchProjects,
    fetchTableDraft,
} from "../services/project-api";
import { Button } from "../components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";
import { logClientError } from "../services/client-logger";
import { useProjectStore } from "../store/project-store";
import type { ProjectDto } from "../types/project-dto";

interface HomePageProps {
    logoSrc: string;
    onCreateChart: () => void;
    onCreateTable: () => void;
    onOpenProject: (project: ProjectDto) => void;
}

export const HomePage = ({
    logoSrc,
    onCreateChart,
    onCreateTable,
    onOpenProject,
}: HomePageProps) => {
    const projects = useProjectStore((state) => state.projects);
    const chartDraft = useProjectStore((state) => state.chartDraft);
    const tableDraft = useProjectStore((state) => state.tableDraft);
    const mergeProjects = useProjectStore((state) => state.mergeProjects);
    const setChartDraft = useProjectStore((state) => state.setChartDraft);
    const setTableDraft = useProjectStore((state) => state.setTableDraft);
    const removeProject = useProjectStore((state) => state.removeProject);
    const [projectsLoadError, setProjectsLoadError] = useState<string>();
    const [projectToDelete, setProjectToDelete] = useState<ProjectDto>();
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string>();

    const handleDeleteProject = async () => {
        if (!projectToDelete || isDeleting) return;

        setIsDeleting(true);
        setDeleteError(undefined);

        try {
            await deleteProjectFromApi(projectToDelete.id);
            removeProject(projectToDelete.id);
            setProjectToDelete(undefined);
        } catch (error) {
            setDeleteError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível excluir o projeto.",
            );
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        let shouldUpdateState = true;

        const loadRemoteState = async () => {
            const [projectsResult, chartDraftResult, tableDraftResult] =
                await Promise.allSettled([
                    fetchProjects(),
                    fetchChartDraft(),
                    fetchTableDraft(),
                ]);

            if (!shouldUpdateState) {
                return;
            }

            if (projectsResult.status === "fulfilled") {
                mergeProjects(projectsResult.value);
                setProjectsLoadError(undefined);
            } else {
                logClientError("home-load-projects", projectsResult.reason);
                setProjectsLoadError(
                    projectsResult.reason instanceof Error
                        ? projectsResult.reason.message
                        : "Não foi possível carregar seus projetos agora.",
                );
            }

            if (chartDraftResult.status === "fulfilled" && chartDraftResult.value) {
                setChartDraft(chartDraftResult.value);
            }

            if (chartDraftResult.status === "rejected") {
                logClientError("home-load-chart-draft", chartDraftResult.reason);
            }

            if (tableDraftResult.status === "fulfilled" && tableDraftResult.value) {
                setTableDraft(tableDraftResult.value);
            }

            if (tableDraftResult.status === "rejected") {
                logClientError("home-load-table-draft", tableDraftResult.reason);
            }
        };

        void loadRemoteState();

        return () => {
            shouldUpdateState = false;
        };
    }, [mergeProjects, setChartDraft, setTableDraft]);

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-10 md:pt-20">
            <div className="mx-auto max-w-6xl space-y-8 sm:space-y-10">
                <header className="flex flex-col gap-4 pr-12 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4 sm:items-center">
                        <img
                            alt="LabGraph"
                            className="h-16 w-16 rounded-2xl object-cover shadow-sm ring-1 ring-slate-200 sm:h-20 sm:w-20"
                            src={logoSrc}
                        />

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                                LabGraph
                            </h1>

                            <p className="max-w-2xl text-slate-600">
                                Crie gráficos e tabelas acadêmicas personalizadas,
                                com controle de dados, eixos, títulos, aparência e exportação.
                            </p>
                        </div>
                    </div>
                </header>

                <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <button
                        onClick={onCreateChart}
                        className="rainbow-action-card cursor-pointer rounded-xl border border-slate-200 p-4 text-left shadow-sm transition hover:border-blue-500 hover:shadow-md sm:rounded-2xl sm:p-6"
                    >
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                            <BarChart3 className="text-blue-600" />
                        </div>

                        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                            Criar gráfico
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                            Insira pontos X/Y manualmente, personalize os eixos, título,
                            legenda, grade, escala e exporte com preview.
                        </p>
                    </button>

                    <button
                        onClick={onCreateTable}
                        className="rainbow-action-card cursor-pointer rounded-xl border border-slate-200 p-4 text-left shadow-sm transition hover:border-blue-500 hover:shadow-md sm:rounded-2xl sm:p-6"
                    >
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                            <Table2 className="text-blue-600" />
                        </div>

                        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                            Criar tabela ABNT
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                            Monte tabelas acadêmicas com título, colunas, linhas, fonte
                            e exportação para imagem.
                        </p>
                    </button>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">
                        Projetos recentes
                    </h2>

                    {projectsLoadError && (
                        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800" role="status">
                            Não foi possível atualizar seus projetos: {projectsLoadError}
                        </p>
                    )}

                    {tableDraft && (
                        <button
                            onClick={onCreateTable}
                            className="mb-3 w-full cursor-pointer rounded-xl border border-blue-200 bg-blue-50 p-4 text-left transition hover:border-blue-500"
                        >
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <span className="font-medium text-blue-950">
                                    Rascunho de tabela
                                </span>

                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                                    Autosalvo
                                </span>
                            </div>

                            <p className="text-xs text-blue-700">
                                Atualizado em{" "}
                                {new Date(tableDraft.updatedAt).toLocaleString("pt-BR")}
                            </p>
                        </button>
                    )}

                    {chartDraft && (
                        <button
                            onClick={onCreateChart}
                            className="mb-3 w-full cursor-pointer rounded-xl border border-blue-200 bg-blue-50 p-4 text-left transition hover:border-blue-500"
                        >
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <span className="font-medium text-blue-950">
                                    Rascunho de gráfico
                                </span>

                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                                    Autosalvo
                                </span>
                            </div>

                            <p className="text-xs text-blue-700">
                                Atualizado em{" "}
                                {new Date(chartDraft.updatedAt).toLocaleString("pt-BR")}
                            </p>
                        </button>
                    )}

                    {projects.length === 0 && !chartDraft && !tableDraft ? (
                        <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 sm:p-8">
                            Nenhum projeto salvo ainda.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="flex items-stretch rounded-xl border border-slate-200 transition hover:border-blue-500 hover:bg-slate-50"
                                >
                                    <button
                                        className="min-w-0 flex-1 cursor-pointer p-4 text-left"
                                        onClick={() => onOpenProject(project)}
                                    >
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <span className="truncate font-medium text-slate-900">
                                                {project.name}
                                            </span>

                                            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                                {project.type === "chart" ? "Gráfico" : "Tabela"}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-500">
                                            Atualizado em{" "}
                                            {new Date(project.updatedAt).toLocaleString("pt-BR")}
                                        </p>
                                    </button>

                                    <button
                                        aria-label={`Excluir ${project.name}`}
                                        className="m-2 flex w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                        onClick={() => {
                                            setDeleteError(undefined);
                                            setProjectToDelete(project);
                                        }}
                                        title="Excluir projeto"
                                        type="button"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <Dialog
                open={Boolean(projectToDelete)}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setProjectToDelete(undefined);
                        setDeleteError(undefined);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Excluir projeto?</DialogTitle>
                        <DialogDescription>
                            O projeto “{projectToDelete?.name}” deixará de aparecer na sua lista. Esta ação não pode ser desfeita pela interface.
                        </DialogDescription>
                    </DialogHeader>

                    {deleteError && (
                        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                            {deleteError}
                        </p>
                    )}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button disabled={isDeleting} type="button" variant="outline">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button
                            disabled={isDeleting}
                            onClick={() => void handleDeleteProject()}
                            type="button"
                            variant="destructive"
                        >
                            {isDeleting ? (
                                <LoaderCircle className="animate-spin" size={17} />
                            ) : (
                                <Trash2 size={17} />
                            )}
                            {isDeleting ? "Excluindo..." : "Excluir projeto"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );

}
