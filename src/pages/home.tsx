import { BarChart3, Table2 } from "lucide-react";
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

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-10">
            <div className="mx-auto max-w-6xl space-y-8 sm:space-y-10">
                <header className="flex flex-col gap-4 pr-12 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
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

                    {projects.length === 0 && !chartDraft ? (
                        <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 sm:p-8">
                            Nenhum projeto salvo ainda.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {projects.map((project) => (
                                <button
                                    key={project.id}
                                    onClick={() => onOpenProject(project)}
                                    className="cursor-pointer rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-500 hover:bg-slate-50"
                                >
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                        <span className="font-medium text-slate-900">
                                            {project.name}
                                        </span>

                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                            {project.type === "chart" ? "Grafico" : "Tabela"}
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-500">
                                        Atualizado em{" "}
                                        {new Date(project.updatedAt).toLocaleString("pt-BR")}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );

}
