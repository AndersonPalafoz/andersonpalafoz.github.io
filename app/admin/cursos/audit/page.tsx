"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

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
      if (!res.ok) throw new Error(json.error || "Não foi possível carregar os registros de atividades.");
      setLogs(Array.isArray(json.logs) ? json.logs : []);
      setTotal(typeof json.pagination?.total === "number" ? json.pagination.total : 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar auditoria.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadLogs(offset);
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
                    .join(","),
                ),
              ].join("\\n");
              const link = document.createElement("a");
              link.href = URL.createObjectURL(new Blob([`\\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
              link.download = `registro-atividades-lixeira-${new Date().toISOString().slice(0, 10)}.csv`;
              link.click();
              URL.revokeObjectURL(link.href);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-5 py-3 font-bold text-xs transition shadow-sm disabled:opacity-50"
          >
            Exportar CSV da Página
          </button>
        </div>

        <div className="surface-card overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center flex items-center justify-center gap-3">
              <Loader2 className="animate-spin text-red-600" size={24} />
              <p className="text-sm font-medium text-muted-foreground">Carregando registro de atividades...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-sm font-bold text-red-600">{error}</div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <ShieldCheck size={40} className="mx-auto text-muted-foreground/60" />
              <p className="text-sm font-medium text-muted-foreground">Nenhuma atividade registrada na lixeira até o momento.</p>
            </div>
          ) : (
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted-foreground font-black">
                <tr>
                  <th className="px-5 py-4">Data e Hora</th>
                  <th className="px-5 py-4">Administrador</th>
                  <th className="px-5 py-4">Ação</th>
                  <th className="px-5 py-4">IDs Afetados</th>
                  <th className="px-5 py-4">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {logs.map((log) => {
                  const meta = actionLabels[log.action] || { label: log.action, color: "bg-muted text-foreground" };
                  return (
                    <tr key={log.id} className="hover:bg-muted/40 transition">
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-foreground font-semibold">{formatDate(log.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-bold text-foreground">{log.userName || "Administrador"}</div>
                        <div className="text-xs text-muted-foreground">{log.userEmail || "palafozanderson@gmail.com"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-black inline-block ${meta.color}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-mono font-bold text-foreground">{log.targetIds}</td>
                      <td className="px-5 py-4 text-xs text-muted-foreground max-w-xs truncate">{log.details || "Sem detalhes"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginação */}
        {!loading && total > limit && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 surface-card p-4 rounded-2xl">
            <span className="text-xs font-bold text-muted-foreground">
              Mostrando {offset + 1} a {Math.min(offset + limit, total)} de {total} registro(s) (Página {currentPage} de {totalPages})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={offset === 0}
                onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
                className="px-4 py-2 rounded-xl border border-border bg-background text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40 transition"
              >
                Página Anterior
              </button>
              <button
                type="button"
                disabled={offset + limit >= total}
                onClick={() => setOffset((prev) => prev + limit)}
                className="px-4 py-2 rounded-xl border border-border bg-background text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40 transition"
              >
                Próxima Página
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
