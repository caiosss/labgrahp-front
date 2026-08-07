# AuthProvider do frontend

## Responsabilidade

O `AuthProvider` é a fonte central de estado da autenticação no React. Ele
mantém em memória:

- o usuário autenticado;
- o access token atual;
- o estado de inicialização;
- as operações de login, Google, refresh e logout.

O refresh token nunca é acessado pelo React. Ele permanece no cookie `HttpOnly`
e é enviado automaticamente pelo navegador com `credentials: "include"`.

## Montagem

O provider envolve toda a aplicação em `src/main.tsx`:

```tsx
<AuthProvider>
  <App />
</AuthProvider>
```

Assim, qualquer componente descendente pode usar o hook:

```tsx
const {
  accessToken,
  isAuthenticated,
  isLoading,
  login,
  loginWithGoogle,
  logout,
  refreshSession,
  user,
} = useAuth();
```

## Restauração ao abrir o aplicativo

1. Se existir um access token no `sessionStorage`, o provider consulta
   `GET /auth/me`.
2. Se o token expirou, tenta `POST /auth/refresh` usando o cookie `HttpOnly`.
3. Se não houver access token, também tenta restaurar a sessão pelo cookie.
4. Um `401` limpa o estado e representa um visitante anônimo.
5. Durante esse processo, `isLoading` permanece `true`.

O callback do Google é uma exceção: a própria página
`/auth/callback` chama `refreshSession`, atualiza o provider e redireciona para a
home.

## Login local

```tsx
await login({ email, password });
```

O Identity Service retorna o usuário e o access token, enquanto configura o
refresh token no cookie.

## Login com Google

```tsx
loginWithGoogle();
```

Essa operação faz uma navegação normal para `/auth/google`. Não deve ser feita
com `fetch`, pois o navegador precisa navegar até o Google e retornar pelo
callback.

## Logout

```tsx
await logout();
```

O backend revoga a `RefreshSession`, limpa o cookie e o provider remove o access
token e o usuário locais mesmo se houver uma falha de rede durante a saída.

## Contrato preparado para o passo 2

O próximo passo poderá obter `accessToken` por `useAuth` nos componentes. Como o
cliente HTTP não pode chamar hooks diretamente, a integração deverá usar uma
função de acesso ao token ou receber o token como dependência.

O comportamento esperado será:

```text
requisição autenticada
  -> Authorization: Bearer <accessToken>
  -> resposta 401
  -> POST /auth/refresh uma vez
  -> repetir a requisição uma vez
```

O token anônimo existente não foi substituído neste passo. Isso evita alterar a
semântica atual do Project Service antes de ele aprender a validar o JWT do
Identity Service.

## Preparação dos passos 3 a 6

- **Passo 3:** o Project Service receberá o access token emitido pelo Identity
  Service e extrairá o `sub` validado.
- **Passo 4:** o `sub` será usado como `ownerId` dos projetos.
- **Passo 5:** o token da sessão anônima poderá ser enviado junto da primeira
  autenticação para reivindicar projetos existentes.
- **Passo 6:** a conclusão dessa migração poderá publicar um evento no Kafka sem
  mudar o contrato do provider.

## Arquivos

```text
src/auth/auth-context.ts
src/auth/auth-provider.tsx
src/hooks/use-auth.ts
src/services/auth-session-storage.ts
src/services/identity-auth-api.ts
src/pages/auth-callback.tsx
```
