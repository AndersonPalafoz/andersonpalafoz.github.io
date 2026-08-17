'use client';

import { useEffect, useMemo, useState } from "react";
import { Award, BarChart3, CalendarCheck, Loader2, TrendingUp, Filter, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from "recharts";
import { mergeAcademicTimelines, AcademicComparisonPoint } from "@/lib/academic-comparison";

interface TimelinePoint {
  month: string;
  monthKey: string;
  averageGrade: number | null;
  gradeCount: number;
  attendanceRate: number | null;
  attendancePresent: number;
  attendanceTotal: number;
}

interface GradeRecord {
  score: number | null;
  submittedAt: string | null;
  activityTitle: string;
  courseTitle: string;
}

interface AttendanceRecord {
  status: string;
  recordedAt: string;
  sessionTitle: string;
}

type AcademicTooltipProps = TooltipProps<number | string, string> & {
  metric: "grade" | "attendance";
};

function AcademicTooltip({ active, payload, metric }: AcademicTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as AcademicComparisonPoint | undefined;
  if (!point) return null;

  return (
    <div className="min-w-[190px] rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
      <p className="text-xs font-black uppercase tracking-wide text-gray-500">{point.month} · {point.monthKey}</p>
      {metric === "grade" ? (
        <>
          <p className="mt-2 text-lg font-black text-red-600">{point.averageGrade === null ? "Sem nota" : `${point.averageGrade.toFixed(1)} pts`}</p>
          <p className="mt-1 text-xs text-gray-600">Média de {point.gradeCount} avaliação(ões) com nota.</p>
          {point.classAverageGrade !== null && <p className="mt-1 text-xs font-semibold text-gray-500">Média da turma: {point.classAverageGrade.toFixed(1)} pts</p>}
        </>
      ) : (
        <>
          <p className="mt-2 text-lg font-black text-emerald-700">{point.attendanceRate === null ? "Sem chamada" : `${point.attendanceRate}%`}</p>
          <p className="mt-1 text-xs text-gray-600">{point.attendancePresent} presença(s) em {point.attendanceTotal} registro(s).</p>
          {point.classAttendanceRate !== null && <p className="mt-1 text-xs font-semibold text-gray-500">Média da turma: {point.classAttendanceRate}%</p>}
        </>
      )}
    </div>
  );
}

export default function HistoricoAcademicoPage() {
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [classTimeline, setClassTimeline] = useState<TimelinePoint[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<string>("all");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch("/api/dashboard/historico", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Não foi possível carregar o histórico.");
        setTimeline(payload.timeline);
        setClassTimeline(payload.classTimeline || []);
        setGrades(payload.grades);
        setAttendance(payload.attendance);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Não foi possível carregar o histórico.");
      } finally {
        setLoading(false);
      }
    };
    void loadHistory();
  }, []);

  // Filtragem por Semestre Letivo (ex: 2026.1 = Jan-Jun, 2026.2 = Jul-Dez)
  const filteredTimeline = useMemo(() => {
    if (selectedSemester === "all") return timeline;
    return timeline.filter((point) => {
      if (!point.monthKey) return true;
      const [year, monthStr] = point.monthKey.split("-");
      const month = Number(monthStr);
      const sem = month <= 6 ? `${year}.1` : `${year}.2`;
      return sem === selectedSemester;
    });
  }, [timeline, selectedSemester]);

  const filteredGrades = useMemo(() => {
    if (selectedSemester === "all") return grades;
    return grades.filter((g) => {
      if (!g.submittedAt) return true;
      const d = new Date(g.submittedAt);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const sem = month <= 6 ? `${year}.1` : `${year}.2`;
      return sem === selectedSemester;
    });
  }, [grades, selectedSemester]);

  const gradeAverage = useMemo(() => {
    const scored = filteredGrades.filter((grade) => grade.score !== null).map((grade) => grade.score as number);
    return scored.length ? (scored.reduce((sum, score) => sum + score, 0) / scored.length).toFixed(1) : "—";
  }, [filteredGrades]);

  const chartTimeline = useMemo(() => mergeAcademicTimelines(filteredTimeline, classTimeline), [filteredTimeline, classTimeline]);

  const presenceRate = useMemo(() => {
    if (!attendance.length) return "—";
    const present = attendance.filter((item) => item.status === "present").length;
    return `${Math.round((present / attendance.length) * 100)}%`;
  }, [attendance]);

  if (loading) {
    return <div className="flex min-h-64 items-center justify-center"><Loader2 className="animate-spin text-red-600" size={32} /></div>;
  }

  return (
    <div className="space-y-8 pb-12 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">Acompanhamento Acadêmico</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 dark:text-white">Histórico e Evolução de Notas</h1>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-6 text-gray-500 dark:text-gray-400">Analise seu desempenho por semestre letivo, compare sua evolução com a média da turma e filtre suas avaliações com precisão.</p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-3 rounded-2xl shadow-xs">
          <Filter size={16} className="text-red-600 shrink-0" />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Semestre:</span>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-red-600"
          >
            <option value="all">Todos os Semestres</option>
            <option value="2026.1">2026.1 (Jan–Jun)</option>
            <option value="2026.2">2026.2 (Jul–Dez)</option>
            <option value="2025.2">2025.2 (Jul–Dez)</option>
          </select>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-gray-500">Média das Notas</span><Award size={20} className="text-red-600" /></div><p className="mt-3 text-3xl font-black text-gray-950 dark:text-white">{gradeAverage}</p><p className="mt-1 text-xs text-gray-500">pontuação média no filtro</p></div>
        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-gray-500">Frequência Geral</span><CalendarCheck size={20} className="text-emerald-600" /></div><p className="mt-3 text-3xl font-black text-emerald-700 dark:text-emerald-400">{presenceRate}</p><p className="mt-1 text-xs text-gray-500">presenças registradas</p></div>
        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-gray-500">Avaliações Filtradas</span><TrendingUp size={20} className="text-blue-600" /></div><p className="mt-3 text-3xl font-black text-gray-950 dark:text-white">{filteredGrades.length}</p><p className="mt-1 text-xs text-gray-500">atividades pontuadas</p></div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-lg font-black text-gray-950 dark:text-white flex items-center gap-2"><Calendar size={18} className="text-red-600" /> Evolução Visual das Notas por Período</h2><p className="mt-1 text-xs text-gray-500">Gráfico dinâmico comparando suas notas com a média da turma no semestre selecionado.</p></div><BarChart3 size={20} className="text-red-600" /></div>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip content={<AcademicTooltip metric="grade" />} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Line type="monotone" dataKey="averageGrade" name="Sua Média" stroke="#dc2626" strokeWidth={3} dot={{ r: 5, fill: "#dc2626" }} activeDot={{ r: 7 }} />
                <Line type="monotone" dataKey="classAverageGrade" name="Média da Turma" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-black text-gray-950 dark:text-white mb-1">Detalhamento das Avaliações</h2>
          <p className="text-xs text-gray-500 mb-4">Lista de notas obtidas nas atividades do semestre selecionado.</p>
          
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {filteredGrades.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-10">Nenhuma avaliação encontrada para o semestre selecionado.</p>
            ) : (
              filteredGrades.map((g, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40">
                  <div>
                    <p className="text-xs font-black text-gray-900 dark:text-white">{g.activityTitle}</p>
                    <p className="text-[10px] text-gray-500">{g.courseTitle} • {g.submittedAt ? new Date(g.submittedAt).toLocaleDateString("pt-BR") : "Data não informada"}</p>
                  </div>
                  <span className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 font-black text-xs px-3 py-1 rounded-full border border-red-200 dark:border-red-900/40">
                    {g.score !== null ? `${g.score} pts` : "Pendente"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
