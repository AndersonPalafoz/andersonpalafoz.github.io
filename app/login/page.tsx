
"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard/cursos" });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Anderson Palafoz
          </h1>
          <p className="text-gray-600">
            Plataforma de Ensino de Inglês
          </p>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-lg border border-gray-200 bg-white shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Bem-vindo!</h2>
            <p className="text-sm text-gray-600">
              Faça login para acessar seus cursos e materiais
            </p>
          </div>

          {/* Google Sign In */}
          <Button
            onClick={handleGoogleSignIn}
            className="w-full gap-2 h-11 bg-red-600 hover:bg-red-700 text-white font-medium"
            size="lg"
          >
            <Mail size={20} />
            Entrar com Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-600">Ou</span>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 rounded-lg bg-gray-50 space-y-2">
            <p className="text-sm font-medium text-gray-900">
              Primeira vez aqui?
            </p>
            <p className="text-xs text-gray-600">
              Você será registrado automaticamente ao fazer login com sua conta
              Google.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          <Link href="/" className="text-sm text-red-600 hover:underline font-medium">
            Voltar para Home
          </Link>
          <p className="text-xs text-gray-600">
            © 2024 Anderson Palafoz. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
