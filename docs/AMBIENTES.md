# Ambientes e variáveis do LabGraph

## Regra principal

Arquivos `.env.local` existem apenas na sua máquina e não são versionados.
Arquivos `.env.example` documentam as chaves, mas nunca contêm segredos reais.
Em produção não existe arquivo `.env`: Vercel e Railway injetam as variáveis no
processo durante build/deploy.

```text
Desenvolvimento sem Docker
├── frontend                  .env.local
├── API Gateway              apps/api-gateway/.env.local
├── Project Service          apps/api/.env.local
└── Identity Service         apps/identity-service/.env.local

Desenvolvimento com Docker
└── Docker Compose           .env.compose.local + compose.yaml

Produção
├── frontend                 painel da Vercel
└── microsserviços           painel do Railway, um conjunto por serviço
```

## Frontend local

O arquivo `.env.local` da raiz contém:

```env
VITE_API_URL=http://localhost:3000
```

O frontend sempre chama o Gateway. Ele nunca deve chamar diretamente as portas
3333 (projects) ou 3334 (identity).

`VITE_ENVIRONMENT_URL` foi removida. Links do próprio frontend usam
`window.location.origin`, que funciona automaticamente em localhost, previews e
produção.

## Docker Compose local

O arquivo `.env.compose.local` guarda somente valores interpolados pelo Compose.
Os endereços internos (`project-service`, `identity-service`, bancos e Kafka)
continuam no `compose.yaml`, porque pertencem à rede Docker local.

```bash
npm run docker:up
npm run docker:logs
npm run docker:down
```

## Vercel: frontend em produção

Em **Vercel > Project > Settings > Environment Variables**, cadastre:

| Nome | Production | Preview | Development |
| --- | --- | --- | --- |
| `VITE_API_URL` | `https://DOMINIO-PUBLICO-DO-GATEWAY` | mesmo gateway ou gateway de staging | `http://localhost:3000` |

Somente o Gateway possui URL pública. Depois de alterar uma variável na Vercel,
faça um novo deploy: variáveis `VITE_*` são incorporadas ao JavaScript durante o
build e ficam visíveis no navegador. Portanto, nunca use `VITE_` para segredos.

## Railway: API Gateway

Defina portas fixas nos serviços internos para simplificar a rede privada:

```env
PORT=3000
CORS_ORIGIN=https://DOMINIO-DO-FRONTEND.vercel.app
PROJECT_SERVICE_URL=http://${{project-service.RAILWAY_PRIVATE_DOMAIN}}:3333
IDENTITY_SERVICE_URL=http://${{identity-service.RAILWAY_PRIVATE_DOMAIN}}:3334
```

Troque `project-service` e `identity-service` pelos nomes exatos exibidos no
canvas do Railway. `CORS_ORIGIN` aceita mais de uma origem separada por vírgula;
adicione URLs de preview somente quando realmente precisar.

O Gateway é o único serviço que deve receber **Generate Domain**. Copie esse
domínio público para `VITE_API_URL` na Vercel.

## Railway: Project Service

```env
PORT=3333
CORS_ORIGIN=https://DOMINIO-DO-FRONTEND.vercel.app
DATABASE_URL=${{Postgres-Projects.DATABASE_URL}}
KAFKA_BROKERS=ENDERECO-PRIVADO-DO-KAFKA
KAFKA_CLIENT_ID=project-service
```

Use uma Reference Variable para o Postgres; não copie usuário e senha à mão.
O Kafka ainda não é consumido pelo código, então suas variáveis podem ser
omitidas até a implementação.

## Railway: Identity Service

```env
PORT=3334
NODE_ENV=production
FRONTEND_URL=https://DOMINIO-DO-FRONTEND.vercel.app
IDENTITY_DATABASE_URL=${{Postgres-Identity.DATABASE_URL}}
GOOGLE_CLIENT_ID=valor-do-google-cloud
GOOGLE_CLIENT_SECRET=segredo-do-google-cloud
GOOGLE_CALLBACK_URL=https://DOMINIO-PUBLICO-DO-GATEWAY/auth/google/callback
JWT_ACCESS_SECRET=segredo-aleatorio-proprio
JWT_ACCESS_EXPIRATION=900
```

O refresh token é opaco, fica em cookie HttpOnly e seu hash é persistido no
banco. Por isso não existe `JWT_REFRESH_SECRET`.

Cadastre `GOOGLE_CALLBACK_URL` exatamente igual em **Authorized redirect URIs**
no Google Cloud.

## Fluxo de URLs em produção

```text
Browser na Vercel
  VITE_API_URL=https://gateway.up.railway.app
        |
        v
Gateway público no Railway
        ├── /projects, /drafts, /shares, /sessions
        |        -> Project Service pela rede privada
        └── /auth
                 -> Identity Service pela rede privada
```

## Checklist antes do deploy

- `.env.local` e `.env.compose.local` não aparecem no `git status`.
- Vercel contém somente `VITE_API_URL`.
- `VITE_API_URL` aponta para o Gateway, não para o Project Service.
- `CORS_ORIGIN` do Gateway contém a URL exata da Vercel, sem caminho.
- Project e Identity Services não possuem domínio público.
- Bancos usam Reference Variables do Railway.
- Segredos Google/JWT existem somente no Identity Service.
- Após mudar a Vercel, foi feito um novo deploy.
