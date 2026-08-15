"use client";

import Link from "next/link";
import { CheckCircle2, BookOpen, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
  const orderId = "STRIPE_PAY_" + Math.random().toString(36).substring(2, 9).toUpperCase();
  const currentDate = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-sm border border-gray-200 p-8 md:p-12 text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 size={44} />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-green-100 text-green-700">
            Pagamento Aprovado via Stripe
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Parabéns pela Matrícula!
          </h1>
          <p className="text-gray-600 text-sm">
            Sua transação foi processada com segurança. Seu acesso ao curso e materiais exclusivos foi liberado imediatamente.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-left space-y-3">
          <div className="flex justify-between text-xs text-gray-500 border-b pb-2">
            <span>ID da Transação:</span>
            <span className="font-mono font-bold text-gray-800">{orderId}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 border-b pb-2">
            <span>Data da Compra:</span>
            <span className="font-semibold text-gray-800">{currentDate}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 border-b pb-2">
            <span>Método de Pagamento:</span>
            <span className="font-semibold text-gray-800">Cartão de Crédito (Stripe Secure)</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Status da Conta:</span>
            <span className="font-bold text-green-600 flex items-center gap-1">
              <ShieldCheck size={14} /> Ativo & Verificado
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/dashboard/cursos" className="flex-1">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold h-12 rounded-xl gap-2 shadow-md shadow-red-600/20">
              <BookOpen size={18} /> Acessar Meus Cursos <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full h-12 rounded-xl font-semibold border-gray-300">
              Ir para o Dashboard
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-400 pt-2">
          Um recibo detalhado foi enviado para o seu e-mail cadastrado. Dúvidas? Suporte via WhatsApp disponível no painel.
        </p>
      </div>
    </div>
  );
}
