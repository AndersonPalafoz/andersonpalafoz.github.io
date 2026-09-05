"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, ShieldCheck, Download } from "lucide-react";

interface ActivityLog {
  id: number;
  userId: number | null;
  userEmail: string | null;
  userName: string | null;
  action: string;
  targetType: string;
  targetIds: string;
  details: string | null;
  createdAt: string;
}

const actionLabels: Record<string, { label: string; color: string }> = {
  soft_delete: { label: "Enviado para Lixeira", color: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" },
  restore: { label: "Restaurado", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" },
  permanent_delete: { label: "Exclusão Permanente", color: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300" },
  batch_restore: { label: "Restauração em Lote", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" },
  batch_permanent_delete: { label: "Exclusão em Lote (Definitiva)", color: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300" },
  batch_soft_delete: { label: "Envio em Lote para Lixeira", color: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" },
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "medium" }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function CourseActivityAuditPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(15);
  const [total, setTotal] = useState(0);

  const loadLogs = useCallback(async (currentOffset: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/activity-logs?limit=${limit}&offset=${currentOffset}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Acesso restrito a administradores. Faça login com palafozanderson@gmail.com.");
        }
        throw new Error(json.error || "Não foi possível carregar os registros de atividades.");
      }
      setLogs(Array.isArray(json.logs) ? json.logs : []);
      setTotal(typeof json.pagination?.total === "number" ? json.pagination.total : 0);
    } catch (err) {
      setLogs([]);
      setTotal(0);
      setError(err instanceof Error ? err.message : "Erro ao carregar auditoria.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadLogs(offset), 0);
    return () => window.clearTimeout(timer);
  }, [offset, loadLogs]);

  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="site-shell px-4 py-8 sm:px-6 lg:px-8">
      <div className="page-container space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 surface-card p-6 sm:p-8 rounded-3xl">
          <div className="space-y-2">
            <Link href="/admin/cursos" className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:underline">
              <ArrowLeft size={14} /> Voltar ao Gerenciamento de Cursos
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-3">
              <ShieldCheck className="text-red-600" size={28} /> Registro de Atividades da Lixeira
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Rastreamento detalhado de quais administradores excluíram, restauraram ou operaram cursos em lote no sistema. Total de {total} registro(s).
            </p>
          </div>
          <button
            type="button"
            disabled={loading || logs.length === 0}
            onClick={() => {
              if (logs.length === 0) return;
              const escapeCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
              const csv = [
                "Data,Administrador,Email,Acao,IDs Afetados,Detalhes",
                ...logs.map((log) =>
                  [
                    formatDate(log.createdAt),
                    log.userName || "Administrador",
                    log.userEmail || "palafozanderson@gmail.com",
                    actionLabels[log.action]?.label || log.action,
                    log.targetIds,
                    log.details || "Sem detalhes",
                  ]
                    .map(escapeCell)
                    .join(",")
                ),
              ].join("\n");
              const link = document.createElement("a");
              link.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
              link.download = `auditoria-lixeira-${new Date().toISOString().slice(0, 10)}.csv`;
              link.click();
              URL.revokeObjectURL(link.href);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-3 text-xs font-bold transition disabled:opacity-50 shadow-sm"
          >
            <Download size={15} /> Exportar CSV da Página
          </button>
        </div>

        {error && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="surface-card overflow-x-auto rounded-3xl border border-border/70 p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="animate-spin text-red-600" size={32} />
              <p className="text-sm font-bold text-muted-foreground">Carregando registros de auditoria...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShieldCheck size={48} className="mx-auto text-muted-foreground/40" />
              <h3 className="text-lg font-bold text-foreground">Nenhum registro encontrado</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Não há histórico de exclusão ou restauração na lixeira no momento. As ações executadas por administradores aparecerão aqui automaticamente.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 px-3">Data / Hora</th>
                    <th className="pb-3 px-3">Administrador</th>
                    <th className="pb-3 px-3">Ação</th>
                    <th className="pb-3 px-3">IDs Afetados</th>
                    <th className="pb-3 px-3">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs">
                  {logs.map((log) => {
                    const badge = actionLabels[log.action] || { label: log.action, color: "bg-muted text-foreground" };
                    return (
                      <tr key={log.id} className="hover:bg-muted/40 transition">
                        <td className="py-3 px-3 font-medium text-muted-foreground whitespace-nowrap">{formatDate(log.createdAt)}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-foreground block">{log.userName || "Admin"}</span>
                          <span className="text-[11px] text-muted-foreground">{log.userEmail || "palafozanderson@gmail.com"}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-foreground">{log.targetIds}</td>
                        <td className="py-3 px-3 text-muted-foreground">{log.details || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-xs font-bold text-muted-foreground">
                    Página {currentPage} de {totalPages} ({total} registros)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
                      className="rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setOffset((prev) => prev + limit)}
                      className="rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
