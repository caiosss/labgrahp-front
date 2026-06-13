import { CheckCircle2 } from "lucide-react";

const guideItems = [
    "Nomeie o gráfico e os eixos",
    "Informe pontos X/Y ou gere uma curva de pico",
    "Ajuste escala, legenda e aparencia",
];

export const ChartEditorGuide = () => {
    return (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <h2 className="text-sm font-semibold text-blue-950">
                Fluxo recomendado
            </h2>

            <div className="mt-3 grid gap-2">
                {guideItems.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-blue-900">
                        <CheckCircle2 size={16} className="shrink-0" />
                        <span>{item}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
