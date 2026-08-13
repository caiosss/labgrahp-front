import json
import re

import httpx
from pydantic import ValidationError

from .config import Settings
from .schemas import ChartInput, ModelInterpretation, SeriesStatistics


SYSTEM_PROMPT = """Você é um assistente cuidadoso de análise de gráficos científicos.
Responda somente em português brasileiro e exatamente no JSON Schema solicitado.

REGRAS DE PRECISÃO:
- Use exclusivamente os valores fornecidos. Não recalcule, arredonde de outra forma ou invente números.
- Diferencie correlação, ajuste linear e causalidade. Correlação nunca prova causalidade.
- R² descreve a aderência do ajuste linear aos pontos; não prova validade do experimento.
- Trate possíveis outliers apenas como candidatos que precisam de investigação.
- Se dataQuality for insuficiente ou limitada, torne essa limitação explícita.
- Não deduza o fenômeno científico apenas pelo título ou nome dos eixos.

QUALIDADE OBRIGATÓRIA DO RELATÓRIO:
- O resumo deve ter um parágrafo substancial: contexto dos eixos, direção da tendência,
  força da associação, qualidade do ajuste, quantidade de pontos e principal limitação.
- Produza de 2 a 6 findings. Cada finding deve explicar um aspecto diferente e citar
  os valores relevantes, sem apenas repetir o resumo.
- Produza ao menos 2 caveats específicos aos dados e 3 sugestões práticas.
- Evite frases genéricas como 'o gráfico parece bom' sem explicar por quê.
- Nunca diga que existem outliers quando possibleOutliers for uma lista vazia.
- Nunca transforme média, tendência ou R² em prova de conformidade, qualidade do
  método ou validade experimental.
- Use severity=positive somente para uma propriedade favorável sustentada pelos
  números; severity=warning somente para uma limitação; nos demais casos use neutral.
- Não ofereça diagnóstico médico nem conclusão científica definitiva.
"""

FORBIDDEN_UNSUPPORTED_CLAIMS = (
    "boa conformidade",
    "boa notícia para a qualidade",
    "bom desempenho do método",
    "método está em conformidade",
    "método está em boa conformidade",
    "padrão experimental consistente",
    "isso é esperado para",
)


def _build_verified_facts(statistics: list[SeriesStatistics]) -> list[str]:
    facts: list[str] = []

    for item in statistics:
        regression = item.linearRegression
        facts.extend(
            [
                f"A série '{item.name}' possui exatamente {item.pointCount} pontos válidos.",
                f"A tendência calculada é {item.trend}.",
                f"A correlação é {item.correlation} e sua força é {item.correlationStrength}.",
                (
                    f"O R² do ajuste linear é {regression.rSquared}."
                    if regression and regression.rSquared is not None
                    else "O R² linear não pôde ser calculado."
                ),
                f"A qualidade amostral classificada pelo número de pontos é {item.dataQuality}.",
                (
                    "Nenhum possível outlier foi detectado pelo método IQR. Não afirme que há outliers."
                    if not item.possibleOutliers
                    else f"Foram detectados exatamente {len(item.possibleOutliers)} possíveis outliers pelo método IQR."
                ),
            ]
        )

    return facts


def _validate_semantic_consistency(
    interpretation: ModelInterpretation,
    statistics: list[SeriesStatistics],
) -> None:
    rendered = json.dumps(interpretation.model_dump(), ensure_ascii=False).lower()

    unsupported_claims = [
        claim for claim in FORBIDDEN_UNSUPPORTED_CLAIMS if claim in rendered
    ]
    if unsupported_claims:
        raise ValueError(
            "Foram feitas conclusões experimentais não sustentadas: "
            + ", ".join(unsupported_claims)
        )

    if all(not item.possibleOutliers for item in statistics):
        positive_outlier_claim = re.search(
            r"\b(?:1|2|3|4|5|6|7|8|9|um|uma|dois|duas|três|quatro|cinco|seis|sete|oito|nove)\b"
            r".{0,45}\b(?:outlier|outliers|pontos? fora do padrão)\b",
            rendered,
        )
        if positive_outlier_claim:
            raise ValueError(
                "O texto afirmou existir outlier, mas o cálculo IQR encontrou zero."
            )


def _build_user_prompt(
    context: dict[str, object],
    previous_error: str | None = None,
) -> str:
    prompt = """Elabore um relatório técnico-didático dos dados abaixo.
Siga esta ordem mental: (1) descreva sem inferir causa; (2) compare séries, se houver;
(3) interprete correlação e regressão; (4) avalie quantidade de pontos e outliers;
(5) proponha próximos passos verificáveis.

DADOS VERIFICADOS PELO PYTHON:
""" + json.dumps(context, ensure_ascii=False)

    if previous_error:
        prompt += (
            "\n\nA resposta anterior não cumpriu o nível mínimo de detalhe ou o schema. "
            f"Corrija integralmente estes problemas: {previous_error}"
        )

    return prompt


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
        "verifiedFacts": _build_verified_facts(statistics),
    }
    schema = ModelInterpretation.model_json_schema()

    previous_error: str | None = None

    async with httpx.AsyncClient(timeout=settings.ollama_timeout_seconds) as client:
        for attempt in range(2):
            response = await client.post(
                f"{settings.ollama_url.rstrip('/')}/api/chat",
                json={
                    "model": settings.ollama_model,
                    "stream": False,
                    "keep_alive": settings.ollama_keep_alive,
                    "format": schema,
                    "options": {
                        "temperature": 0.1,
                        "seed": 42,
                        "num_ctx": 6144,
                        "num_predict": 1400,
                    },
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {
                            "role": "user",
                            "content": _build_user_prompt(context, previous_error),
                        },
                    ],
                },
            )
            response.raise_for_status()
            body = response.json()

            try:
                interpretation = ModelInterpretation.model_validate_json(
                    body["message"]["content"]
                )
                _validate_semantic_consistency(interpretation, statistics)
                return interpretation
            except (KeyError, ValidationError, ValueError) as error:
                previous_error = str(error)
                if attempt == 1:
                    raise

    raise RuntimeError("Ollama não retornou uma interpretação válida.")
