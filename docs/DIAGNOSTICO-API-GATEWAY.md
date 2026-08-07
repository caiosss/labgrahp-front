# Diagnóstico de conexão do API Gateway

## Visão geral

No ambiente local, o fluxo de autenticação passa por dois processos:

```text
Navegador -> API Gateway (:3000) -> Identity Service (:3334)
```

O navegador acessa apenas o gateway. O gateway examina o caminho da requisição
e encaminha tudo que começa com `/auth/` para o Identity Service.

## Causas encontradas

### 1. `ECONNREFUSED`

O erro abaixo significa que o sistema operacional recusou a conexão porque não
havia um serviço escutando no endereço configurado:

```text
Gateway upstream error
TypeError: fetch failed
cause: ECONNREFUSED
```

Neste projeto, para uma rota `/auth/*`, o destino local é definido em
`apps/api-gateway/.env.local`:

```ini
IDENTITY_SERVICE_URL=http://localhost:3334
```

Portanto, esse erro aparece quando o Identity Service está parado, encerrou por
um erro, está em outra porta ou quando gateway e serviço estão em ambientes de
rede diferentes.

Durante o diagnóstico também havia outra instância ocupando a porta `3000`. Ao
tentar iniciar um segundo gateway, o Node informou:

```text
EADDRINUSE: address already in use :::3000
```

Isso significa que a nova instância não iniciou e os testes continuaram atingindo
o processo antigo.

### 2. O gateway seguia o redirect do Google

O `fetch()` do Node segue redirects por padrão. O Identity Service respondia:

```http
HTTP/1.1 302 Found
Location: https://accounts.google.com/...
```

Mas o gateway seguia esse endereço no servidor e devolvia o HTML do Google como
se ele pertencesse a `localhost:3000`. A tela de login aparecia, mas continuava
sob a origem errada e seus controles não funcionavam corretamente.

A correção foi configurar o proxy com:

```js
redirect: "manual"
```

Agora o gateway repassa o `302` ao navegador, e o próprio navegador navega para
`accounts.google.com`.

### 3. Múltiplos cookies OAuth

O início do OAuth cria três cookies temporários:

- `google_oauth_state`;
- `google_oauth_nonce`;
- `google_oauth_code_verifier`.

O proxy passou a usar `headers.getSetCookie()` para encaminhar cada `Set-Cookie`
separadamente. Isso evita que os cookies sejam combinados em um único cabeçalho,
o que pode fazer o navegador perder parte do estado necessário ao callback.

## Como executar localmente

Abra terminais separados a partir da raiz do projeto.

Identity Service:

```powershell
npm run dev:identity
```

API Gateway:

```powershell
npm run dev:gateway
```

Frontend:

```powershell
npm run dev:web
```

Para o Identity Service funcionar, o PostgreSQL de identidade também precisa
estar disponível no endereço definido por `IDENTITY_DATABASE_URL`.

## Testes rápidos

### Identity Service

Acesse:

```text
http://localhost:3334/health
```

Resultado esperado:

```json
{
  "database": "connected",
  "service": "identity-service",
  "status": "ok"
}
```

### API Gateway

Acesse:

```text
http://localhost:3000/health
```

Depois teste uma rota encaminhada:

```powershell
curl.exe -i http://localhost:3000/auth/me
```

Um `401 Unauthorized` é esperado sem access token e comprova que o gateway
conseguiu chegar ao Identity Service. Um `502` indica falha de comunicação.

### Redirect do Google

```powershell
curl.exe -I http://localhost:3000/auth/google
```

O resultado esperado é `302 Found`, com `Location` apontando para
`https://accounts.google.com/...`. No navegador, a barra de endereço deve mudar
de `localhost:3000` para o domínio do Google.

## Checklist para `ECONNREFUSED`

1. Confirme se o Identity Service iniciou sem erro.
2. Acesse `http://localhost:3334/health` diretamente.
3. Confira se `IDENTITY_SERVICE_URL` aponta para a porta correta.
4. Verifique se outra aplicação ocupa as portas `3000` ou `3334`.
5. Reinicie o gateway depois de alterar seu `.env.local`.
6. Não misture endereços locais com nomes internos do Docker.

No Windows, as portas podem ser inspecionadas com:

```powershell
Get-NetTCPConnection -State Listen |
  Where-Object { $_.LocalPort -in 3000,3334 }
```

## Localhost e Docker Compose

Dentro de um container, `localhost` aponta para o próprio container. Por isso,
quando gateway e Identity Service rodam no Docker Compose, o gateway deve usar
o nome do serviço da rede Docker, por exemplo:

```ini
IDENTITY_SERVICE_URL=http://identity-service:3334
```

Quando ambos rodam diretamente no Windows, use:

```ini
IDENTITY_SERVICE_URL=http://localhost:3334
```

Evite executar o gateway no Docker e tentar acessar outro container por
`localhost`. Também evite iniciar simultaneamente uma versão Docker e uma versão
local usando a mesma porta publicada.

## Railway

No Railway, o gateway deve apontar para o domínio privado do Identity Service,
não para `localhost` e nem obrigatoriamente para seu domínio público:

```ini
IDENTITY_SERVICE_URL=http://identity-service.railway.internal:${PORT_DO_SERVICO}
```

Use o domínio privado exato fornecido pelo Railway e mantenha o Identity Service
escutando em `::` ou `0.0.0.0`. Cada serviço Railway possui seu próprio ambiente;
logo, `localhost` no gateway aponta apenas para o container do gateway.

## Significado dos principais status

| Resultado | Interpretação |
| --- | --- |
| `200` em `/health` | Processo acessível e saudável |
| `302` em `/auth/google` | Redirect OAuth iniciado corretamente |
| `401` em `/auth/me` | Gateway alcançou o Identity Service, mas falta token |
| `502` no gateway | Gateway não conseguiu completar a chamada ao serviço |
| `ECONNREFUSED` | Nenhum processo aceitou conexão no host/porta |
| `EADDRINUSE` | Outro processo já está usando a porta local |
