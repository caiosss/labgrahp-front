from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class AxisInput(BaseModel):
    label: str = ""
    unit: str = ""


class PointInput(BaseModel):
    x: str | float | int
    y: str | float | int


class SeriesInput(BaseModel):
    name: str = "Série"
    points: list[PointInput] = Field(default_factory=list, max_length=2000)


class ChartInput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str = ""
    xAxis: AxisInput
    yAxis: AxisInput
    series: list[SeriesInput] = Field(min_length=1, max_length=20)


class AnalyzeChartRequest(BaseModel):
    chart: ChartInput


class LinearRegression(BaseModel):
    slope: float
    intercept: float
    rSquared: float | None


class SeriesStatistics(BaseModel):
    name: str
    pointCount: int
    xMin: float
    xMax: float
    yMin: float
    yMax: float
    xMean: float
    yMean: float
    correlation: float | None
    correlationStrength: Literal["indefinida", "muito fraca", "fraca", "moderada", "forte", "muito forte"]
    trend: Literal["crescente", "decrescente", "estável", "indefinida"]
    dataQuality: Literal["insuficiente", "limitada", "adequada"]
    linearRegression: LinearRegression | None
    possibleOutliers: list[dict[str, float]]


class Finding(BaseModel):
    title: str = Field(min_length=5, max_length=100)
    description: str = Field(min_length=80, max_length=600)
    severity: Literal["positive", "neutral", "warning"] = "neutral"


class ModelInterpretation(BaseModel):
    summary: str = Field(min_length=280, max_length=5000)
    findings: list[Finding] = Field(min_length=2, max_length=6)
    caveats: list[str] = Field(min_length=2, max_length=6)
    suggestions: list[str] = Field(min_length=3, max_length=6)


class AnalyzeChartResponse(ModelInterpretation):
    statistics: list[SeriesStatistics]
    model: str
    disclaimer: str
