# Microsserviços no LabGraph

## O que mudou

O frontend continua usando as mesmas rotas, mas agora deve apontar `VITE_API_URL`
para o **API Gateway**. Ele é a porta pública e decide qual serviço recebe cada
requisição.

```text
Frontend (Vercel)
       |
       v
API Gateway :3000
  |                 |
  v                 v
Project Service     Identity Service
(apps/api) :3333    :3334
projetos, drafts,   login local e Google
shares e sessões    (contratos ainda em 501)
```

O backend anterior foi preservado em `apps/api` e agora é chamado de
`project-service`. A sessão anônima também permanece nele temporariamente para
não quebrar o sistema. Quando o login estiver pronto, migre a identificação do
usuário para o `identity-service` e troque `ownerSessionId` por `ownerUserId`.

## Como executar localmente

### Com Docker (recomendado para estudar a arquitetura completa)

```bash
npm run docker:up
```

Esse comando constrói os três serviços e inicia também dois PostgreSQL e um
Kafka local em modo KRaft. Para encerrar sem apagar os dados:

```bash
npm run docker:down
```

O frontend continua fora do Compose para manter o hot reload do Vite. Execute
`npm run dev:web` em outro terminal. O comando `npm run docker:down` preserva os
volumes. Não use a opção `-v` em ambientes com dados importantes: ela remove
deliberadamente os bancos locais e os dados do Kafka e não faz parte de nenhum
build ou deploy do projeto.

### Sem Docker

Use três terminais:

```bash
npm run dev:api
npm run dev:identity
npm run dev:gateway
```

Depois execute o frontend com `npm run dev:web` e configure:

```env
VITE_API_URL=http://localhost:3000
```

Teste `GET http://localhost:3000/health`. As rotas atuais (`/sessions`,
`/projects`, `/drafts` e `/shares`) passam pelo gateway. As rotas `/auth/*` vão
para o serviço de identidade e retornam `501 Not Implemented` de propósito.

## Seu caminho para implementar autenticação

1. No `identity-service`, adicione NestJS (ou mantenha Node), Prisma e um banco
   próprio com `User`, `Account`, `Session` e `RefreshToken`.
2. Implemente `POST /auth/register` com hash de senha e `POST /auth/login`.
3. Implemente OAuth 2.0/OpenID Connect em `GET /auth/google` e no callback.
   Vincule a conta Google a `User`; não crie dois usuários para o mesmo e-mail.
4. Emita access token curto e refresh token rotativo. Nunca armazene senha,
   token Google ou refresh token em texto puro.
5. Faça o gateway validar o token ou encaminhá-lo; o Project Service deve usar
   o `userId` confiável para autorização.
6. Migre os projetos anônimos para a conta no primeiro login. Essa associação
   mantém o trabalho feito antes do cadastro.

Os nomes de rotas estão em `apps/identity-service/src/main.mjs`. A separação das
variáveis locais e de produção está documentada em `docs/AMBIENTES.md`.

## Seu caminho para implementar Kafka

Kafka não substitui chamadas HTTP que precisam de resposta imediata. Continue
usando HTTP para salvar/ler um projeto. Publique eventos depois de uma mudança,
por exemplo `project.updated.v1`, para tarefas assíncronas como auditoria,
notificação ou métricas.

O tipo `IntegrationEvent` em `packages/shared/src/index.ts` define o envelope.
Próximos passos:

1. Suba Kafka localmente e escolha um cliente Node.
2. Crie um producer por serviço e consumers com `groupId` próprio.
3. Comece com `identity.user.registered.v1` e `project.updated.v1`.
4. Grave evento e mudança de banco na mesma transação usando o padrão Outbox;
   um worker publica a outbox no Kafka.
5. Torne consumers idempotentes guardando o `event.id` já processado.

## Railway e Vercel

No Railway, crie três serviços apontando para o mesmo repositório, mas com estes
diretórios raiz:

| Serviço | Diretório | Variáveis principais |
| --- | --- | --- |
| gateway | `apps/api-gateway` | `PROJECT_SERVICE_URL`, `IDENTITY_SERVICE_URL`, `CORS_ORIGIN` |
| projects | `apps/api` | `DATABASE_URL` |
| identity | `apps/identity-service` | variáveis Google, JWT e banco de identidade |

Use os domínios internos do Railway nas duas URLs de serviço do gateway. Só o
gateway precisa de domínio público. Na Vercel, `VITE_API_URL` deve conter esse
domínio público e `CORS_ORIGIN` deve conter o domínio do frontend.

## Resumo

Microsserviços separam responsabilidades e podem ser publicados/escalados de
forma independente. No LabGraph, a Vercel chama apenas o Gateway; o Gateway
encaminha dados de gráficos/tabelas ao Project Service e autenticação ao
Identity Service. Kafka liga serviços de forma assíncrona por eventos. Docker
padroniza o ambiente local e as imagens de cada serviço, enquanto o Railway
orquestra esses serviços em produção. A separação traz autonomia, mas também
rede, observabilidade e consistência distribuída; por isso a migração foi
preparada em etapas, mantendo o sistema atual funcionando.
