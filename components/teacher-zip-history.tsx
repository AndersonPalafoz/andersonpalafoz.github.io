"use client";

import { useEffect, useState } from "react";
import { Clock, FileArchive, RefreshCw } from "lucide-react";

type ZipExportItem = {
  id: number;
  filename: string;
  materialCount: number;
  totalBytes: number;
  createdAt: string | Date;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TeacherZipHistory({ refreshTrigger }: { refreshTrigger?: number }) {
  const [items, setItems] = useState<ZipExportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/professor/zip-history", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Falha ao carregar histórico.");
      setItems(payload.exports || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido ao carregar histórico.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [refreshTrigger]);

  return (
    <div className="mt-8 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Histórico de Exportações ZIP</h3>
        </div>
        <button
          onClick={loadHistory}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"
          title="Atualizar histórico"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {loading && items.length === 0 ? (
        <div className="space-y-3 py-4">
          <div className="h-10 w-full bg-muted/60 animate-pulse rounded-lg" />
          <div className="h-10 w-full bg-muted/60 animate-pulse rounded-lg" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive py-3">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Nenhuma exportação de ZIP realizada recentemente. Os arquivos gerados aparecerão aqui.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Arquivo</th>
                <th className="py-2.5 px-3">Itens</th>
                <th className="py-2.5 px-3">Tamanho</th>
                <th className="py-2.5 px-3 rounded-r-lg">Data e Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3 font-medium flex items-center gap-2">
                    <FileArchive className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate max-w-[240px] md:max-w-xs">{item.filename}</span>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">{item.materialCount} material(is)</td>
                  <td className="py-3 px-3 text-muted-foreground">{formatBytes(item.totalBytes)}</td>
                  <td className="py-3 px-3 text-muted-foreground text-xs">
                    {new Date(item.createdAt).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
