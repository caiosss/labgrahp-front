import asyncio

import httpx
from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import ValidationError

from .config import get_settings
from .ollama_client import interpret_chart
from .report_builder import build_verified_report
from .schemas import AnalyzeChartRequest, AnalyzeChartResponse
from .security import Identity, require_identity
from .statistics import calculate_chart_statistics

app = FastAPI(
    title="LabGraph AI Service",
    version="0.1.0",
    docs_url="/ai/docs",
    openapi_url="/ai/openapi.json",
)
analysis_semaphore: asyncio.Semaphore | None = None


@app.on_event("startup")
async def configure_concurrency() -> None:
    global analysis_semaphore
    analysis_semaphore = asyncio.Semaphore(get_settings().max_concurrent_analyses)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"service": "ai-service", "status": "ok"}


@app.post("/ai/analyze", response_model=AnalyzeChartResponse)
async def analyze_chart(
    request: AnalyzeChartRequest,
    _identity: Identity = Depends(require_identity),
) -> AnalyzeChartResponse:
    statistics = calculate_chart_statistics(request.chart)
    if not statistics:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Inclua ao menos uma série com dois pontos numéricos válidos.",
        )

    settings = get_settings()
    semaphore = analysis_semaphore or asyncio.Semaphore(1)

    try:
        async with semaphore:
            interpretation = await interpret_chart(request.chart, statistics, settings)
    except (httpx.HTTPError, KeyError, ValidationError) as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O modelo de IA ainda não está disponível. Aguarde o download e tente novamente.",
        ) from error

    verified_report = build_verified_report(
        request.chart,
        statistics,
        interpretation,
    )

    return AnalyzeChartResponse(
        **verified_report.model_dump(),
        statistics=statistics,
        model=settings.ollama_model,
        disclaimer="Análise assistida por IA. O resultado pode demorar alguns minutos para ser gerado. Confira os resultados antes de usá-los em trabalhos científicos.",
    )
