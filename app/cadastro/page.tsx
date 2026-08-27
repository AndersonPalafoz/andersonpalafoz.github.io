"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { CheckCircle2, GraduationCap, Loader2, ShieldCheck } from "lucide-react";

export default function CadastroPage() {
  const { data: session, status, update } = useSession();
  const [requestedRole, setRequestedRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const passwordChecks = {
    length: password.length >= 8,
    letter: /[A-Za-zÀ-ÿ]/.test(password),
    number: /\d/.test(password),
  };

  const submitRegistration = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true); setMessage(null); setError(null);
      const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Não foi possível criar a conta.");
      const login = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/cadastro" });
      if (login?.error) throw new Error("Conta criada. Entre pela página de login para continuar.");
      await update();
      setMessage("Conta criada. Agora solicite o papel de aluno ou professor para liberar o acesso correspondente.");
    } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível criar a conta."); } finally { setSaving(false); }
  };

  const submitRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      setError(null);
      const response = await fetch("/api/user/request-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestedRole }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível enviar a solicitação");
      setMessage("Solicitação enviada. Aguarde a análise de um professor ou administrador.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar a solicitação");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="site-shell min-h-screen px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-8">
        <section className="min-w-0">
          <p className="eyebrow">Acesso acadêmico</p>
          <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-foreground">Solicite seu papel na plataforma</h1>
          <p className="mt-4 text-base leading-8 text-muted-foreground sm:text-lg">Toda conta começa com acesso pendente. Escolha o tipo de participação que deseja solicitar; o papel efetivo só será alterado depois da análise correspondente.</p>
          <div className="mt-6 grid gap-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-3"><CheckCircle2 className="text-green-600" size={18} /> Aluno: revisão por professor aprovado ou super-admin.</p>
            <p className="flex items-center gap-3"><ShieldCheck className="text-red-600" size={18} /> Professor: aprovação exclusiva do super-admin.</p>
            <p className="flex items-center gap-3"><GraduationCap className="text-blue-600" size={18} /> O pedido não altera permissões enquanto estiver pendente.</p>
          </div>
          <ol className="mt-7 grid grid-cols-2 gap-3" aria-label="Como funciona o cadastro">
            <li className="rounded-2xl border border-border/70 bg-card p-4"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-black text-white">1</span><p className="mt-3 text-sm font-black text-foreground">Crie sua conta</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Use um e-mail que você acessa.</p></li>
            <li className="rounded-2xl border border-border/70 bg-card p-4"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-black text-white">2</span><p className="mt-3 text-sm font-black text-foreground">Solicite o acesso</p><p className="mt-1 text-xs leading-5 text-muted-foreground">A equipe avalia o papel solicitado.</p></li>
          </ol>
        </section>

        <section className="surface-card p-5 sm:p-8" aria-label="Formulário de cadastro">
          {status === "loading" ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-red-600" /></div>
          ) : !session?.user ? (
            <form onSubmit={submitRegistration} className="space-y-4" noValidate={false}>
              <h2 className="text-2xl font-black text-foreground">Criar conta</h2>
              <p className="text-sm text-muted-foreground">Você poderá solicitar o papel de aluno ou professor após o cadastro.</p>
              <div><label htmlFor="registration-name" className="mb-1.5 block text-sm font-bold text-foreground">Nome completo</label><input id="registration-name" required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Como você gostaria de ser chamado(a)?" className="field-control" /></div>
              <div><label htmlFor="registration-email" className="mb-1.5 block text-sm font-bold text-foreground">E-mail</label><input id="registration-email" required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" className="field-control" /></div>
              <div><label htmlFor="registration-password" className="mb-1.5 block text-sm font-bold text-foreground">Senha</label><input id="registration-password" required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} aria-describedby="password-guidance" placeholder="Crie uma senha segura" className="field-control" /><div id="password-guidance" aria-live="polite" className="mt-2 rounded-xl border border-border/70 bg-muted/35 p-3"><p className="text-xs font-bold text-foreground">Use pelo menos:</p><ul className="mt-1.5 grid gap-1 text-xs"><li className={passwordChecks.length ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}>{passwordChecks.length ? "✓" : "○"} 8 caracteres</li><li className={passwordChecks.letter ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}>{passwordChecks.letter ? "✓" : "○"} uma letra</li><li className={passwordChecks.number ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}>{passwordChecks.number ? "✓" : "○"} um número</li></ul></div></div>
              <button type="submit" disabled={saving} aria-busy={saving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60">{saving && <Loader2 className="animate-spin" size={18} />} {saving ? "Criando conta…" : "Criar conta"}</button>
              <p className="text-center text-sm text-muted-foreground">Já possui conta? <Link href="/login" className="font-bold text-red-600 hover:underline">Entrar</Link></p>
              {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">{message}</p>}
              {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{error}</p>}
            </form>
          ) : (
            <form onSubmit={submitRequest} className="space-y-6">
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Conta conectada como</p>
                <p className="mt-1 font-semibold text-foreground">{session.user.email}</p>
              </div>
              <div>
                <label htmlFor="requestedRole" className="block text-sm font-semibold text-foreground">Papel desejado</label>
                <select id="requestedRole" value={requestedRole} onChange={(event) => setRequestedRole(event.target.value)} className="field-control mt-2">
                  <option value="student">Aluno</option>
                  <option value="professor">Professor</option>
                </select>
              </div>
              <button type="submit" disabled={saving} aria-busy={saving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                {saving && <Loader2 className="animate-spin" size={18} />} {saving ? "Enviando solicitação…" : "Enviar solicitação"}
              </button>
              {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">{message}</p>}
              {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{error}</p>}
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
