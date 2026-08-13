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
    linearRegression: LinearRegression | None
    possibleOutliers: list[dict[str, float]]


class Finding(BaseModel):
    title: str
    description: str
    severity: Literal["positive", "neutral", "warning"] = "neutral"


class ModelInterpretation(BaseModel):
    summary: str
    findings: list[Finding] = Field(default_factory=list, max_length=6)
    caveats: list[str] = Field(default_factory=list, max_length=6)
    suggestions: list[str] = Field(default_factory=list, max_length=6)


class AnalyzeChartResponse(ModelInterpretation):
    statistics: list[SeriesStatistics]
    model: str
    disclaimer: str
