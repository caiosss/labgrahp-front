# Deploy do AI Service no Railway

O ambiente de produção usa três componentes para a análise:

```text
Frontend (Vercel)
  -> API Gateway (Railway, público)
    -> AI Service (Railway, privado)
      -> Ollama + Qwen 2.5 1.5B (Railway, privado e com volume)
```

O Railway transforma cada serviço do Compose em um serviço independente. Não
crie um domínio público para o AI Service nem para o Ollama.

## 1. Enviar os arquivos ao repositório

Antes de iniciar, envie a versão atual para a branch usada pelo ambiente de
produção. Os diretórios novos que precisam estar no Git são:

- `apps/ai-service`
- `apps/ollama`

## 2. Criar o serviço Ollama

No mesmo projeto e ambiente dos outros microsserviços:

1. Crie um serviço vazio chamado exatamente `ollama`.
2. Em **Settings > Source**, conecte o mesmo repositório GitHub.
3. Defina **Root Directory** como `/apps/ollama`.
4. Defina **Config File Path** como `/apps/ollama/railway.json`.
5. Não gere domínio público.

Adicione em **Variables**:

```ini
OLLAMA_MODEL=qwen2.5:1.5b-instruct
OLLAMA_KEEP_ALIVE=10m
OLLAMA_MAX_LOADED_MODELS=1
OLLAMA_NUM_PARALLEL=1
```

Volte ao canvas do projeto, clique com o botão direito em uma área vazia e
selecione **New Volume** (também é possível procurar `Volume` na Command
Palette). Escolha o serviço `ollama` quando o Railway perguntar onde conectar o
volume e informe o mount path:

```text
/root/.ollama
```

Use pelo menos 3 GB. O volume contém o modelo e não deve ser excluído entre os
deploys.

Em **Settings > Deploy > Replica Limits**, comece com:

- CPU: 4 vCPU
- memória: 4 GB
- réplicas: 1

Faça o deploy e acompanhe os logs. Na primeira execução deve aparecer o download
do modelo e, ao final:

```text
Ollama pronto para receber requisições com o modelo qwen2.5:1.5b-instruct.
```

## 3. Criar o AI Service

1. Crie outro serviço vazio chamado `ai-service`.
2. Conecte o mesmo repositório GitHub.
3. Defina **Root Directory** como `/apps/ai-service`.
4. Defina **Config File Path** como `/apps/ai-service/railway.json`.
5. Não gere domínio público.

Adicione em **Variables**:

```ini
PORT=3335
JWT_ACCESS_SECRET=${{shared.JWT_ACCESS_SECRET}}
OLLAMA_URL=http://${{ollama.RAILWAY_PRIVATE_DOMAIN}}:11434
OLLAMA_MODEL=qwen2.5:1.5b-instruct
OLLAMA_TIMEOUT_SECONDS=300
OLLAMA_KEEP_ALIVE=10m
MAX_CONCURRENT_ANALYSES=1
```

Se o domínio privado mostrado pelo Railway para o Ollama for diferente, copie o
valor exibido em **Ollama > Settings > Networking > Private Network** e preserve
a porta `11434`.

O `JWT_ACCESS_SECRET` precisa referenciar a mesma Shared Variable usada pelo
Identity Service e pelo Project Service. Não copie um segredo diferente.

Como limite inicial, use 1 vCPU, 1 GB de memória e uma réplica. O processamento
pesado acontece no Ollama.

Faça o deploy. O healthcheck `/health` deve terminar com status `200`.

Se o processo encerrar durante o startup, confirme nos logs se existe uma
mensagem `jwt_access_secret Field required`. Nesse caso, a Shared Variable não
foi associada corretamente ao serviço.

## 4. Conectar o API Gateway

Abra o serviço `api-gateway` e adicione ou substitua:

```ini
AI_SERVICE_URL=http://${{ai-service.RAILWAY_PRIVATE_DOMAIN}}:3335
```

Confira o domínio privado real em **AI Service > Settings > Networking**. Em
seguida, faça redeploy do Gateway. Não é necessário alterar a URL da Vercel: o
frontend continua chamando o mesmo Gateway público.

## 5. Testar o fluxo completo

1. Entre no frontend com uma conta.
2. Abra um projeto de gráfico com pelo menos dois pontos numéricos.
3. Pressione **Analisar com IA**.
4. Na primeira análise após um período ocioso, aguarde o carregamento do modelo.
5. Confirme a resposta no frontend e os logs dos três serviços.

Resultados esperados:

- Gateway: requisição `POST /ai/analyze` sem erro de upstream.
- AI Service: resposta `200`.
- Ollama: carregamento de `qwen2.5:1.5b-instruct` e geração concluída.

## Diagnóstico rápido

### AI Service retorna 401

O `JWT_ACCESS_SECRET` não é o mesmo do Identity Service, ou o access token está
expirado. Use a Shared Variable nos dois serviços.

### Gateway retorna 502

Confira `AI_SERVICE_URL`, a porta `3335` e se os serviços pertencem ao mesmo
projeto e ambiente Railway.

### AI Service retorna 503

O Ollama ainda não terminou o download, o domínio em `OLLAMA_URL` está errado ou
o processo ficou sem memória. Consulte primeiro os logs do Ollama.

### O modelo é baixado em todo deploy

O volume não está montado exatamente em `/root/.ollama`. Corrija o mount path e
não apague o volume.

### Processo encerrado por falta de memória

Aumente o limite de memória do Ollama. Mantenha `OLLAMA_NUM_PARALLEL=1` e
`MAX_CONCURRENT_ANALYSES=1` enquanto estiver usando o modelo em CPU.

### Resposta muito lenta

Confira CPU e memória em **Metrics**. Comece com quatro vCPUs para o Ollama e só
aumente após observar uso próximo ao limite.

## Custos e segurança

- Configure alertas de gasto no Workspace do Railway.
- Mantenha apenas o Gateway com domínio público.
- Não exponha a porta `11434` do Ollama na internet.
- Não coloque segredos de produção em arquivos `.env` versionados.
- O volume persiste mesmo quando o serviço é redeployado; removê-lo força um novo
  download do modelo.
