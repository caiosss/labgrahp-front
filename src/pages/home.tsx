import { BarChart3, Table2 } from "lucide-react";

interface HomePageProps {
    onCreateChart: () => void;
    onCreateTable: () => void;
}

export const HomePage = ({ onCreateChart, onCreateTable }: HomePageProps) => {
    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-10">
            <div className="mx-auto max-w-6xl space-y-8 sm:space-y-10">
                <header className="space-y-3">
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                        LabGraph
                    </h1>

                    <p className="max-w-2xl text-slate-600">
                        Crie gráficos científicos e tabelas acadêmicas personalizadas,
                        com controle de dados, eixos, títulos, aparência e exportação.
                    </p>
                </header>

                <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <button
                        onClick={onCreateChart}
                        className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-500 hover:shadow-md sm:rounded-2xl sm:p-6"
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
                        className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-500 hover:shadow-md sm:rounded-2xl sm:p-6"
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

                    <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 sm:p-8">
                        Nenhum projeto salvo ainda.
                    </div>
                </section>
            </div>
        </main>
    );

}
