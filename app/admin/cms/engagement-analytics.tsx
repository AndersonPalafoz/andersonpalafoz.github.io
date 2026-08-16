import React from "react";
import { TrendingUp, Users, Trophy, Award, Activity, BarChart3, CheckCircle2 } from "lucide-react";

export function CMSEngagementAnalytics() {
  const stats = {
    totalStudents: 142,
    avgXp: "1,180 XP",
    activeStreaks: "86%",
    popularMission: "Gravar desafio de Speaking com IA",
    completionRate: "92%",
  };

  const recentActivity = [
    { student: "Maria Clara Santos", action: "Completou Quiz de B1", xp: "+50 XP", time: "Há 5 min" },
    { student: "João Pedro Alves", action: "Resgatou Missão Diária de Speaking", xp: "+100 XP", time: "Há 25 min" },
    { student: "Ana Beatriz Souza", action: "Conquistou Badge 'Grammar Master'", xp: "+150 XP", time: "Há 1 hora" },
    { student: "Lucas Gabriel Lima", action: "Concluiu Módulo 3 de Inglês", xp: "+200 XP", time: "Há 3 horas" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Alunos Ativos</span>
            <Users size={18} className="text-red-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalStudents}</p>
          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp size={13} /> +12% este mês
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Média de XP por Aluno</span>
            <Trophy size={18} className="text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.avgXp}</p>
          <p className="text-[11px] text-slate-400 font-medium">Baseado em quizzes e speaking</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Taxa de Ofensiva</span>
            <Activity size={18} className="text-orange-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.activeStreaks}</p>
          <p className="text-[11px] text-emerald-600 font-bold">Alta consistência diária</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Taxa de Conclusão</span>
            <Award size={18} className="text-blue-600" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.completionRate}</p>
          <p className="text-[11px] text-slate-400 font-medium">Atividades entregues no prazo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-red-600" size={18} /> Atividade Recente dos Alunos na Plataforma
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentActivity.map((item, idx) => (
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
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="text-red-600" size={18} /> Missão Diária Mais Popular
          </h3>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="text-[10px] font-black uppercase bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 px-2.5 py-1 rounded-full">
              Favorita da Turma
            </span>
            <h4 className="font-black text-sm text-slate-900 dark:text-white">{stats.popularMission}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Mais de 78% dos alunos concluem esta missão diariamente para acumular XP bônus e praticar conversação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
