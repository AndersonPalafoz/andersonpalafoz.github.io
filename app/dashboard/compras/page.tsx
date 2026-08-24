"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Receipt, Download, RefreshCw, CheckCircle2, Printer, Search, ArrowUpDown, Filter, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createTablePdf, downloadPdf } from "@/lib/pdf-export";

interface Purchase {
  id: number;
  checkoutSessionId: string;
  purchasedAt: string;
  course: { id: number; title: string; level: string };
  payment: { amountTotal: number | null; currency: string | null; paymentStatus: string | null; receiptUrl?: string | null } | null;
  paymentError?: string | null;
  progress: number;
}
interface Subscription { id: string; status: string; cancelAtPeriodEnd: boolean; currentPeriodEnd: string | null; price: number | null; currency: string | null; }


export default function PurchasesAndSubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<"purchases" | "subscriptions">("purchases");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stripe/purchases")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Não foi possível carregar o histórico.");
        setPurchases(payload.purchases || []);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Erro ao carregar compras."))
      .finally(() => setLoading(false));
  }, []);

  const filteredPurchases = useMemo(() => purchases
    .filter((item) => item.course.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.checkoutSessionId.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const left = sortBy === "date" ? new Date(a.purchasedAt).getTime() : (a.payment?.amountTotal || 0);
      const right = sortBy === "date" ? new Date(b.purchasedAt).getTime() : (b.payment?.amountTotal || 0);
      return sortOrder === "desc" ? right - left : left - right;
    }), [purchases, searchTerm, sortBy, sortOrder]);

  useEffect(() => { if (activeTab !== "subscriptions") return; setLoadingSubscriptions(true); fetch("/api/stripe/subscriptions").then(async (response) => { const payload = await response.json(); if (!response.ok) throw new Error(payload.error || "Não foi possível carregar assinaturas."); setSubscriptions(payload.subscriptions || []); }).catch((reason) => toast.error(reason instanceof Error ? reason.message : "Erro ao carregar assinaturas.")).finally(() => setLoadingSubscriptions(false)); }, [activeTab]);
  const formatAmount = (purchase: Purchase) => purchase.payment?.amountTotal == null || !purchase.payment.currency ? "Valor não verificado" : (purchase.payment.amountTotal / 100).toLocaleString("pt-BR", { style: "currency", currency: purchase.payment.currency.toUpperCase() });
  const cancelSubscription = async (subscriptionId: string) => { if (!window.confirm("Agendar o cancelamento ao fim do período atual?")) return; setCancellingSubscription(subscriptionId); try { const response = await fetch(`/api/stripe/subscriptions/${subscriptionId}`, { method: "POST" }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error || "Não foi possível atualizar a assinatura."); setSubscriptions((current) => current.map((subscription) => subscription.id === subscriptionId ? { ...subscription, cancelAtPeriodEnd: payload.subscription.cancelAtPeriodEnd } : subscription)); toast.success("Cancelamento agendado no Stripe."); } catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao atualizar assinatura."); } finally { setCancellingSubscription(null); } };

  const handleExportCSV = () => {
    const headers = "ID,Sessao Stripe,Curso,Valor,Data,Status\n";
    const rows = filteredPurchases.map((p) => [p.id, p.checkoutSessionId, p.course.title, formatAmount(p), new Date(p.purchasedAt).toLocaleDateString("pt-BR"), p.payment?.paymentStatus || "unverified"].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([headers + rows], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a"); link.href = url; link.download = `historico-compras-${Date.now()}.csv`; link.click(); URL.revokeObjectURL(url); toast.success("Histórico exportado em CSV.");
  };

  const handleExportPDF = async () => {
    if (filteredPurchases.length === 0) {
      toast.error("Não há compras para exportar.");
      return;
    }
    try {
      const bytes = await createTablePdf("Histórico de compras — Anderson Palafoz", ["Curso", "Valor", "Data", "Status", "Sessão Stripe"], filteredPurchases.map((purchase) => [
        purchase.course.title,
        formatAmount(purchase),
        new Date(purchase.purchasedAt).toLocaleDateString("pt-BR"),
        purchase.payment?.paymentStatus || "Pagamento não verificado",
        purchase.checkoutSessionId,
      ]));
      downloadPdf(bytes, `historico-compras-${Date.now()}.pdf`);
      toast.success("Histórico exportado em PDF.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível gerar o PDF.");
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-red-600" size={36} /></div>;

  return <div className="max-w-6xl mx-auto space-y-8 pb-12">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-6"><div><h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Histórico de Compras e Assinaturas</h1><p className="text-gray-600 dark:text-slate-400 text-sm mt-1">Consulte pagamentos reais, recibos e acessos liberados.</p></div><div className="flex flex-wrap items-center gap-3">{activeTab === "purchases" && <><Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-2 font-semibold border-gray-300 dark:border-slate-700"><Download size={14} /> Exportar CSV</Button><Button onClick={() => void handleExportPDF()} variant="outline" size="sm" className="gap-2 font-semibold border-gray-300 dark:border-slate-700"><Printer size={14} /> Exportar PDF</Button></>}<div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl"><button onClick={() => setActiveTab("purchases")} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === "purchases" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"}`}>Minhas Compras ({purchases.length})</button><button onClick={() => setActiveTab("subscriptions")} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === "subscriptions" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"}`}><RefreshCw size={13} className="inline mr-1" /> Assinaturas</button></div></div></div>

    {error && <div className="rounded-2xl border border-red-100 bg-red-50 p-4 font-semibold text-red-700">{error}</div>}
    {activeTab === "purchases" ? <>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm"><div className="relative w-full md:w-96"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} /><Input placeholder="Buscar por curso ou sessão..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 rounded-xl border-gray-300 dark:border-slate-700" /></div><div className="flex items-center gap-3 w-full md:w-auto justify-end"><span className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-slate-400"><Filter size={14} /> Ordenar por:</span><select value={sortBy} onChange={(e) => setSortBy(e.target.value as "date" | "amount")} className="bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 dark:text-slate-200"><option value="date">Data da compra</option><option value="amount">Valor</option></select><Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} className="h-9 px-3 border-gray-300 dark:border-slate-700 font-bold gap-1"><ArrowUpDown size={14} /> {sortOrder === "desc" ? "Decrescente" : "Crescente"}</Button></div></div>
      {filteredPurchases.length === 0 ? <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 p-12 text-center text-gray-500 dark:text-slate-400">Nenhuma compra encontrada para os critérios de busca.</div> : <div className="space-y-4">{filteredPurchases.map((item) => <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"><div className="flex min-w-0 flex-1 items-start gap-4"><div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100"><Receipt size={24} /></div><div><span className="text-xs font-mono font-bold text-gray-400 dark:text-slate-500">{item.checkoutSessionId}</span><h3 className="font-bold text-gray-900 dark:text-white text-base">{item.course.title}</h3><div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-slate-400 mt-1"><span>{new Date(item.purchasedAt).toLocaleDateString("pt-BR")}</span><span>•</span><span>Nível {item.course.level}</span><span>•</span><span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={12} /> {item.payment?.paymentStatus === "paid" ? "Aprovado" : item.payment?.paymentStatus || "Pagamento não verificado"}</span></div></div><div className="mt-3 max-w-md"><div className="mb-1 flex justify-between text-[11px] font-bold text-gray-500 dark:text-slate-400"><span>Progresso do curso</span><span>{item.progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800"><div className="h-full rounded-full bg-red-600 transition-all" style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }} /></div></div></div><div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 dark:border-slate-800"><span className="font-extrabold text-lg text-gray-900 dark:text-white">{formatAmount(item)}</span>{item.payment?.paymentStatus === "paid" ? <Link href={`/pagamento/recibo/${item.id}`}><Button variant="outline" size="sm" className="gap-2 border-gray-300 dark:border-slate-700 font-semibold"><Receipt size={14} /> Recibo detalhado</Button></Link> : <span className="text-xs text-gray-400 dark:text-slate-500">Recibo indisponível</span>}{item.payment?.receiptUrl && <a href={item.payment.receiptUrl} target="_blank" rel="noopener noreferrer" aria-label="Abrir recibo hospedado pelo Stripe"><Button variant="ghost" size="sm" className="gap-2 font-semibold"><ExternalLink size={13} /> Stripe</Button></a>}</div></div>)}</div>}
    </> : <div className="space-y-4">{loadingSubscriptions ? <div className="flex justify-center rounded-2xl border bg-white dark:bg-slate-900 p-12"><Loader2 className="animate-spin text-red-600" /></div> : subscriptions.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-12 text-center"><RefreshCw className="mx-auto text-gray-400 dark:text-slate-500" size={42} /><h2 className="mt-4 font-bold text-gray-900 dark:text-white">Nenhuma assinatura recorrente encontrada</h2><p className="mt-2 text-sm text-gray-600 dark:text-slate-400">As assinaturas serão exibidas aqui quando um plano recorrente estiver ativo na sua conta Stripe.</p></div> : subscriptions.map((subscription) => <div key={subscription.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm md:flex-row md:items-center"><div><p className="font-mono text-xs text-gray-400 dark:text-slate-500">{subscription.id}</p><h2 className="mt-1 font-bold text-gray-900 dark:text-white">Assinatura {subscription.status}</h2><p className="mt-1 text-sm text-gray-600 dark:text-slate-400">{subscription.currentPeriodEnd ? `Período atual até ${new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-BR")}` : "Período atual consultado no Stripe."}</p>{subscription.cancelAtPeriodEnd && <p className="mt-2 text-xs font-bold text-amber-700">Cancelamento agendado ao fim do período.</p>}</div>{!subscription.cancelAtPeriodEnd && subscription.status === "active" && <Button disabled={cancellingSubscription === subscription.id} onClick={() => cancelSubscription(subscription.id)} variant="outline" className="border-red-200 font-bold text-red-600 hover:bg-red-50">{cancellingSubscription === subscription.id && <Loader2 className="mr-2 animate-spin" size={16} />} Cancelar no fim do período</Button>}</div>)}</div>}
  </div>;
}
