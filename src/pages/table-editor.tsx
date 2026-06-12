"use client";

import { EditorPageHeader } from "../components/editor/editor-page-header";
import { TableBasicSettings } from "../components/table/editor/table-basic-settings";
import { TableColumnsSection } from "../components/table/editor/table-columns-section";
import { TablePreviewPanel } from "../components/table/editor/table-preview-panel";
import { TableRowsSection } from "../components/table/editor/table-rows-section";
import { useTableEditor } from "../hooks/use-table-editor";

interface TableEditorPageProps {
    onBack: () => void;
    projectId?: string;
}

export const TableEditorPage = ({ onBack, projectId }: TableEditorPageProps) => {
    const editor = useTableEditor(projectId);

    return (
        <main className="min-h-screen bg-slate-50 px-3 py-4 sm:px-6 sm:py-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <EditorPageHeader
                    title="Editor de tabela ABNT"
                    description="Edite os dados a esquerda e visualize o resultado a direita."
                    onBack={onBack}
                    onSave={editor.saveProject}
                    lastSavedAt={editor.lastSavedAt}
                />

                <div className="grid min-w-0 grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-[minmax(360px,520px)_minmax(0,1fr)]">
                    <section className="min-w-0 space-y-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
                        <TableBasicSettings
                            table={editor.table}
                            updateTable={editor.updateTable}
                            updateAppearance={editor.updateAppearance}
                        />

                        <TableColumnsSection
                            table={editor.table}
                            updateColumnLabel={editor.updateColumnLabel}
                            addColumn={editor.addColumn}
                            removeColumn={editor.removeColumn}
                        />

                        <TableRowsSection
                            table={editor.table}
                            addRow={editor.addRow}
                            removeRow={editor.removeRow}
                            updateCell={editor.updateCell}
                        />
                    </section>

                    <TablePreviewPanel
                        table={editor.table}
                        previewRef={editor.previewRef}
                        onExportPNG={editor.exportPNG}
                    />
                </div>
            </div>
        </main>
    );
};
