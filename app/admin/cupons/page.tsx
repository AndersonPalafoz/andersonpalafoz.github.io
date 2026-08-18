"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgePercent, CalendarClock, ChevronLeft, ChevronRight, Loader2, Plus, Power, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/hooks/useAuth";

interface CouponRecord {
  id: number;
  code: string;
  stripeCouponId: string;
  percentOff: string | null;
  amountOff: string | null;
  currency: string;
  maxRedemptions: number | null;
  redeemBy: string | null;
  active: boolean;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [code, setCode] = useState("");
  const [percentOff, setPercentOff] = useState("");
  const [amountOff, setAmountOff] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [redeemBy, setRedeemBy] = useState("");

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), pageSize: "20", status });
      if (search.trim()) params.set("search", search.trim());
      const response = await fetch(`/api/admin/coupons?${params.toString()}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível carregar os cupons.");
      setCoupons(payload.coupons || []);
      setHasMore(Boolean(payload.pagination?.hasMore));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar os cupons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") {
      window.location.href = "/";
      return;
    }
    void loadCoupons();
  }, [authLoading, user, page, search, status]);

  const resetForm = () => {
    setCode("");
    setPercentOff("");
    setAmountOff("");
    setMaxRedemptions("");
    setRedeemBy("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, percentOff, amountOff, maxRedemptions, redeemBy }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível criar o cupom.");
      toast.success("Cupom criado e sincronizado com o Stripe.");
      resetForm();
      setPage(1);
      await loadCoupons();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar o cupom.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (coupon: CouponRecord) => {
    if (!window.confirm(`Desativar o cupom ${coupon.code}? Novos resgates serão bloqueados no Stripe.`)) return;
    try {
      setDeactivatingId(coupon.id);
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível desativar o cupom.");
      toast.success(`Cupom ${coupon.code} desativado.`);
      await loadCoupons();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível desativar o cupom.");
    } finally {
      setDeactivatingId(null);
    }
  };

  if (authLoading || loading) {
    return <div className="site-shell flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-red-600" size={34} /></div>;
  }
  if (!user || user.role !== "admin") return null;

  return (
    <div className="site-shell min-h-screen bg-background pb-16 text-foreground">
      <header className="border-b border-border bg-card">
        <div className="page-container py-8">
          <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-red-600"><ArrowLeft size={16} /> Painel administrativo</Link>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div><p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Stripe · descontos reais</p><h1 className="mt-2 text-3xl font-black tracking-tight">Cupons e descontos</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Crie códigos promocionais no Stripe e mantenha o estado administrativo persistido no Neon. Nenhum cupom de demonstração é criado automaticamente.</p></div>
            <Button variant="outline" onClick={() => void loadCoupons()} className="gap-2"><RefreshCw size={15} /> Atualizar</Button>
          </div>
        </div>
      </header>

      <main className="page-container grid gap-6 py-8 lg:grid-cols-[360px_1fr]">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600"><Plus size={20} /></div><div><h2 className="font-black">Novo cupom</h2><p className="text-xs text-muted-foreground">Sincronizado no Stripe</p></div></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="mb-1 block text-xs font-bold text-muted-foreground">Código</label><Input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="EX: BEMVINDO10" required maxLength={64} /></div>
            <div className="grid grid-cols-2 gap-3"><div><label className="mb-1 block text-xs font-bold text-muted-foreground">Percentual (%)</label><Input type="number" min="0.01" max="100" step="0.01" value={percentOff} onChange={(event) => { setPercentOff(event.target.value); setAmountOff(""); }} placeholder="10" /></div><div><label className="mb-1 block text-xs font-bold text-muted-foreground">Valor (centavos)</label><Input type="number" min="50" step="1" value={amountOff} onChange={(event) => { setAmountOff(event.target.value); setPercentOff(""); }} placeholder="1000" /></div></div>
            <div><label className="mb-1 block text-xs font-bold text-muted-foreground">Limite de resgates (opcional)</label><Input type="number" min="1" step="1" value={maxRedemptions} onChange={(event) => setMaxRedemptions(event.target.value)} placeholder="Sem limite" /></div>
            <div><label className="mb-1 block text-xs font-bold text-muted-foreground">Expira em (opcional)</label><Input type="datetime-local" value={redeemBy} onChange={(event) => setRedeemBy(event.target.value)} /></div>
            <div className="rounded-2xl bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="mb-1 text-emerald-600" size={16} /> O Stripe valida o desconto no checkout. A plataforma não cria dados de teste nem libera acesso sem confirmação do pagamento.</div>
            <Button type="submit" disabled={saving} className="w-full gap-2 bg-red-600 font-bold text-white hover:bg-red-700">{saving ? <Loader2 className="animate-spin" size={16} /> : <BadgePercent size={16} />} {saving ? "Criando..." : "Criar cupom"}</Button>
          </form>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="font-black">Cupons registrados</h2><p className="text-xs text-muted-foreground">Últimos 100 registros persistidos</p></div><span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">{coupons.length}</span></div>
          <div className="mb-5 grid gap-3 rounded-2xl border border-border bg-muted/30 p-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
            <label className="relative block"><Search size={15} className="absolute left-3 top-3 text-muted-foreground" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar por código" aria-label="Buscar cupons por código" className="pl-9" /></label>
            <select value={status} onChange={(event) => { setStatus(event.target.value as typeof status); setPage(1); }} aria-label="Filtrar cupons por status" className="h-10 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground"><option value="all">Todos os status</option><option value="active">Ativos</option><option value="inactive">Inativos</option></select>
            <Button type="button" variant="outline" onClick={() => { setSearch(""); setStatus("all"); setPage(1); }} className="h-10 font-bold">Limpar</Button>
          </div>
          {coupons.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">Nenhum cupom persistido corresponde aos filtros atuais.</div> : <div className="space-y-3">{coupons.map((coupon) => <article key={coupon.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><code className="rounded-lg bg-slate-900 px-2.5 py-1 text-sm font-black tracking-wide text-white">{coupon.code}</code><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${coupon.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{coupon.active ? "Ativo" : "Inativo"}</span></div><p className="mt-2 text-sm font-semibold">{coupon.percentOff ? `${coupon.percentOff}% de desconto` : `${(Number(coupon.amountOff || 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} de desconto`}</p><div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><CalendarClock size={13} /> Criado em {new Date(coupon.createdAt).toLocaleDateString("pt-BR")}</span>{coupon.maxRedemptions && <span>Limite: {coupon.maxRedemptions}</span>}{coupon.redeemBy && <span>Expira: {new Date(coupon.redeemBy).toLocaleString("pt-BR")}</span>}</div></div>{coupon.active && <Button variant="outline" onClick={() => void handleDeactivate(coupon)} disabled={deactivatingId === coupon.id} className="gap-2 border-red-200 text-red-700 hover:bg-red-50">{deactivatingId === coupon.id ? <Loader2 className="animate-spin" size={15} /> : <Power size={15} />} Desativar</Button>}</article>)}          </div>}
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4"><span className="text-xs text-muted-foreground">Página {page} · {coupons.length} registro(s) carregado(s)</span><div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1 || loading} aria-label="Página anterior"><ChevronLeft size={15} /></Button><Button type="button" variant="outline" onClick={() => setPage((current) => current + 1)} disabled={!hasMore || loading} aria-label="Próxima página"><ChevronRight size={15} /></Button></div></div>
        </section>
      </main>
    </div>
  );
}
