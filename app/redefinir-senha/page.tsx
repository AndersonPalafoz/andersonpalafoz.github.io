"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const token = params.get("token") || "";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600"><LockKeyhole size={28} /></div>
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-900">Redefinir senha</h1>
          <p className="mt-2 text-sm text-gray-600">Crie uma nova senha com pelo menos 8 caracteres, uma letra e um número.</p>
        </div>
        <input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nova senha" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100" />
        <input required minLength={8} type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Confirmar nova senha" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100" />
        <Button disabled={loading || !token} className="w-full bg-red-600 text-white hover:bg-red-700">{loading && <Loader2 className="mr-2 animate-spin" size={16} />} Salvar nova senha</Button>
        <Link href="/login" className="block text-center text-sm font-bold text-red-600 hover:underline">Voltar ao login</Link>
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-600">Carregando formulário...</main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
