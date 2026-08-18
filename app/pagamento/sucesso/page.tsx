"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentData {
  session: {
    id: string;
    paymentStatus: string | null;
    status: string | null;
    amountTotal: number | null;
    currency: string | null;
  };
  course: { id: number; title: string; level: string } | null;
  enrollment: { id: number; courseId: number; status: string } | null;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id")?.trim() || "";
  const [data, setData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const confirmPayment = useCallback(async (signal?: AbortSignal) => {
    if (!sessionId) {
      setData(null);
      setError("Sessão de pagamento não encontrada. Retorne ao histórico de compras para conferir o pedido.");
      setLoading(false);
      return;
    }

    setError(null);
    setRetrying(true);
    try {
      const response = await fetch(`/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`, {
        cache: "no-store",
        signal,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || "Não foi possível confirmar o pagamento.");
      }
      if (payload?.session?.paymentStatus !== "paid") {
        throw new Error("O Stripe ainda não confirmou o pagamento desta sessão.");
      }
      setData(payload as PaymentData);
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      setData(null);
      setError(reason instanceof Error ? reason.message : "Erro ao confirmar pagamento.");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setRetrying(false);
      }
    }
  }, [sessionId]);

  useEffect(() => {
    const controller = new AbortController();
    void confirmPayment(controller.signal);
    return () => controller.abort();
  }, [confirmPayment]);

  if (loading) {
    return (
      <div className="site-shell min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 p-6" role="status" aria-live="polite">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300">
          <Loader2 className="animate-spin" size={32} aria-hidden="true" />
        </div>
        <p className="text-center text-sm font-semibold tracking-tight">Confirmando a transação no Stripe e verificando seu acesso...</p>
        <span className="sr-only">Aguarde enquanto validamos os dados reais do pagamento.</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="site-shell min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl bg-card border border-border p-8 text-center shadow-lg space-y-4">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300">
            <TriangleAlert size={24} aria-hidden="true" />
          </div>
          <h1 className="text-xl font-black">Falha na verificação</h1>
          <p className="text-sm leading-6 text-muted-foreground">{error || "Não foi possível confirmar a compra."}</p>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button onClick={() => void confirmPayment()} disabled={retrying} className="flex-1 bg-red-600 font-bold text-white hover:bg-red-700">
              {retrying ? <Loader2 className="animate-spin" size={15} aria-hidden="true" /> : null}
              {retrying ? "Verificando..." : "Tentar novamente"}
            </Button>
            <Link href="/dashboard/compras" className="flex-1">
              <Button variant="outline" className="w-full">Ver histórico de compras</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const amount = data.session.amountTotal === null
    ? "Valor confirmado pelo Stripe"
    : (data.session.amountTotal / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: data.session.currency?.toUpperCase() || "BRL",
      });
  const hasEnrollment = Boolean(data.enrollment && ["active", "approved", "enrolled"].includes(data.enrollment.status.toLowerCase()));

  return (
    <div className="site-shell min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 py-12">
      <div className="max-w-xl w-full rounded-3xl bg-card border border-border p-8 text-center shadow-xl md:p-12 space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-700 shadow-inner dark:bg-green-950/60 dark:text-green-300">
          <CheckCircle2 size={44} aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase text-green-700 dark:bg-green-950/60 dark:text-green-300">Pagamento aprovado via Stripe</span>
          <h1 className="text-3xl font-extrabold tracking-tight">Pagamento confirmado.</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            {hasEnrollment ? "Seu acesso foi validado e a matrícula está vinculada à sua conta." : "O pagamento foi confirmado. A liberação da matrícula pode levar alguns instantes."}
          </p>
        </div>

        {data.course ? (
          <div className="rounded-2xl border border-border bg-muted/40 p-6 text-left space-y-3">
            <p className="text-xs font-bold uppercase text-muted-foreground">Curso adquirido</p>
            <h2 className="text-xl font-black">{data.course.title}</h2>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>Nível {data.course.level}</span>
              <span className="font-bold text-foreground">{amount}</span>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-muted/40 p-6 text-left">
            <p className="text-sm text-muted-foreground">O Stripe confirmou a sessão, mas não há um curso associado nos dados retornados.</p>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-green-700 dark:text-green-300">
          <ShieldCheck size={14} aria-hidden="true" /> Sessão e titularidade verificadas
        </div>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Link href={data.course ? `/cursos/${data.course.id}` : "/dashboard/cursos"} className="flex-1">
            <Button className="h-12 w-full gap-2 rounded-xl bg-red-600 font-semibold text-white shadow-md shadow-red-600/20 hover:bg-red-700">
              {hasEnrollment ? "Acessar curso" : "Ir para meus cursos"} <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </Link>
          <Link href="/dashboard/compras" className="flex-1">
            <Button variant="outline" className="h-12 w-full rounded-xl font-semibold">Histórico de compras</Button>
          </Link>
        </div>
        <p className="pt-2 text-xs text-muted-foreground">O recibo detalhado permanece disponível no histórico de compras da sua conta.</p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="site-shell min-h-screen bg-background text-foreground flex items-center justify-center" role="status"><Loader2 className="animate-spin text-red-600" size={40} aria-label="Carregando confirmação do pagamento" /></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
