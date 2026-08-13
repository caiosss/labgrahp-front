from .schemas import ChartInput, Finding, ModelInterpretation, SeriesStatistics


_UNSUPPORTED_SUGGESTION_TERMS = (
    "anova",
    "teste t",
    "p-valor",
    "significância estatística",
    "confirmar a correlação",
    "confirmar o ajuste",
    "garantir a validade",
    "validar o experimento",
    "método alternativo",
)

_SUPPORTED_SUGGESTION_TOPICS = (
    "coleta",
    "condições",
    "incerteza",
    "mediç",
    "pontos",
    "repet",
    "resíduo",
    "unidade",
)


def _is_safe_model_suggestion(
    suggestion: str,
    statistics: list[SeriesStatistics],
) -> bool:
    normalized = suggestion.strip().lower()
    if len(normalized) < 60:
        return False
    if any(term in normalized for term in _UNSUPPORTED_SUGGESTION_TERMS):
        return False
    if not any(term in normalized for term in _SUPPORTED_SUGGESTION_TOPICS):
        return False
    if all(not item.possibleOutliers for item in statistics) and "outlier" in normalized:
        return False
    return True


def _number(value: float | None) -> str:
    if value is None:
        return "não calculável"
    return f"{value:.6f}".rstrip("0").rstrip(".")


def _axis_name(label: str, unit: str, fallback: str) -> str:
    name = label.strip() or fallback
    return f"{name} ({unit.strip()})" if unit.strip() else name


def _series_summary(
    statistics: SeriesStatistics,
    x_axis: str,
    y_axis: str,
) -> str:
    regression = statistics.linearRegression
    relationship = (
        f"A correlação de Pearson é {_number(statistics.correlation)}, "
        f"classificada como {statistics.correlationStrength}."
        if statistics.correlation is not None
        else "A correlação de Pearson não pôde ser calculada por falta de variação nos dados."
    )
    regression_text = (
        f"O ajuste linear calculado é y = {_number(regression.slope)}x + "
        f"{_number(regression.intercept)}, com R² de {_number(regression.rSquared)}; "
        "esse R² descreve apenas a aderência dos pontos observados ao modelo linear."
        if regression
        else "O ajuste linear não pôde ser calculado para esta série."
    )
    outlier_text = (
        f"O método IQR sinalizou {len(statistics.possibleOutliers)} possível(is) outlier(s)."
        if statistics.possibleOutliers
        else "O método IQR não sinalizou possíveis outliers."
    )

    return (
        f"Na série “{statistics.name}”, foram usados {statistics.pointCount} pontos válidos. "
        f"À medida que {x_axis} varia, {y_axis} apresenta tendência {statistics.trend}. "
        f"{relationship} {regression_text} {outlier_text} "
        f"Pelo número de observações, a qualidade amostral foi classificada como "
        f"{statistics.dataQuality}."
    )


def _build_findings(statistics: list[SeriesStatistics]) -> list[Finding]:
    findings: list[Finding] = []

    for item in statistics[:2]:
        findings.append(
            Finding(
                title=f"Tendência {item.trend} em {item.name}",
                description=(
                    f"A classificação foi obtida pela inclinação do ajuste linear sobre "
                    f"{item.pointCount} pontos válidos. Ela descreve a direção observada "
                    "no intervalo dos dados e não estabelece uma relação de causa e efeito."
                ),
                severity="neutral",
            )
        )

        findings.append(
            Finding(
                title=f"Intervalos observados em {item.name}",
                description=(
                    f"Os valores de X vão de {_number(item.xMin)} a {_number(item.xMax)}, "
                    f"enquanto Y vai de {_number(item.yMin)} a {_number(item.yMax)}. "
                    "A interpretação e o ajuste são sustentados apenas dentro desses "
                    "intervalos; extrapolações exigem dados adicionais."
                ),
                severity="neutral",
            )
        )

        if item.linearRegression and item.linearRegression.rSquared is not None:
            findings.append(
                Finding(
                    title=f"Aderência linear de {item.name}",
                    description=(
                        f"A correlação é {_number(item.correlation)} "
                        f"({item.correlationStrength}) e o R² é "
                        f"{_number(item.linearRegression.rSquared)}. O primeiro valor mede "
                        "a associação linear; o segundo mede a aderência do ajuste aos "
                        "pontos observados. Nenhum deles comprova causalidade."
                    ),
                    severity=(
                        "positive"
                        if item.linearRegression.rSquared >= 0.9
                        else "neutral"
                    ),
                )
            )

        if item.dataQuality != "adequada" or item.possibleOutliers:
            outlier_detail = (
                f" O método IQR também sinalizou {len(item.possibleOutliers)} "
                "ponto(s) que merecem inspeção individual."
                if item.possibleOutliers
                else " O método IQR não sinalizou pontos discrepantes nessa amostra."
            )
            findings.append(
                Finding(
                    title=f"Limitações de {item.name}",
                    description=(
                        f"A qualidade amostral é {item.dataQuality}, com "
                        f"{item.pointCount} observações.{outlier_detail} Esses "
                        "critérios orientam a revisão, mas não validam o experimento."
                    ),
                    severity="warning",
                )
            )

    return findings[:6]


