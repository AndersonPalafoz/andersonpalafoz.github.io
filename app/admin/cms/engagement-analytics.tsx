"use client";

import { useEffect, useState } from "react";
import { Users, Trophy, Award, Activity, BarChart3, CheckCircle2, Download, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RealEngagementStats {
  totalStudents: number;
  avgXp: string;
  activeStreaks: string;
  popularMission: string;
  completionRate: string;
  recentActivity: Array<{
    student: string;
    action: string;
    xp: string;
    time: string;
  }>;
}

export function CMSEngagementAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RealEngagementStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRealStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/stats", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Não foi possível carregar as métricas reais do banco de dados.");
      }
      const data = await response.json();
      // Mapear dados reais do banco
      setStats({
        totalStudents: data.totalStudents ?? 0,
        avgXp: `${data.avgXp ?? 0} XP`,
        activeStreaks: `${data.activeStreaksPercentage ?? 0}%`,
        popularMission: data.popularMission || "Nenhuma missão registrada",
        completionRate: `${data.completionRate ?? 0}%`,
        recentActivity: Array.isArray(data.recentActivity) && data.recentActivity.length > 0 
          ? data.recentActivity 
          : [{ student: "Nenhum aluno ativo", action: "Aguardando interações na plataforma", xp: "0 XP", time: "Agora" }],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido ao buscar dados reais.");
      // Fallback estrito com base vazia real
      setStats({
        totalStudents: 0,
        avgXp: "0 XP",
        activeStreaks: "0%",
        popularMission: "Sem dados suficientes",
        completionRate: "0%",
        recentActivity: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRealStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Métricas Reais de Engajamento (Banco de Dados)</h3>
          <p className="text-xs text-slate-500">Indicadores calculados em tempo real a partir da atividade dos usuários cadastrados.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => void fetchRealStats()}
            variant="outline"
            disabled={loading}
            className="text-xs font-bold h-9 px-3 rounded-xl gap-1.5"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Atualizar Dados
          </Button>
          <Button
            onClick={() => {
              if (!stats || stats.recentActivity.length === 0) {
                toast.error("Não há dados reais suficientes para exportar.");
                return;
              }
              const csvContent = "data:text/csv;charset=utf-8," + 
                ["Aluno,Ação,XP,Horário", ...stats.recentActivity.map(a => `"${a.student}","${a.action}","${a.xp}","${a.time}"`)].join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `relatorio_engajamento_real_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              link.remove();
              toast.success("Relatório CSV real exportado com sucesso!");
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-sm gap-1.5"
          >
            <Download size={14} /> Exportar CSV Real
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
          <AlertCircle size={16} /> {error} Exibindo registros disponíveis.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Alunos Registrados</span>
            <Users size={18} className="text-red-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{loading ? "..." : stats?.totalStudents}</p>
          <p className="text-[11px] text-slate-400 font-medium">Contas ativas no banco</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Média de XP Real</span>
            <Trophy size={18} className="text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{loading ? "..." : stats?.avgXp}</p>
          <p className="text-[11px] text-slate-400 font-medium">Baseado no cadastro real</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Ofensiva Ativa</span>
            <Activity size={18} className="text-orange-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{loading ? "..." : stats?.activeStreaks}</p>
          <p className="text-[11px] text-slate-400 font-medium">Alunos com streak &gt; 0</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Taxa de Conclusão</span>
            <Award size={18} className="text-blue-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{loading ? "..." : stats?.completionRate}</p>
          <p className="text-[11px] text-slate-400 font-medium">Aulas/atividades concluídas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-red-600" size={18} /> Atividade Recente Registrada no Banco
          </h3>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Carregando dados reais...</div>
          ) : stats?.recentActivity.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">Nenhuma atividade recente registrada no banco de dados.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats?.recentActivity.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{item.student}</h4>
                      <p className="text-[11px] text-slate-500">{item.action}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full">{item.xp}</span>
                    <span className="block text-[10px] text-slate-400 mt-1">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="text-red-600" size={18} /> Missão Mais Popular Real
          </h3>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="text-[10px] font-black uppercase bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 px-2.5 py-1 rounded-full">
              Dados do Banco
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{loading ? "Carregando..." : stats?.popularMission}</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Calculada com base nas submissões e resgates registrados na tabela de missões e XP.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
