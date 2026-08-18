"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2, Printer, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReceiptData {
  purchase: {
    id: number;
    courseId: number;
    amount: number | null;
    currency: string | null;
    paymentStatus: string | null;
    checkoutStatus: string | null;
    createdAt: string;
    fulfilledAt: string | null;
    stripeCheckoutSessionId: string;
    stripePaymentIntentId: string | null;
    receiptUrl: string | null;
  };
  course: { id: number; title: string; level: string } | null;
}

function formatAmount(amount: number | null, currency: string | null) {
  if (amount === null || !currency) return "Valor confirmado pelo Stripe";
  return (amount / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  });
}

export default function ReceiptDetailPage() {
  const params = useParams<{ id: string }>();
  const receiptId = params.id?.trim() || "";
  const [data, setData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const loadReceipt = useCallback(async (signal?: AbortSignal) => {
    if (!receiptId) {
      setError("Identificador de recibo inválido.");
      setLoading(false);
      return;
    }

    setError(null);
    setRetrying(true);
    try {
      const response = await fetch(`/api/stripe/purchases/${encodeURIComponent(receiptId)}`, {
        cache: "no-store",
        signal,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || "Não foi possível carregar o recibo.");
      }
      setData(payload as ReceiptData);
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      setData(null);
      setError(reason instanceof Error ? reason.message : "Erro ao carregar recibo.");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setRetrying(false);
      }
    }
  }, [receiptId]);

  useEffect(() => {
    const controller = new AbortController();
    void loadReceipt(controller.signal);
    return () => controller.abort();
  }, [loadReceipt]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="site-shell min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 p-6" role="status" aria-live="polite">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300">
          <Loader2 className="animate-spin" size={32} aria-hidden="true" />
        </div>
        <p className="text-center text-sm font-semibold">Carregando recibo oficial da transação...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="site-shell min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl bg-card border border-border p-8 text-center shadow-lg space-y-4">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300">
            <AlertCircle size={24} aria-hidden="true" />
          </div>
          <h1 className="text-xl font-black">Recibo indisponível</h1>
          <p className="text-sm leading-6 text-muted-foreground">{error || "Não foi possível carregar os dados do recibo."}</p>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button onClick={() => void loadReceipt()} disabled={retrying} className="flex-1 bg-red-600 font-bold text-white hover:bg-red-700">
              {retrying ? <Loader2 className="animate-spin" size={15} aria-hidden="true" /> : null}
              {retrying ? "Verificando..." : "Tentar novamente"}
            </Button>
            <Link href="/dashboard/compras" className="flex-1">
              <Button variant="outline" className="w-full">Voltar às compras</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const issuedAt = new Date(data.purchase.createdAt).toLocaleString("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  });
  const amount = formatAmount(data.purchase.amount, data.purchase.currency);

  return (
    <div className="site-shell min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 py-12">
      <article className="max-w-2xl w-full rounded-3xl bg-card border border-border p-8 shadow-xl md:p-12 space-y-8 print:shadow-none print:border-none print:p-0">
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-xl font-bold text-white shadow-md">AP</div>
            <div>
              <h1 className="text-lg font-extrabold">Anderson Palafoz Platform</h1>
              <p className="text-xs text-muted-foreground">Recibo de pagamento</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase text-green-700 dark:bg-green-950/60 dark:text-green-300">Pago e verificado</span>
            <p className="mt-1 break-all text-xs text-muted-foreground font-mono">Compra #{data.purchase.id}</p>
          </div>
        </header>

        <section className="space-y-4" aria-labelledby="receipt-title">
          <h2 id="receipt-title" className="text-xl font-bold">Recibo oficial da transação</h2>
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-muted/40 p-6 text-sm md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Data de emissão</p>
              <p className="font-bold">{issuedAt}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Processamento</p>
              <p className="flex items-center gap-1 font-bold text-green-600"><ShieldCheck size={14} aria-hidden="true" /> Stripe Secure Gateway</p>
            </div>
          </div>
        </section>

        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-xs font-bold uppercase text-muted-foreground">
                  <th className="p-4">Item / descrição</th>
                  <th className="p-4 text-center">Nível</th>
                  <th className="p-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                <tr>
                  <td className="p-4">
                    <p className="font-bold">{data.course?.title || `Curso #${data.purchase.courseId}`}</p>
                    <p className="text-xs text-muted-foreground">Compra registrada e vinculada à conta autenticada.</p>
                  </td>
                  <td className="p-4 text-center">
                    <span className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">{data.course?.level || "Não informado"}</span>
                  </td>
                  <td className="p-4 text-right font-extrabold">{amount}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border bg-muted/40 p-4 text-base font-extrabold">
            <span>Valor total pago</span>
            <span className="text-lg text-red-600">{amount}</span>
          </div>
        </div>

        <footer className="flex flex-col gap-3 pt-4 print:hidden sm:flex-row">
          <Button onClick={handlePrint} className="h-12 flex-1 gap-2 rounded-xl bg-red-600 font-semibold text-white shadow-md hover:bg-red-700">
            <Printer size={18} aria-hidden="true" /> Imprimir / salvar PDF
          </Button>
          <Link href="/dashboard/compras" className="flex-1">
            <Button variant="outline" className="h-12 w-full gap-2 rounded-xl font-semibold">
              <ArrowLeft size={16} aria-hidden="true" /> Voltar às compras
            </Button>
          </Link>
        </footer>
      </article>
    </div>
  );
}
