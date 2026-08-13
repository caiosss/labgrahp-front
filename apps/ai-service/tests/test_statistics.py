import unittest

from app.schemas import ChartInput
from app.statistics import calculate_chart_statistics


class StatisticsTest(unittest.TestCase):
    def test_calculates_perfect_linear_relationship(self) -> None:
        chart = ChartInput.model_validate(
            {
                "title": "Teste",
                "xAxis": {"label": "x", "unit": ""},
                "yAxis": {"label": "y", "unit": ""},
                "series": [
                    {
                        "name": "Amostra",
                        "points": [
                            {"x": "1", "y": "2"},
                            {"x": "2", "y": "4"},
                            {"x": "3", "y": "6"},
                        ],
                    }
                ],
            }
        )

        result = calculate_chart_statistics(chart)[0]

        self.assertEqual(result.pointCount, 3)
        self.assertEqual(result.correlation, 1.0)
        self.assertEqual(result.correlationStrength, "muito forte")
        self.assertEqual(result.trend, "crescente")
        self.assertEqual(result.dataQuality, "limitada")
        self.assertEqual(result.linearRegression.slope, 2.0)  # type: ignore[union-attr]
        self.assertEqual(result.linearRegression.rSquared, 1.0)  # type: ignore[union-attr]


if __name__ == "__main__":
    unittest.main()
