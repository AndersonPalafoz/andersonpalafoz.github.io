"use client";

import { useEffect, useState, useMemo } from "react";
import { ExternalLink, Loader2, Receipt, Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTablePdf, downloadPdf } from "@/lib/pdf-export";

interface PurchaseItem {
  id: number;
  checkoutSessionId: string;
  purchasedAt: string;
  course: { id: number; title: string; level: string };
  payment: { amountTotal: number | null; currency: string | null; paymentStatus: string | null; receiptUrl?: string | null } | null;
  paymentError?: string | null;
}

export function ProfileBillingSection() {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetch("/api/stripe/purchases")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao carregar faturamento.");
        setPurchases(data.purchases || []);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Erro ao carregar histórico de faturamento."))
      .finally(() => setLoading(false));
  }, []);

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      if (statusFilter !== "all" && (p.payment?.paymentStatus || "unverified") !== statusFilter) return false;
      const purchaseDateStr = new Date(p.purchasedAt).toISOString().slice(0, 10);
      if (startDate && purchaseDateStr < startDate) return false;
      if (endDate && purchaseDateStr > endDate) return false;
      return true;
    });
  }, [purchases, statusFilter, startDate, endDate]);

  const handleExportCSV = () => {
    if (filteredPurchases.length === 0) {
      toast.error("Nenhum recibo filtrado para exportar.");
      return;
    }
    const headers = "Curso,Data,Status,Valor,Sessão Stripe\n";
    const rows = filteredPurchases.map((p) => {
      const amount = p.payment?.amountTotal != null && p.payment.currency ? (p.payment.amountTotal / 100).toFixed(2) : "não verificado";
      const status = p.payment?.paymentStatus || "não verificado";
      return [`"${p.course.title}"`, `"${new Date(p.purchasedAt).toLocaleDateString("pt-BR")}"`, `"${status}"`, amount, `"${p.checkoutSessionId}"`].join(",");
    }).join("\n");

    const url = URL.createObjectURL(new Blob([headers + rows], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `faturamento-recibos-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Recibos exportados em CSV com sucesso!");
  };

  const handleExportPDF = async () => {
    if (filteredPurchases.length === 0) {
      toast.error("Nenhum recibo filtrado para exportar.");
      return;
    }
    try {
      const bytes = await createTablePdf("Faturamento e Recibos — Anderson Palafoz", ["Curso", "Data", "Status", "Valor"], filteredPurchases.map((p) => [
        p.course.title,
        new Date(p.purchasedAt).toLocaleDateString("pt-BR"),
        p.payment?.paymentStatus || "não verificado",
        p.payment?.amountTotal != null && p.payment.currency ? (p.payment.amountTotal / 100).toLocaleString("pt-BR", { style: "currency", currency: p.payment.currency }) : "Não verificado",
      ]));
      downloadPdf(bytes, `faturamento-recibos-${Date.now()}.pdf`);
      toast.success("Recibos exportados em PDF com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao gerar PDF de recibos.");
    }
  };

  const handleDownloadSingleReceiptPDF = async (p: PurchaseItem) => {
    try {
      const amount = p.payment?.amountTotal != null && p.payment.currency ? (p.payment.amountTotal / 100).toLocaleString("pt-BR", { style: "currency", currency: p.payment.currency }) : "Não verificado";
      const bytes = await createTablePdf(
        `Recibo de Compra — ${p.course.title}`,
        ["Detalhe da Transação", "Informação"],
        [
          ["Curso Adquirido", p.course.title],
          ["Nível", p.course.level],
          ["Data da Compra", new Date(p.purchasedAt).toLocaleDateString("pt-BR")],
          ["Status do Pagamento", p.payment?.paymentStatus || "concluído"],
          ["Valor Total", amount],
          ["ID da Sessão / Transação", p.checkoutSessionId],
        ]
      );
      downloadPdf(bytes, `recibo-compra-curso-${p.course.id}-${Date.now()}.pdf`);
      toast.success("Recibo individual baixado em PDF com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao gerar recibo em PDF.");
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card space-y-4 animate-pulse">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-muted rounded-full" />
            <div className="h-5 w-56 bg-muted rounded-lg" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-muted rounded-xl" />
            <div className="h-8 w-24 bg-muted rounded-xl" />
          </div>
        </div>
        <div className="h-20 bg-muted/40 rounded-xl" />
        <div className="space-y-3">
          <div className="h-16 bg-muted/30 rounded-xl" />
          <div className="h-16 bg-muted/30 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-border bg-card space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Receipt className="text-red-600" size={20} />
          <h3 className="font-bold text-foreground text-base">Histórico de Faturamento e Recibos Stripe</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-bold border-border">
            <Download size={13} /> Exportar CSV
          </Button>
          <Button onClick={() => void handleExportPDF()} variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-bold border-border">
            <Printer size={13} /> Exportar PDF
          </Button>
          <span className="text-xs font-bold bg-muted px-3 py-1 rounded-full text-muted-foreground">{filteredPurchases.length} de {purchases.length}</span>
        </div>
      </div>

      {/* Filtros por Data e Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/40 p-4 rounded-xl border border-border/60">
        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground">
            <option value="all">Todos os status</option>
            <option value="paid">Pago (Paid)</option>
            <option value="completed">Concluído</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Data Inicial</label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 text-xs bg-background" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Data Final</label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 text-xs bg-background" />
        </div>
      </div>

      {filteredPurchases.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Nenhum recibo encontrado para os filtros selecionados.</p>
      ) : (
        <div className="space-y-3">
          {filteredPurchases.map((p) => {
            const amount = p.payment?.amountTotal != null && p.payment.currency ? (p.payment.amountTotal / 100).toLocaleString("pt-BR", { style: "currency", currency: p.payment.currency }) : "Valor não verificado";
            return (
              <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/70 bg-muted/30">
                <div>
                  <h4 className="font-bold text-foreground text-sm">{p.course.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Comprado em {new Date(p.purchasedAt).toLocaleDateString("pt-BR")} • Status: <span className={`font-semibold uppercase ${p.payment ? "text-emerald-600" : "text-amber-600"}`}>{p.payment?.paymentStatus || "Pagamento não verificado"}</span></p>{p.paymentError && <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">{p.paymentError}</p>}
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <span className="text-sm font-black text-foreground mr-2">{amount}</span>
                  <Button
                    onClick={() => void handleDownloadSingleReceiptPDF(p)}
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-bold border-border"
                  >
                    <Download size={13} /> Baixar Recibo PDF
                  </Button>
                  {p.payment?.receiptUrl && (
                    <a href={p.payment.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition">
                      Stripe <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
