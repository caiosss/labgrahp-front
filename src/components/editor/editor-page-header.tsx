import { ArrowLeft, Save } from "lucide-react";

interface EditorPageHeaderProps {
    title: string;
    description: string;
    onBack: () => void;
    onSave: () => void;
    lastSavedAt?: string;
}

export const EditorPageHeader = ({
    title,
    description,
    onBack,
    onSave,
    lastSavedAt,
}: EditorPageHeaderProps) => {
    const savedLabel = lastSavedAt
        ? `Salvo as ${new Date(lastSavedAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        })}`
        : "Nao salvo";

    return (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <button
                    onClick={onBack}
                    className="mb-3 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft size={16} />
                    Voltar
                </button>

                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                    {title}
                </h1>

                <p className="max-w-2xl text-sm text-slate-600">
                    {description}
                </p>
            </div>

            <div className="flex flex-col items-stretch gap-2 sm:items-end">
                <button
                    onClick={onSave}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                    <Save size={16} />
                    Salvar projeto
                </button>

                <span className="text-xs text-slate-500">{savedLabel}</span>
            </div>
        </header>
    );
};
