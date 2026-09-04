"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCog,
  UserPlus,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ActivityAction = "approve" | "reject" | "role_change" | "soft_delete" | "restore" | "create";
type ActivityFilter = "all" | ActivityAction;

interface Activity {
  id: number;
  adminEmail: string;
  action: ActivityAction;
  targetName: string | null;
  targetEmail: string | null;
  details: string | null;
  createdAt: string;
  offerId?: number | null;
}

const actionLabels: Record<ActivityAction, string> = {
  approve: "Conta aprovada",
  reject: "Solicitação recusada",
  role_change: "Papel alterado",
  soft_delete: "Conta excluída",
  restore: "Conta recuperada",
  create: "Conta criada",
};

const actionStyles: Record<ActivityAction, string> = {
  approve: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  reject: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  role_change: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  soft_delete: "bg-muted text-gray-700",
  restore: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  create: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
};

function ActionIcon({ action }: { action: ActivityAction }) {
  const props = { size: 18, strokeWidth: 2 };
  if (action === "approve") return <CheckCircle2 {...props} />;
  if (action === "reject") return <XCircle {...props} />;
  if (action === "role_change") return <UserCog {...props} />;
  if (action === "soft_delete") return <Trash2 {...props} />;
  if (action === "restore") return <ShieldCheck {...props} />;
  return <UserPlus {...props} />;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: "25", offset: String(offset) });
      if (filter !== "all") params.set("action", filter);
      const response = await fetch(`/api/admin/activity?${params.toString()}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar o histórico.");
      setActivities(data.activities || []);
      setHasMore(Boolean(data.pagination?.hasMore));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar o histórico.");
    } finally {
      setLoading(false);
    }
  }, [filter, offset]);

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchActivities(), 0);
    return () => window.clearTimeout(timer);
  }, [fetchActivities]);

  const filteredActivities = useMemo(() => activities, [activities]);

  return (
    <div className="site-shell min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"><ArrowLeft size={16} />Voltar ao painel</Link>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-red-600">Governança</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">Atividades do super-admin</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">Histórico de aprovações, recusas, alterações de papel, exclusões lógicas e recuperações de contas.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => void fetchActivities()} className="gap-2"><RefreshCw size={16} />Atualizar histórico</Button>
        </div>

        <div className="mb-6 rounded-2xl border border-blue-500/30 bg-blue-950/20 text-blue-200"><div className="flex items-start gap-3"><ShieldAlert size={19} className="mt-0.5 shrink-0" /><p>Este registro é somente para consulta. Cada entrada identifica a conta afetada, o administrador responsável e o horário da ação.</p></div></div>

        <div className="mb-6 flex flex-wrap gap-2">
          <select value={filter} onChange={(event) => { setFilter(event.target.value as ActivityFilter); setOffset(0); }} className="field-control h-11 max-w-xs font-medium">
            <option value="all">Todas as atividades</option>
            <option value="approve">Aprovações</option>
            <option value="reject">Recusas</option>
            <option value="role_change">Alterações de papel</option>
            <option value="soft_delete">Exclusões lógicas</option>
            <option value="restore">Recuperações</option>
            <option value="create">Criações</option>
          </select>
          <span className="inline-flex h-11 items-center rounded-xl border border-border bg-card px-4 text-sm text-muted-foreground shadow-sm">{filteredActivities.length} registro(s)</span>
        </div>

        <section className="surface-card">
          {loading ? (
            <div className="space-y-4 p-6"><div className="h-20 animate-pulse rounded-xl bg-muted" /><div className="h-20 animate-pulse rounded-xl bg-muted" /><div className="h-20 animate-pulse rounded-xl bg-muted" /></div>
          ) : error ? (
            <div className="p-10 text-center"><p className="font-semibold text-red-700">{error}</p><button type="button" onClick={() => void fetchActivities()} className="mt-4 text-sm font-semibold text-red-600 hover:underline">Tentar novamente</button></div>
          ) : filteredActivities.length === 0 ? (
            <div className="p-12 text-center"><Clock3 size={32} className="mx-auto text-gray-300" /><p className="mt-3 font-semibold text-foreground">Nenhuma atividade registrada</p><p className="mt-1 text-sm text-muted-foreground">As próximas ações administrativas aparecerão aqui.</p></div>
          ) : (
            <ol className="divide-y divide-border/70">
              {filteredActivities.map((activity) => (
                <li key={activity.id} className="flex gap-4 p-5 sm:p-6">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${actionStyles[activity.action]}`}><ActionIcon action={activity.action} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start"><div><p className="font-semibold text-foreground">{actionLabels[activity.action]}</p><p className="mt-1 text-sm text-muted-foreground">{activity.targetName || "Usuário sem nome"}{activity.targetEmail ? ` · ${activity.targetEmail}` : ""}</p></div><time className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground" dateTime={activity.createdAt}><Clock3 size={13} />{formatDate(activity.createdAt)}</time></div>
                    {activity.details && <p className="mt-3 rounded-xl border border-border/70 bg-muted/60 px-3 py-2 text-sm text-muted-foreground">{activity.details}</p>}
                    {activity.offerId && <Link href={`/admin/relatorios-academicos?offerId=${activity.offerId}`} className="mt-3 inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">Oferta #{activity.offerId}</Link>}
                    <p className="mt-3 text-xs text-muted-foreground">Executado por {activity.adminEmail}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
        <div className="mt-4 flex items-center justify-between gap-3"><button type="button" disabled={offset === 0 || loading} onClick={() => setOffset((current) => Math.max(0, current - 25))} className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-50">Anterior</button><span className="text-xs text-muted-foreground">Página {Math.floor(offset / 25) + 1}</span><button type="button" disabled={!hasMore || loading} onClick={() => setOffset((current) => current + 25)} className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-50">Próxima</button></div>
      </div>
    </div>
  );
}
