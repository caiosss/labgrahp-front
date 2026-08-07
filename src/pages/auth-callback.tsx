import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/use-auth";
import type { AuthenticatedUser } from "../services/identity-auth-api";

type CallbackState =
  | { status: "loading" }
  | { status: "success"; user: AuthenticatedUser }
  | { status: "error"; message: string };

export function AuthCallbackPage() {
  const [state, setState] = useState<CallbackState>({ status: "loading" });
  const { refreshSession } = useAuth();

  useEffect(() => {
    let active = true;
    let redirectTimer: number | undefined;

    const finishAuthentication = async () => {
      const oauthError = new URLSearchParams(window.location.search).get("error");

      if (oauthError) {
        setState({
          status: "error",
          message: "O Google não autorizou a entrada no LabGraph.",
        });
        return;
      }

      try {
        const session = await refreshSession();

        if (!active) return;

        setState({ status: "success", user: session.user });
        redirectTimer = window.setTimeout(() => {
          window.location.replace("/");
        }, 900);
      } catch (error) {
        if (!active) return;

        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Não foi possível concluir a autenticação.",
        });
      }
    };

    void finishAuthentication();

    return () => {
      active = false;
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [refreshSession]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {state.status === "loading" && (
          <>
            <LoaderCircle className="mx-auto mb-4 size-10 animate-spin text-blue-600" />
            <h1 className="text-xl font-semibold text-slate-900">Concluindo seu login</h1>
            <p className="mt-2 text-sm text-slate-600">
              Estamos criando sua sessão segura no LabGraph.
            </p>
          </>
        )}

        {state.status === "success" && (
          <>
            <CircleCheck className="mx-auto mb-4 size-10 text-emerald-600" />
            <h1 className="text-xl font-semibold text-slate-900">Login concluído</h1>
            <p className="mt-2 text-sm text-slate-600">
              Bem-vindo, {state.user.name}. Redirecionando para o LabGraph…
            </p>
          </>
        )}

        {state.status === "error" && (
          <>
            <CircleAlert className="mx-auto mb-4 size-10 text-red-600" />
            <h1 className="text-xl font-semibold text-slate-900">Não foi possível entrar</h1>
            <p className="mt-2 text-sm text-slate-600">{state.message}</p>
            <a
              className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              href="/"
            >
              Voltar ao início
            </a>
          </>
        )}
      </section>
    </main>
  );
}
