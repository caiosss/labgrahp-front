import json

import httpx

from .config import Settings
from .schemas import ChartInput, ModelInterpretation, SeriesStatistics


SYSTEM_PROMPT = """Você é um assistente de análise de gráficos científicos.
Responda somente em português brasileiro e no JSON solicitado.
Use exclusivamente as estatísticas fornecidas: não recalcule nem invente valores.
Se houver poucos pontos, associação não implica causalidade ou limitações relevantes, destaque isso.
Escreva de forma didática e curta. Não ofereça diagnóstico médico nem conclusão científica definitiva.
"""


async def interpret_chart(
    chart: ChartInput,
    statistics: list[SeriesStatistics],
    settings: Settings,
) -> ModelInterpretation:
    context = {
        "chart": {
            "title": chart.title,
            "xAxis": chart.xAxis.model_dump(),
            "yAxis": chart.yAxis.model_dump(),
        },
        "statistics": [item.model_dump() for item in statistics],
    }
    schema = ModelInterpretation.model_json_schema()

    async with httpx.AsyncClient(timeout=settings.ollama_timeout_seconds) as client:
        response = await client.post(
            f"{settings.ollama_url.rstrip('/')}/api/chat",
            json={
                "model": settings.ollama_model,
                "stream": False,
                "keep_alive": settings.ollama_keep_alive,
                "format": schema,
                "options": {
                    "temperature": 0.2,
                    "num_ctx": 4096,
                    "num_predict": 700,
                },
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": "Analise estes dados: " + json.dumps(context, ensure_ascii=False),
                    },
                ],
            },
        )
        response.raise_for_status()
        body = response.json()

    return ModelInterpretation.model_validate_json(body["message"]["content"])
