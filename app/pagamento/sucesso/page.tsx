"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentData {
  session: { paymentStatus: string | null; amountTotal: number | null; currency: string | null };
  course: { id: number; title: string; level: string } | null;
  enrollment: { courseId: number; status: string } | null;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [data, setData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Sessão de pagamento não encontrada.");
      setLoading(false);
      return;
    }
    fetch(`/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Não foi possível confirmar o pagamento.");
        setData(payload);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Erro ao confirmar pagamento."))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin text-red-600" size={40} /></div>;
  if (error || !data) return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6"><div className="max-w-md rounded-2xl bg-white border border-red-100 p-8 text-center shadow-sm"><p className="font-bold text-red-700">{error || "Não foi possível confirmar a compra."}</p><Link href="/aulas" className="mt-5 inline-flex rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white">Voltar aos cursos</Link></div></div>;

  const amount = data.session.amountTotal ? (data.session.amountTotal / 100).toLocaleString("pt-BR", { style: "currency", currency: data.session.currency?.toUpperCase() || "BRL" }) : "Pagamento confirmado";
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-red-100 p-8 md:p-12 text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner"><CheckCircle2 size={44} /></div>
        <div className="space-y-2"><span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-green-100 text-green-700">Pagamento aprovado via Stripe</span><h1 className="text-3xl font-extrabold text-gray-900">Seu acesso está liberado.</h1><p className="text-gray-600 text-sm">Sua transação foi processada com segurança e a matrícula foi vinculada à sua conta.</p></div>
        {data.course && <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-left space-y-3"><p className="text-xs font-bold uppercase text-gray-500">Curso adquirido</p><h2 className="text-xl font-black text-gray-900">{data.course.title}</h2><div className="flex justify-between text-sm text-gray-600"><span>Nível {data.course.level}</span><span className="font-bold text-gray-900">{amount}</span></div></div>}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-green-700"><ShieldCheck size={14} /> Transação e liberação verificadas</div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2"><Link href={data.course ? `/cursos/${data.course.id}` : "/dashboard/cursos"} className="flex-1"><Button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold h-12 rounded-xl gap-2 shadow-md shadow-red-600/20">Acessar curso <ArrowRight size={16} /></Button></Link><Link href="/dashboard/compras" className="flex-1"><Button variant="outline" className="w-full h-12 rounded-xl font-semibold border-gray-300">Histórico de compras</Button></Link></div>
        <p className="text-xs text-gray-400 pt-2">O recibo detalhado permanece disponível no histórico de compras da sua conta.</p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin text-red-600" size={40} /></div>}><PaymentSuccessContent /></Suspense>;
}
