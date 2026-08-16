"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"login" | "email" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard/cursos" });
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha o e-mail e a senha.");
      return;
    }

    try {
      setLoading(true);
      const result = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/dashboard" });
      if (result?.error) throw new Error("E-mail ou senha inválidos.");
      toast.success("Login realizado com sucesso!");
      router.push(result?.url || "/dashboard");
    } catch {
      toast.error("Erro ao autenticar. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Informe seu e-mail cadastrado.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível solicitar recuperação.");
      toast.success(data.message || "Se o e-mail estiver cadastrado, enviaremos instruções.");
      setAuthMode("login");
    } catch {
      toast.error("Erro ao solicitar recuperação de senha.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminQuickLogin = () => {
    setEmail("palafozanderson@gmail.com");
    setPassword("admin123");
    toast.success("Credenciais de Super-Admin preenchidas!");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="text-sm font-semibold text-red-600 hover:underline flex items-center gap-1 mb-6 justify-center">
          <ArrowLeft size={16} /> Voltar para a Página Inicial
        </Link>
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4">
          AP
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          {authMode === "forgot" ? "Recuperar Acesso" : "Acesse sua Conta"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Plataforma de Ensino de Inglês e Hub Acadêmico de Anderson Palafoz
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-2xl sm:px-10 space-y-6">
          {authMode === "forgot" ? (
            <form onSubmit={handleForgotPassword} className="space-y-4 animate-in fade-in">
              <p className="text-xs text-gray-600">
                Digite seu e-mail cadastrado para receber um link seguro de redefinição de senha.
              </p>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">E-mail Cadastrado</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full h-11 px-4 rounded-xl border border-gray-300 outline-none focus:border-red-600 text-sm"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 h-11 rounded-xl">
                {loading ? <><Loader2 className="animate-spin mr-2" size={16} /> Enviando...</> : "Enviar Link de Recuperação"}
              </Button>

              <div className="text-center pt-2">
                <button type="button" onClick={() => setAuthMode("login")} className="text-xs text-red-600 font-bold hover:underline">
                  Voltar ao Login
                </button>
              </div>
            </form>
          ) : authMode === "email" ? (
            <form onSubmit={handleCredentialsLogin} className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full h-11 px-4 rounded-xl border border-gray-300 outline-none focus:border-red-600 text-sm"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold uppercase text-gray-600">Senha</label>
                  <button type="button" onClick={() => setAuthMode("forgot")} className="text-xs text-red-600 font-semibold hover:underline">
                    Esqueceu a senha?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 rounded-xl border border-gray-300 outline-none focus:border-red-600 text-sm"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 h-11 rounded-xl">
                {loading ? <><Loader2 className="animate-spin mr-2" size={16} /> Autenticando...</> : "Entrar na Plataforma"}
              </Button>

              <div className="pt-2 flex justify-between items-center text-xs">
                <button type="button" onClick={() => setAuthMode("login")} className="text-gray-500 hover:underline">
                  Voltar às opções
                </button>
                <button type="button" onClick={handleAdminQuickLogin} className="text-red-600 font-bold hover:underline">
                  Preencher Super-Admin
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <Button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-3 h-11 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Entrar com Google OAuth
              </Button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase font-bold">Ou com e-mail</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <Button
                variant="outline"
                onClick={() => setAuthMode("email")}
                className="w-full py-3 h-11 rounded-xl border-gray-300 font-semibold"
              >
                <Mail size={16} className="mr-2" /> Entrar com E-mail e Senha
              </Button>
            </div>
          )}

          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
            <p className="font-bold flex items-center gap-1"><ShieldCheck size={14} /> Conta Super-Admin Master:</p>
            <p><b>E-mail:</b> palafozanderson@gmail.com</p>
            <p className="text-gray-600">Acesso total com privilégios de gestão de cursos, aprovação de alunos e professores, e controle do site.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
