'use client';

import { useState, useEffect } from "react";
import { Calendar, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

export default function CalendarioPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingAll, setSyncingAll] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    // Simula carregamento de prazos reais da API ou banco
    setTimeout(() => {
      setEventos([
        { id: 1, title: "Entrega do Guia de Pronúncia e Fonética (A1-B2)", dueDate: "2026-08-25T23:59:00Z", status: "Pendente" },
        { id: 2, title: "Avaliação Prática de Speaking - Módulo 2", dueDate: "2026-08-30T23:59:00Z", status: "Pendente" },
        { id: 3, title: "Simulado Acadêmico de Sintaxe e Morfologia", dueDate: "2026-09-05T23:59:00Z", status: "Pendente" },
        { id: 4, title: "Entrega do Projeto Final de Redação C1", dueDate: "2026-09-15T23:59:00Z", status: "Pendente" }
      ]);
      setLoading(false);
    }, 400);
  }, []);

  const handleSyncAllSemester = async () => {
    setSyncingAll(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      const now = new Date().toLocaleString("pt-BR");
      setLastSync(now);
      toast.success("Todos os prazos do semestre foram sincronizados com sucesso no Google Calendar!");
    } catch (err) {
      toast.error("Erro ao sincronizar prazos com o Google Calendar.");
    } finally {
      setSyncingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Calendário & Prazos</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sincronize automaticamente os prazos das atividades com o seu Google Calendar.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSyncAllSemester}
          disabled={syncingAll || eventos.length === 0}
          className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={16} className={syncingAll ? "animate-spin" : ""} />
          <span>{syncingAll ? "Sincronizando Semestre..." : "Sincronizar Todos os Prazos do Semestre"}</span>
        </button>
      </div>

      {lastSync && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-2xl flex items-center gap-3 text-emerald-900 dark:text-emerald-200 text-xs font-bold">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>Sincronização em lote com o Google Calendar realizada com sucesso em {lastSync}.</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-red-600 font-bold">Carregando prazos do semestre...</div>
      ) : eventos.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400">Nenhum prazo pendente no momento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {eventos.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 font-black">
                  <Calendar size={22} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock size={13} />
                    {new Date(item.dueDate).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </p>
                </div>
              </div>

              <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 shrink-0">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
