import { LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/use-auth";

export const AccountPage = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-950">Entre para acessar sua conta</h1>
          <Button className="mt-5 w-full" onClick={() => onNavigate("/login")}>Fazer login</Button>
        </section>
      </main>
    );
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      onNavigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-24 sm:px-6">
      <section className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <div className="bg-slate-950 p-7 text-white sm:p-9">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/10"><UserRound /></div>
          <h1 className="mt-5 text-2xl font-bold">Minha conta</h1>
          <p className="mt-1 text-sm text-slate-300">Sua identidade no LabGraph.</p>
        </div>
        <div className="space-y-5 p-7 sm:p-9">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nome</p>
            <p className="mt-1 font-medium text-slate-950">{user.name}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><Mail size={14} /> E-mail</p>
            <p className="mt-1 break-all font-medium text-slate-950">{user.email}</p>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-900">
            <ShieldCheck className="mt-0.5 shrink-0" size={19} />
            <p className="text-sm leading-6">Sua sessão usa access token de curta duração e renovação protegida em cookie HttpOnly.</p>
          </div>
          <Button className="w-full" disabled={isLoggingOut} onClick={handleLogout} variant="destructive">
            <LogOut size={17} /> {isLoggingOut ? "Saindo..." : "Sair da conta"}
          </Button>
        </div>
      </section>
    </main>
  );
};
