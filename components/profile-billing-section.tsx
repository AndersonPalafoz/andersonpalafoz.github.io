"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Receipt } from "lucide-react";
import { toast } from "sonner";

interface PurchaseItem {
  id: number;
  checkoutSessionId: string;
  purchasedAt: string;
  course: { id: number; title: string; level: string };
  payment: { amountTotal: number | null; currency: string | null; paymentStatus: string | null; receiptUrl?: string | null };
}

export function ProfileBillingSection() {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-red-600" size={28} />
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-border bg-card space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Receipt className="text-red-600" size={20} />
          <h3 className="font-bold text-foreground text-base">Histórico de Faturamento e Recibos Stripe</h3>
        </div>
        <span className="text-xs font-bold bg-muted px-2.5 py-1 rounded-full text-muted-foreground">{purchases.length} pagamento(s)</span>
      </div>

      {purchases.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Nenhum pagamento ou compra registrada no Stripe ainda.</p>
      ) : (
        <div className="space-y-3">
          {purchases.map((p) => {
            const amount = p.payment.amountTotal ? (p.payment.amountTotal / 100).toLocaleString("pt-BR", { style: "currency", currency: p.payment.currency || "BRL" }) : "Gratuito/Outro";
            return (
              <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/70 bg-muted/30">
                <div>
                  <h4 className="font-bold text-foreground text-sm">{p.course.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Comprado em {new Date(p.purchasedAt).toLocaleDateString("pt-BR")} • Status: <span className="font-semibold text-emerald-600 uppercase">{p.payment.paymentStatus || "Concluído"}</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-foreground">{amount}</span>
                  {p.payment.receiptUrl ? (
                    <a href={p.payment.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition">
                      Recibo <ExternalLink size={13} />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Recibo não disponível</span>
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
