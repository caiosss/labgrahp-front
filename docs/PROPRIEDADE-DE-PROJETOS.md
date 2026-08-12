# Propriedade de projetos

## Objetivo

O Project Service aceita temporariamente dois tipos de proprietário:

```text
visitante anônimo -> Session do Project Service
usuário autenticado -> userId emitido pelo Identity Service
```

Essa transição preserva o funcionamento anterior enquanto prepara a migração dos
projetos anônimos no próximo passo.

## Modelo de dados

Um projeto possui exatamente um dos campos:

```text
ownerSessionId preenchido + ownerUserId nulo -> projeto anônimo
ownerSessionId nulo + ownerUserId preenchido -> projeto autenticado
```

`ownerUserId` não possui foreign key para a tabela `User`, pois o usuário está no
banco do Identity Service. Bancos de microsserviços não devem criar relações SQL
entre si.

A constraint `projects_exactly_one_owner_check` impede que ambos os campos fiquem
preenchidos ou nulos ao mesmo tempo.

## ProjectPrincipal

O controller não precisa saber como cada credencial foi validada. Ele recebe uma
união discriminada:

```ts
type ProjectPrincipal =
  | { type: "anonymous"; sessionId: string }
  | { type: "identity"; userId: string };
```

O `ProjectPrincipalGuard` interpreta o bearer token:

- token com três partes (`header.payload.signature`): valida como JWT;
- token opaco: calcula o hash e procura uma sessão anônima;
- JWT adulterado: retorna `401`, sem tentar tratá-lo como sessão anônima.

## Autorização

O repository transforma o principal em filtro Prisma:

```ts
principal.type === "identity"
  ? { ownerUserId: principal.userId }
  : { ownerSessionId: principal.sessionId };
```

Todas as operações de listar, ler, salvar, excluir e compartilhar utilizam esse
filtro. O `userId` nunca é aceito no corpo ou na URL enviados pelo frontend.

## Frontend

As rotas de projetos e de criação/revogação de compartilhamentos usam:

```ts
authentication: "identity-or-anonymous"
```

O cliente escolhe:

- access JWT quando existe uma sessão autenticada;
- token anônimo quando não existe access JWT.

Se um JWT expirar, o cliente tenta o refresh e repete a requisição uma vez. Ele
não muda silenciosamente para uma sessão anônima, porque isso trocaria o escopo de
dados durante a mesma operação.

O `App` aguarda a restauração inicial do `AuthProvider` antes de montar a tela que
busca projetos. Isso evita carregar projetos anônimos enquanto o refresh da conta
autenticada ainda está em andamento.

## Limite atual

Projetos anônimos criados antes do login continuam pertencendo à sessão anônima e
não aparecem na lista do usuário autenticado. Isso é esperado: a transferência
segura desses projetos será implementada no passo 5.

Drafts também continuam associados apenas à sessão anônima nesta etapa.

## Testes esperados

| Cenário | Resultado |
| --- | --- |
| Token anônimo cria projeto | projeto recebe `ownerSessionId` |
| JWT cria projeto | projeto recebe `ownerUserId` |
| Anônimo lista projetos | vê apenas os da sua sessão |
| Usuário lista projetos | vê apenas os do seu `userId` |
| Outro usuário tenta sobrescrever projeto | `403 Forbidden` |
| JWT adulterado | `401 Unauthorized` |
| Projeto autenticado é compartilhado | link público funciona |
