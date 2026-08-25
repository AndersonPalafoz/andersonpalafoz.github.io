"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LockKeyhole, Loader2, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function PrimeiroAcessoPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const requirements = [
    { label: "Pelo menos 12 caracteres", valid: password.length >= 12 },
    { label: "Uma letra maiúscula", valid: /[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(password) },
    { label: "Um número", valid: /\d/.test(password) },
    { label: "Um símbolo", valid: /[^A-Za-zÀ-ÿ0-9]/.test(password) },
    { label: "As senhas são iguais", valid: Boolean(password) && password === confirmation },
  ];
  const passwordIsStrong = requirements.slice(0, 4).every((requirement) => requirement.valid) && requirements[4].valid;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      if (!passwordIsStrong) { toast.error("Complete todos os requisitos da senha antes de continuar."); return; }
      setLoading(true);
      const response = await fetch("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, confirmation }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível atualizar a senha.");
      toast.success(data.message);
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar a senha.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="site-shell flex min-h-screen items-center justify-center px-4 py-10"><section className="surface-card w-full max-w-lg rounded-3xl p-6 sm:p-10"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"><LockKeyhole size={26} /></div><h1 className="mt-5 text-center text-2xl font-black text-foreground">Defina sua senha pessoal</h1><p className="mt-2 text-center text-sm leading-6 text-muted-foreground">Esta é a primeira entrada da sua conta externa. A senha temporária não poderá continuar sendo usada.</p><form onSubmit={handleSubmit} className="mt-7 space-y-4"><label className="block text-sm font-bold text-foreground">Nova senha<input required type="password" minLength={12} value={password} onChange={(event) => setPassword(event.target.value)} className="field-control mt-2" placeholder="Mínimo de 12 caracteres" /></label><label className="block text-sm font-bold text-foreground">Confirmar nova senha<input required type="password" minLength={12} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className={`field-control mt-2 ${confirmation && password !== confirmation ? "border-red-400 focus:border-red-500" : ""}`} placeholder="Repita a senha" /></label><div className="rounded-2xl border border-border bg-muted/40 p-4 text-xs leading-5 text-foreground"><div className="mb-3 flex items-center gap-2 font-black"><ShieldCheck size={15} />Requisitos da senha</div><div className="grid gap-2 sm:grid-cols-2">{requirements.map((requirement) => <div key={requirement.label} className={`flex items-center gap-2 ${requirement.valid ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}`}>{requirement.valid ? <Check size={15} /> : <X size={15} />}{requirement.label}</div>)}</div></div><Button type="submit" disabled={loading || !passwordIsStrong} className="h-11 w-full rounded-xl bg-red-600 font-bold text-white hover:bg-red-700">{loading ? <><Loader2 className="mr-2 animate-spin" size={16} />Atualizando...</> : "Salvar senha e entrar"}</Button></form></section></main>;
}
