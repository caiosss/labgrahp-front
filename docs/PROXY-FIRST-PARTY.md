# Proxy first-party da autenticacao

## Por que ele existe

O frontend esta na Vercel e o API Gateway esta no Railway. Em uma chamada
direta, o refresh token do Railway e um cookie de terceiro para a pagina da
Vercel. O WebKit usado pelo Safari e pelo Chrome no iOS pode bloquea-lo.

O proxy faz o navegador enxergar uma unica origem:

```text
Navegador
  -> https://labgraph-eta.vercel.app/api/auth/refresh
  -> rewrite da Vercel
  -> https://api-gateway-production-b7a1.up.railway.app/auth/refresh
  -> Identity Service pela rede privada do Railway
```

A rewrite nao move o backend para a Vercel. Ela somente encaminha a requisicao.
Gateway e microsservicos continuam executando no Railway.

## Variaveis de producao

Na Vercel:

```env
VITE_API_URL=/api
```

No Identity Service do Railway:

```env
FRONTEND_URL=https://labgraph-eta.vercel.app
AUTH_PUBLIC_PATH_PREFIX=/api
GOOGLE_CALLBACK_URL=https://labgraph-eta.vercel.app/api/auth/google/callback
```

O prefixo e necessario porque o Identity Service recebe internamente `/auth`,
mas o navegador acessa `/api/auth`. Sem ele, o cookie teria `Path=/auth` e nao
seria enviado a `/api/auth/refresh`.

## Google Cloud

Em **Google Auth Platform > Clients > Authorized redirect URIs**, cadastre:

```text
https://labgraph-eta.vercel.app/api/auth/google/callback
```

Esse valor precisa ser identico a `GOOGLE_CALLBACK_URL`, inclusive protocolo,
caminho e ausencia de barra final.

## Desenvolvimento local

O desenvolvimento local continua usando o Gateway diretamente:

```env
VITE_API_URL=http://localhost:3000
AUTH_PUBLIC_PATH_PREFIX=
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```
