import { ArrowLeft, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { GoogleLogo } from "../components/auth/google-logo";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../hooks/use-auth";

interface AuthPageProps {
  mode: "login" | "register";
  onNavigate: (path: string) => void;
}

export const AuthPage = ({ mode, onNavigate }: AuthPageProps) => {
  const { isAuthenticated, login, loginWithGoogle, register, user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const isRegister = mode === "register";

  if (isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl shadow-slate-900/5">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <UserRound />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-950">Você já está conectado</h1>
          <p className="mt-2 text-sm text-slate-600">Sessão ativa como {user?.email}.</p>
          <Button className="mt-6 w-full" onClick={() => onNavigate("/account")}>
            Abrir minha conta
          </Button>
        </section>
      </main>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    setIsSubmitting(true);

    try {
      if (isRegister) {
        await register({ name, email, password });
      } else {
        await login({ email, password });
      }

      onNavigate("/");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível concluir a autenticação.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-8 sm:py-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.16),_transparent_62%)]" />
      <div className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <button className="inline-flex w-fit items-center gap-2 text-sm text-slate-300 hover:text-white" onClick={() => onNavigate("/")}>
            <ArrowLeft size={16} /> Voltar ao LabGraph
          </button>
          <div>
            <img alt="LabGraph" className="size-16 rounded-2xl bg-white object-cover" src="/logo/labgraph-dark.png" />
            <h2 className="mt-6 text-3xl font-bold">Seus projetos, em qualquer dispositivo.</h2>
            <p className="mt-4 leading-7 text-slate-300">
              Entre para sincronizar gráficos e tabelas. Os projetos criados antes do login serão transferidos automaticamente para sua conta.
            </p>
          </div>
          <p className="text-xs text-slate-400">Access token curto + refresh token protegido por cookie HttpOnly.</p>
        </aside>

        <section className="p-5 sm:p-9 lg:p-12">
          <button className="mb-7 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950 lg:hidden" onClick={() => onNavigate("/")}>
            <ArrowLeft size={16} /> Voltar
          </button>

          <div className="mb-7">
            <span className="text-sm font-semibold text-blue-600">{isRegister ? "Nova conta" : "Bem-vindo de volta"}</span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {isRegister ? "Crie sua conta" : "Entre no LabGraph"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {isRegister
                ? "Cadastre-se gratuitamente e continue de onde parou."
                : "Use seu e-mail e senha ou continue com o Google."}
            </p>
          </div>

          <Button className="h-11 w-full bg-white text-slate-800 shadow-sm hover:bg-slate-50" onClick={loginWithGoogle} type="button" variant="outline">
            <GoogleLogo /> Fazer login com o Google
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" /> ou continue com e-mail <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={17} />
                  <Input autoComplete="name" id="name" minLength={2} onChange={(event) => setName(event.target.value)} placeholder="Como devemos chamar você?" required value={name} className="pl-10" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={17} />
                <Input autoComplete="email" id="email" onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" required type="email" value={email} className="pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={17} />
                <Input autoComplete={isRegister ? "new-password" : "current-password"} className="pl-10 pr-11" id="password" minLength={8} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" required type={showPassword ? "text" : "password"} value={password} />
                <button aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} className="absolute right-2 top-2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={() => setShowPassword((current) => !current)} type="button">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}

            <Button className="h-11 w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting} type="submit">
              {isSubmitting && <LoaderCircle className="animate-spin" size={17} />}
              {isSubmitting ? "Aguarde..." : isRegister ? "Criar conta" : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            {isRegister ? "Já possui uma conta?" : "Ainda não possui uma conta?"}{" "}
            <button className="font-semibold text-blue-600 hover:text-blue-700" onClick={() => onNavigate(isRegister ? "/login" : "/register")}>
              {isRegister ? "Fazer login" : "Cadastre-se"}
            </button>
          </p>
        </section>
      </div>
    </main>
  );
};
