# LabGraph AI Service

Microsserviço em Python responsável por calcular estatísticas do gráfico e pedir
ao Qwen uma interpretação curta e estruturada. O modelo recebe os dados e os
resultados calculados pelo NumPy, não uma imagem do gráfico.

## Responsabilidades

- Validar o access token emitido pelo Identity Service.
- Exigir ao menos dois pontos numéricos válidos por série.
- Calcular mínimo, máximo, média, correlação, regressão linear, R² e possíveis
  outliers pelo intervalo interquartil.
- Limitar a concorrência de análises.
- Solicitar ao Ollama uma resposta validada por JSON Schema.

## Executar localmente

Na raiz do repositório:

```bash
docker compose --env-file .env.compose.local up --build
npm run dev
```

No primeiro uso, `ollama-model` baixa aproximadamente 1 GB e armazena o modelo
no volume `ollama-data`. Os próximos inícios reutilizam esse volume.

Para acompanhar a IA:

```bash
docker compose --env-file .env.compose.local logs -f ai-service ollama
```

Para confirmar o modelo instalado:

```bash
docker compose --env-file .env.compose.local exec ollama ollama list
```

Depois de entrar em uma conta no frontend, abra o editor de gráficos e pressione
`Analisar com IA`. O navegador chama `/ai/analyze` no API Gateway, que encaminha
a requisição ao AI Service pela rede interna.

## Contrato

```http
POST /ai/analyze
Authorization: Bearer <access-token>
Content-Type: application/json
```

O corpo contém `{ "chart": ChartConfig }`. A resposta separa a interpretação
das estatísticas determinísticas.

## Testes

```bash
docker run --rm \
  -v "./apps/ai-service/tests:/app/tests:ro" \
  labgraph-ai-service \
  python -m unittest discover -s tests
```

`docker compose down` mantém o modelo. Excluir o volume `labgraph_ollama-data`
remove o modelo e força um novo download no próximo início.
