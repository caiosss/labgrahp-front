import { Copy, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createProjectShare } from "../../services/share-api";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";

interface ShareProjectDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    projectId?: string;
    onEnsureSaved: () => Promise<string | undefined>;
}

const getApplicationBaseUrl = () => {
    const environmentUrl = import.meta.env.VITE_ENVIRONMENT_URL as
        | string
        | undefined;

    if (environmentUrl) {
        const normalizedUrl = environmentUrl.replace(/\/$/, "");

        if (normalizedUrl.startsWith("http://") || normalizedUrl.startsWith("https://")) {
            return normalizedUrl;
        }

        if (normalizedUrl.startsWith("localhost")) {
            return `http://${normalizedUrl}`;
        }

        return `https://${normalizedUrl}`;
    }

    return window.location.origin;
};

export const ShareProjectDialog = ({
    isOpen,
    onEnsureSaved,
    onOpenChange,
    projectId,
}: ShareProjectDialogProps) => {
    const [copyLabel, setCopyLabel] = useState("Copiar link");
    const [error, setError] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [shareLink, setShareLink] = useState("");
    const hasRequestedShareRef = useRef(false);
    const onEnsureSavedRef = useRef(onEnsureSaved);
    const projectIdRef = useRef(projectId);

    useEffect(() => {
        onEnsureSavedRef.current = onEnsureSaved;
    }, [onEnsureSaved]);

    useEffect(() => {
        projectIdRef.current = projectId;
    }, [projectId]);

    useEffect(() => {
        if (!isOpen) {
            hasRequestedShareRef.current = false;
            return;
        }

        if (hasRequestedShareRef.current) {
            return;
        }

        hasRequestedShareRef.current = true;
        let shouldUpdateState = true;

        const createShareLink = async () => {
            setCopyLabel("Copiar link");
            setError(undefined);
            setIsLoading(true);
            setShareLink("");

            try {
                const ensuredProjectId =
                    projectIdRef.current ?? (await onEnsureSavedRef.current());

                if (!ensuredProjectId) {
                    throw new Error("Projeto não salvo.");
                }

                const share = await createProjectShare(ensuredProjectId);
                const baseUrl = getApplicationBaseUrl();

                if (!share.token) {
                    throw new Error("Token de compartilhamento não retornado.");
                }

                if (shouldUpdateState) {
                    setShareLink(`${baseUrl}/share/${share.token}`);
                }
            } catch (currentError) {
                console.warn("Não foi possível criar o link de compartilhamento.", currentError);

                if (shouldUpdateState) {
                    setError("Não foi possível gerar o link agora.");
                }
            } finally {
                if (shouldUpdateState) {
                    setIsLoading(false);
                }
            }
        };

        void createShareLink();

        return () => {
            shouldUpdateState = false;
        };
    }, [isOpen]);

    const copyLink = async () => {
        if (!shareLink) {
            return;
        }

        await navigator.clipboard.writeText(shareLink);
        setCopyLabel("Link copiado");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Compartilhar projeto</DialogTitle>
                    <DialogDescription>
                        Envie este link para abrir uma cópia visual do gráfico ou tabela.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Share2 size={16} />
                            Link gerado
                        </p>

                        <input
                            readOnly
                            value={isLoading ? "Gerando link..." : shareLink}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        disabled={!shareLink || isLoading}
                        onClick={copyLink}
                        type="button"
                    >
                        <Copy size={16} />
                        {copyLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
