import { ArrowLeft, Eraser, HelpCircle, Save, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

interface EditorPageHeaderProps {
    title: string;
    description: string;
    onBack: () => void;
    onSave: () => void | Promise<unknown>;
    onShare?: () => void;
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
    onShare,
    onClear,
    onStartTour,
    lastSavedAt,
    lastDraftSavedAt,
    clearLabel = "Limpar campos",
    tourLabel = "Tutorial",
}: EditorPageHeaderProps) => {
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | undefined>();
    const savedLabel = lastSavedAt
        ? `Salvo às ${new Date(lastSavedAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        })}`
        : "Não salvo";
    const draftLabel = lastDraftSavedAt
        ? `Rascunho salvo automaticamente às ${new Date(lastDraftSavedAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        })}`
        : undefined;

    const handleSave = async () => {
        setIsSaving(true);
        setSaveError(undefined);

        try {
            await onSave();
        } catch (error) {
            console.warn("Não foi possível salvar o projeto.", error);
            setSaveError("Não foi possível salvar agora.");
        } finally {
            setIsSaving(false);
        }
    };

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
                        <Button onClick={onStartTour} variant="outline">
                            <HelpCircle size={16} />
                            {tourLabel}
                        </Button>
                    )}

                    {onShare && (
                        <Button onClick={onShare} variant="outline">
                            <Share2 size={16} />
                            Compartilhar
                        </Button>
                    )}

                    {onClear && (
                        <Button onClick={onClear} variant="destructive">
                            <Eraser size={16} />
                            {clearLabel}
                        </Button>
                    )}

                    <Button disabled={isSaving} onClick={handleSave}>
                        <Save size={16} />
                        {isSaving ? "Salvando..." : "Salvar projeto"}
                    </Button>
                </div>

                <span className="text-xs text-slate-500">{savedLabel}</span>
                {saveError && (
                    <span className="text-xs text-red-600">{saveError}</span>
                )}
                {draftLabel && (
                    <span className="text-xs text-slate-500">{draftLabel}</span>
                )}
            </div>
        </header>
    );
};
