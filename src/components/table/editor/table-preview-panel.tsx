import type { RefObject } from "react";
import { Download } from "lucide-react";
import type { AbntTableConfig } from "../../../types/table";
import { AbntTablePreview } from "../abnt-table-preview";

interface TablePreviewPanelProps {
    table: AbntTableConfig;
    previewRef: RefObject<HTMLDivElement | null>;
    onExportPNG: () => void;
}

export const TablePreviewPanel = ({
    table,
    previewRef,
    onExportPNG,
}: TablePreviewPanelProps) => {
    return (
        <section
            data-tour="table-preview"
            className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5"
        >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="font-semibold text-slate-900">Preview</h2>
                    <p className="text-sm text-slate-500">
                        Visualizacao antes do download.
                    </p>
                </div>

                <button
                    onClick={onExportPNG}
                    className="flex w-full cursor-pointer justify-center gap-2 rounded-lg bg-slate-200 px-4 py-2 text-sm text-slate-500 hover:bg-slate-300 sm:w-auto"
                >
                    Baixar
                    <Download size={16} />
                </button>
            </div>

            <div className="overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-3 sm:p-6">
                <div
                    ref={previewRef}
                    className="mx-auto min-w-[560px] max-w-4xl shadow-sm sm:min-w-0"
                >
                    <AbntTablePreview table={table} />
                </div>
            </div>
        </section>
    );
};
