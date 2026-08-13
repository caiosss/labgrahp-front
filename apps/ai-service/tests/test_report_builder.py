import unittest

from app.report_builder import build_verified_report
from app.schemas import ChartInput, ModelInterpretation
from app.statistics import calculate_chart_statistics


class ReportBuilderTest(unittest.TestCase):
    def test_uses_verified_numbers_and_filters_unsupported_suggestions(self) -> None:
        chart = ChartInput.model_validate(
            {
                "title": "Curva de calibração",
                "xAxis": {"label": "Concentração", "unit": "mg/L"},
                "yAxis": {"label": "Absorbância", "unit": "UA"},
                "series": [
                    {
                        "name": "Padrões",
                        "points": [
                            {"x": "1", "y": "2"},
                            {"x": "2", "y": "4"},
                            {"x": "3", "y": "6"},
                            {"x": "4", "y": "8"},
                            {"x": "5", "y": "10"},
                        ],
                    }
                ],
            }
        )
        statistics = calculate_chart_statistics(chart)
        model_result = ModelInterpretation(
            summary="Resumo produzido pelo modelo com conteúdo suficiente para satisfazer a validação do schema, mas que será substituído pelo relatório verificado em Python. " * 2,
            findings=[
                {
                    "title": "Resultado provisório um",
                    "description": "Descrição provisória produzida pelo modelo e suficientemente longa para satisfazer os requisitos mínimos do contrato de resposta.",
                    "severity": "neutral",
                },
                {
                    "title": "Resultado provisório dois",
                    "description": "Outra descrição provisória produzida pelo modelo e suficientemente longa para satisfazer os requisitos mínimos do contrato.",
                    "severity": "neutral",
                },
            ],
            caveats=["Ressalva provisória um.", "Ressalva provisória dois."],
            suggestions=[
                "Realize ANOVA para confirmar a correlação e garantir a validade do experimento.",
                "Avalie outliers em outras formas de dados, apesar de nenhum ter sido detectado.",
                "Registre as condições de temperatura e preparação das amostras em novas coletas para facilitar a reprodutibilidade.",
            ],
        )

        report = build_verified_report(chart, statistics, model_result)

        self.assertIn("correlação de Pearson é 1", report.summary)
        self.assertIn("R² de 1", report.summary)
        self.assertIn("não sinalizou possíveis outliers", report.summary)
        rendered_suggestions = " ".join(report.suggestions).lower()
        self.assertNotIn("anova", rendered_suggestions)
        self.assertNotIn("outlier", rendered_suggestions)
        self.assertIn("reprodutibilidade", rendered_suggestions)


if __name__ == "__main__":
    unittest.main()
