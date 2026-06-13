import { ArrowLeft, Eraser, HelpCircle, Save } from "lucide-react";

interface EditorPageHeaderProps {
    title: string;
    description: string;
    onBack: () => void;
    onSave: () => void;
    onClear?: () => void;
    onStartTour?: () => void;
    lastSavedAt?: string;
    lastDraftSavedAt?: string;
    clearLabel?: string;
    tourLabel?: string;
}

export const EditorPageHeader = ({
    title,
    description,
    onBack,
    onSave,
    onClear,
    onStartTour,
    lastSavedAt,
    lastDraftSavedAt,
    clearLabel = "Limpar campos",
    tourLabel = "Tutorial",
}: EditorPageHeaderProps) => {
    const savedLabel = lastSavedAt
        ? `Salvo as ${new Date(lastSavedAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        })}`
        : "Não salvo";
    const draftLabel = lastDraftSavedAt
        ? `Rascunho salvo automaticamente as ${new Date(lastDraftSavedAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        })}`
        : undefined;

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
                <div className="flex flex-col gap-2 sm:flex-row">
                    {onStartTour && (
                        <button
                            onClick={onStartTour}
                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                            <HelpCircle size={16} />
                            {tourLabel}
                        </button>
                    )}

                    {onClear && (
                        <button
                            onClick={onClear}
                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                        >
                            <Eraser size={16} />
                            {clearLabel}
                        </button>
                    )}

                    <button
                        onClick={onSave}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                    >
                        <Save size={16} />
                        Salvar projeto
                    </button>
                </div>

                <span className="text-xs text-slate-500">{savedLabel}</span>
                {draftLabel && (
                    <span className="text-xs text-slate-500">{draftLabel}</span>
                )}
            </div>
        </header>
    );
};
