import math

import numpy as np

from .schemas import ChartInput, LinearRegression, SeriesStatistics


def _to_number(value: str | float | int) -> float | None:
    try:
        number = float(str(value).replace(",", "."))
        return number if math.isfinite(number) else None
    except (TypeError, ValueError):
        return None


def _round(value: float) -> float:
    return round(float(value), 6)


def _find_outliers(x_values: np.ndarray, y_values: np.ndarray) -> list[dict[str, float]]:
    if len(y_values) < 4:
        return []

    q1, q3 = np.percentile(y_values, [25, 75])
    iqr = q3 - q1
    if iqr == 0:
        return []

    lower = q1 - 1.5 * iqr
    upper = q3 + 1.5 * iqr
    indexes = np.where((y_values < lower) | (y_values > upper))[0]

    return [
        {"x": _round(x_values[index]), "y": _round(y_values[index])}
        for index in indexes[:10]
    ]


def _correlation_strength(correlation: float | None) -> str:
    if correlation is None:
        return "indefinida"

    absolute_value = abs(correlation)
    if absolute_value < 0.2:
        return "muito fraca"
    if absolute_value < 0.4:
        return "fraca"
    if absolute_value < 0.7:
        return "moderada"
    if absolute_value < 0.9:
        return "forte"
    return "muito forte"


def _trend(slope: float | None, y_values: np.ndarray) -> str:
    if slope is None:
        return "indefinida"

    y_range = float(np.max(y_values) - np.min(y_values))
    tolerance = max(y_range * 0.01, 1e-9)
    if abs(slope) <= tolerance:
        return "estável"
    return "crescente" if slope > 0 else "decrescente"


def _data_quality(point_count: int) -> str:
    if point_count < 3:
        return "insuficiente"
    if point_count < 6:
        return "limitada"
    return "adequada"


def calculate_chart_statistics(chart: ChartInput) -> list[SeriesStatistics]:
    results: list[SeriesStatistics] = []

    for series in chart.series:
        valid_points = [
            (x, y)
            for point in series.points
            if (x := _to_number(point.x)) is not None
            and (y := _to_number(point.y)) is not None
        ]

        if len(valid_points) < 2:
            continue

        x_values = np.array([point[0] for point in valid_points], dtype=float)
        y_values = np.array([point[1] for point in valid_points], dtype=float)
        x_has_variation = not np.allclose(x_values, x_values[0])
        y_has_variation = not np.allclose(y_values, y_values[0])

        correlation: float | None = None
        regression: LinearRegression | None = None
        slope_value: float | None = None

        if x_has_variation and y_has_variation:
            correlation = _round(np.corrcoef(x_values, y_values)[0, 1])

        if x_has_variation:
            slope, intercept = np.polyfit(x_values, y_values, 1)
            slope_value = float(slope)
            predictions = slope * x_values + intercept
            residual_sum = float(np.sum((y_values - predictions) ** 2))
            total_sum = float(np.sum((y_values - np.mean(y_values)) ** 2))
            r_squared = None if total_sum == 0 else 1 - residual_sum / total_sum
            regression = LinearRegression(
                slope=_round(slope),
                intercept=_round(intercept),
                rSquared=None if r_squared is None else _round(r_squared),
            )

        results.append(
            SeriesStatistics(
                name=series.name.strip() or "Série",
                pointCount=len(valid_points),
                xMin=_round(np.min(x_values)),
                xMax=_round(np.max(x_values)),
                yMin=_round(np.min(y_values)),
                yMax=_round(np.max(y_values)),
                xMean=_round(np.mean(x_values)),
                yMean=_round(np.mean(y_values)),
                correlation=correlation,
                correlationStrength=_correlation_strength(correlation),
                trend=_trend(slope_value, y_values),
                dataQuality=_data_quality(len(valid_points)),
                linearRegression=regression,
                possibleOutliers=_find_outliers(x_values, y_values),
            )
        )

    return results