def build_verified_report(
    chart: ChartInput,
    statistics: list[SeriesStatistics],
    model_interpretation: ModelInterpretation,
) -> ModelInterpretation:
    x_axis = _axis_name(chart.xAxis.label, chart.xAxis.unit, "eixo X")
    y_axis = _axis_name(chart.yAxis.label, chart.yAxis.unit, "eixo Y")
    title = chart.title.strip() or "Gráfico sem título"
    summaries = [
        _series_summary(item, x_axis, y_axis)
        for item in statistics[:3]
    ]
    omitted_series = len(statistics) - len(summaries)
    omitted_notice = (
        f" Outras {omitted_series} série(s) foram calculadas e permanecem disponíveis "
        "na seção de estatísticas, mas foram omitidas deste resumo para preservar a leitura."
        if omitted_series > 0
        else ""
    )
    summary = (
        f"Análise de “{title}”. "
        + " ".join(summaries)
        + omitted_notice
        + " Os resultados caracterizam somente os dados fornecidos e devem ser "
        "interpretados junto ao desenho experimental, às incertezas e ao conhecimento da área."
    )

    caveats = [
        "Correlação e R² não demonstram causalidade nem validam, sozinhos, o método experimental.",
        "Extrapolações além dos intervalos observados de X e Y não são sustentadas por esta análise.",
    ]
    if any(item.dataQuality != "adequada" for item in statistics):
        caveats.append(
            "Uma ou mais séries possuem poucos pontos; novas observações podem alterar correlação, ajuste e detecção de outliers."
        )

    verified_suggestions = [
        "Repita ou amplie as medições antes de transformar a tendência observada em uma conclusão científica.",
        "Examine os resíduos do ajuste e as incertezas de medição, não apenas correlação e R².",
        "Mantenha títulos, unidades e condições experimentais documentados para dar contexto à interpretação.",
    ]
    if any(item.dataQuality != "adequada" for item in statistics):
        verified_suggestions.append(
            "Aumente cada série limitada para pelo menos seis pontos válidos e, quando possível, faça réplicas independentes."
        )
    if any(item.possibleOutliers for item in statistics):
        verified_suggestions.append(
            "Inspecione os pontos sinalizados pelo IQR no registro original antes de decidir mantê-los ou excluí-los."
        )
    if len(statistics) > 1:
        verified_suggestions.append(
            "Compare as séries sob as mesmas unidades e condições de coleta antes de atribuir significado às diferenças."
        )
    suggestions = list(verified_suggestions)
    for suggestion in model_interpretation.suggestions:
        normalized = suggestion.strip()
        if (
            _is_safe_model_suggestion(normalized, statistics)
            and normalized not in suggestions
        ):
            suggestions.append(normalized)
        if len(suggestions) == 6:
            break

    return ModelInterpretation(
        summary=summary,
        findings=_build_findings(statistics),
        caveats=caveats[:6],
        suggestions=suggestions,
    )
