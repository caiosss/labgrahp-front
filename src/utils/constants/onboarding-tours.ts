import type { OnboardingStep } from "../../types/onboarding";

// Base para evoluir o tutorial:
// - Pesquise "product tour UX progressive disclosure" para decidir quantos passos mostrar.
// - Pesquise "WCAG modal dialog focus trap" antes de transformar este overlay em um modal completo.
// - Pesquise "Floating UI React anchored tooltip" se precisar de posicionamento mais avançado.
// Para adicionar uma nova tela, crie outro array de passos e marque os elementos com data-tour.

export const chartEditorTourSteps: OnboardingStep[] = [
    {
        target: "chart-editor-header",
        title: "Fluxo principal",
        description:
            "Aqui ficam as ações globais: voltar, salvar o projeto, limpar o gráfico e abrir este tutorial novamente.",
        example:
            "depois de ajustar os dados e o visual, use Salvar projeto para manter uma versão na lista inicial.",
    },
    {
        target: "chart-identification",
        title: "Identificação do gráfico",
        description:
            "Comece pelo título e pelos nomes dos eixos. Isso ajuda a entender o que está sendo comparado.",
        example:
            "  X = Tempo (min) e Y = Absorbância (AU).",
    },
    {
        target: "chart-axis-scale",
        title: "Escala dos eixos",
        description:
            "Use limites e intervalos quando precisar padronizar a leitura entre gráficos diferentes.",
        example:
            "  deixe mínimo e máximo vazios para o gráfico calcular automaticamente.",
    },
    {
        target: "chart-appearance",
        title: "Visual e exportação",
        description:
            "Ajuste tipo de visualização, grade, legenda, fonte e tamanho final antes de baixar a imagem.",
        example:
            "  linha com pontos é útil para séries experimentais com poucos pontos.",
    },
    {
        target: "chart-series",
        title: "Dados e séries",
        description:
            "Cada série representa um conjunto de pontos ou uma curva. Você também pode ativar um ajuste linear independente por série.",
        example:
            "  use Série manual para pontos X/Y, Curva de pico para gerar uma curva gaussiana e Ajuste linear para exibir a reta de regressão.",
    },
    {
        target: "chart-preview",
        title: "Preview",
        description:
            "Confira o resultado antes de exportar. Em telas pequenas, esta área pode ser rolada horizontalmente. Aperte duas vezes para voltar ao estado inicial e confira as ferramentas acima do título do gráfico.",
        example:
            "  valide título, legenda e escala antes de usar o botão de câmera do gráfico.",
    },
];

export const tableEditorTourSteps: OnboardingStep[] = [
    {
        target: "table-editor-header",
        title: "Fluxo da tabela",
        description:
            "Use o cabeçalho para salvar o projeto, voltar para o início ou reabrir este tutorial.",
        example:
            "  salve a tabela quando terminar de ajustar linhas, colunas e aparência.",
    },
    {
        target: "table-basic",
        title: "Dados principais",
        description:
            "Defina título, fonte e aparência antes de revisar o conteúdo da tabela.",
        example:
            "  use a fonte para indicar de onde vieram os dados apresentados.",
    },
    {
        target: "table-columns",
        title: "Colunas",
        description:
            "Crie colunas com nomes claros para facilitar a leitura e manter a tabela organizada.",
        example:
            "  Concentração, Absorbância e Desvio padrão.",
    },
    {
        target: "table-rows",
        title: "Linhas",
        description:
            "Preencha os valores linha por linha. A pré-visualização acompanha as alterações.",
        example:
            "  cada linha pode representar uma amostra ou uma condição experimental.",
    },
    {
        target: "table-preview",
        title: "Preview e download",
        description:
            "Confira o layout final antes de baixar a imagem da tabela.",
        example:
            "  revise quebras de texto e alinhamento antes da exportação.",
    },
];
