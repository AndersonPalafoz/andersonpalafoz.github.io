"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, LockKeyhole, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const token = params.get("token") || "";
  const requirements = [
    { label: "Pelo menos 12 caracteres", valid: password.length >= 12 },
    { label: "Uma letra maiúscula", valid: /[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(password) },
    { label: "Um número", valid: /\d/.test(password) },
    { label: "Um símbolo", valid: /[^A-Za-zÀ-ÿ0-9]/.test(password) },
    { label: "As senhas são iguais", valid: Boolean(password) && password === confirm },
  ];
  const passwordIsStrong = requirements.every((requirement) => requirement.valid);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!passwordIsStrong) {
      toast.error("Complete todos os requisitos da nova senha.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível redefinir a senha.");
      toast.success("Senha redefinida. Você já pode entrar.");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-white">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-red-300"><LockKeyhole size={28} aria-hidden="true" /></div>
        <div className="text-center">
          <h1 className="text-2xl font-black text-foreground">Redefinir senha</h1>
          <p className="mt-2 text-sm text-muted-foreground">Crie uma senha forte para recuperar seu acesso à área do aluno externo.</p>
        </div>
        <div className="space-y-2"><label htmlFor="new-password" className="text-sm font-bold text-slate-700 dark:text-slate-200">Nova senha</label><input id="new-password" required minLength={12} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" placeholder="Digite sua nova senha" className="field-control" /></div>
        <div className="space-y-2"><label htmlFor="confirm-password" className="text-sm font-bold text-slate-700 dark:text-slate-200">Confirmar nova senha</label><input id="confirm-password" required minLength={12} type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" placeholder="Repita sua nova senha" aria-invalid={Boolean(confirm && password !== confirm)} className={`field-control ${confirm && password !== confirm ? "border-red-400" : ""}`} /></div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"><p className="mb-3 font-black">Requisitos da nova senha</p><div className="grid gap-2 sm:grid-cols-2">{requirements.map((requirement) => <span key={requirement.label} className={`flex items-center gap-2 ${requirement.valid ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}`}>{requirement.valid ? <Check size={14} /> : <X size={14} />}{requirement.label}</span>)}</div></div>
        <Button disabled={loading || !token || !passwordIsStrong} className="w-full bg-red-600 text-white hover:bg-red-700">{loading && <Loader2 className="mr-2 animate-spin" size={16} />} Salvar nova senha</Button>
        <Link href="/login" className="block text-center text-sm font-bold text-red-600 hover:underline">Voltar ao login</Link>
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">Carregando formulário...</main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
