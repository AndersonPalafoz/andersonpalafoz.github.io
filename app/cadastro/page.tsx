"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { CheckCircle2, GraduationCap, Loader2, ShieldCheck } from "lucide-react";

export default function CadastroPage() {
  const { data: session, status } = useSession();
  const [requestedRole, setRequestedRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submitRegistration = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true); setMessage(null); setError(null);
      const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível criar a conta.");
      const login = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/cadastro" });
      if (login?.error) throw new Error("Conta criada. Entre pela página de login para continuar.");
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
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">Acesso acadêmico</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-gray-900">Solicite seu papel na plataforma</h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">Toda conta começa com acesso pendente. Escolha o tipo de participação que deseja solicitar; o papel efetivo só será alterado depois da análise correspondente.</p>
          <div className="mt-6 space-y-3 text-sm text-gray-700">
            <p className="flex items-center gap-3"><CheckCircle2 className="text-green-600" size={18} /> Aluno: revisão por professor aprovado ou super-admin.</p>
            <p className="flex items-center gap-3"><ShieldCheck className="text-red-600" size={18} /> Professor: aprovação exclusiva do super-admin.</p>
            <p className="flex items-center gap-3"><GraduationCap className="text-blue-600" size={18} /> O pedido não altera permissões enquanto estiver pendente.</p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          {status === "loading" ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-red-600" /></div>
          ) : !session?.user ? (
            <form onSubmit={submitRegistration} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Criar conta</h2>
              <p className="text-sm text-gray-600">Você poderá solicitar o papel de aluno ou professor após o cadastro.</p>
              <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome completo" className="w-full rounded-xl border border-gray-300 px-4 py-3" />
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="E-mail" className="w-full rounded-xl border border-gray-300 px-4 py-3" />
              <input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Senha (8+ caracteres, letra e número)" className="w-full rounded-xl border border-gray-300 px-4 py-3" />
              <button type="submit" disabled={saving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60">{saving && <Loader2 className="animate-spin" size={18} />} Criar conta</button>
              <p className="text-center text-sm text-gray-600">Já possui conta? <Link href="/login" className="font-bold text-red-600 hover:underline">Entrar</Link></p>
              {message && <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{message}</p>}
              {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
            </form>
          ) : (
            <form onSubmit={submitRequest} className="space-y-6">
              <div>
                <p className="text-sm text-gray-500">Conta conectada como</p>
                <p className="mt-1 font-semibold text-gray-900">{session.user.email}</p>
              </div>
              <div>
                <label htmlFor="requestedRole" className="block text-sm font-semibold text-gray-700">Papel desejado</label>
                <select id="requestedRole" value={requestedRole} onChange={(event) => setRequestedRole(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3">
                  <option value="student">Aluno</option>
                  <option value="professor">Professor</option>
                </select>
              </div>
              <button type="submit" disabled={saving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                {saving && <Loader2 className="animate-spin" size={18} />} Enviar solicitação
              </button>
              {message && <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{message}</p>}
              {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
