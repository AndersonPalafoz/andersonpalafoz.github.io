"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, BarChart3, CalendarCheck, Loader2, TrendingUp } from "lucide-react";
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

  const gradeAverage = useMemo(() => {
    const scored = grades.filter((grade) => grade.score !== null).map((grade) => grade.score as number);
    return scored.length ? (scored.reduce((sum, score) => sum + score, 0) / scored.length).toFixed(1) : "—";
  }, [grades]);

  const chartTimeline = useMemo(() => mergeAcademicTimelines(timeline, classTimeline), [timeline, classTimeline]);

  const presenceRate = useMemo(() => {
    if (!attendance.length) return "—";
    const present = attendance.filter((item) => item.status === "present").length;
    return `${Math.round((present / attendance.length) * 100)}%`;
  }, [attendance]);

  if (loading) {
    return <div className="flex min-h-64 items-center justify-center"><Loader2 className="animate-spin text-red-600" size={32} /></div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-red-600">Acompanhamento</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950">Histórico acadêmico</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">Veja como suas notas e sua frequência evoluíram ao longo do tempo. Passe o cursor sobre cada ponto para consultar os valores exatos e a base usada no cálculo.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-gray-500">Média das notas</span><Award size={20} className="text-red-600" /></div><p className="mt-3 text-3xl font-black text-gray-950">{gradeAverage}</p><p className="mt-1 text-xs text-gray-500">pontuação média registrada</p></div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-gray-500">Frequência</span><CalendarCheck size={20} className="text-emerald-600" /></div><p className="mt-3 text-3xl font-black text-emerald-700">{presenceRate}</p><p className="mt-1 text-xs text-gray-500">presenças nas chamadas</p></div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-gray-500">Períodos acompanhados</span><TrendingUp size={20} className="text-blue-600" /></div><p className="mt-3 text-3xl font-black text-gray-950">{timeline.length}</p><p className="mt-1 text-xs text-gray-500">meses com registros reais</p></div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-lg font-black text-gray-950">Evolução das notas</h2><p className="mt-1 text-xs text-gray-500">Média das pontuações por mês. A linha tracejada mostra a média da turma nos mesmos cursos.</p></div><BarChart3 size={20} className="text-red-600" /></div>
          {timeline.some((point) => point.averageGrade !== null) ? <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartTimeline} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" /><XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#6B7280" /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#6B7280" /><Tooltip content={<AcademicTooltip metric="grade" />} /><Legend /><Line type="monotone" dataKey="averageGrade" name="Sua média" stroke="#D62828" strokeWidth={3} dot={{ r: 4, fill: "#D62828" }} connectNulls /><Line type="monotone" dataKey="classAverageGrade" name="Média da turma" stroke="#6B7280" strokeWidth={2} strokeDasharray="6 5" dot={false} connectNulls /></LineChart></ResponsiveContainer></div> : <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 text-center text-sm text-gray-500">Ainda não há notas registradas em períodos suficientes para formar um gráfico.</div>}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-lg font-black text-gray-950">Evolução da frequência</h2><p className="mt-1 text-xs text-gray-500">Percentual de presença por mês. A linha tracejada mostra a média da turma nos mesmos cursos.</p></div><CalendarCheck size={20} className="text-emerald-600" /></div>
          {timeline.some((point) => point.attendanceRate !== null) ? <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartTimeline} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" /><XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#6B7280" /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#6B7280" /><Tooltip content={<AcademicTooltip metric="attendance" />} /><Legend /><Line type="monotone" dataKey="attendanceRate" name="Sua frequência" stroke="#16A34A" strokeWidth={3} dot={{ r: 4, fill: "#16A34A" }} connectNulls /><Line type="monotone" dataKey="classAttendanceRate" name="Média da turma" stroke="#6B7280" strokeWidth={2} strokeDasharray="6 5" dot={false} connectNulls /></LineChart></ResponsiveContainer></div> : <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 text-center text-sm text-gray-500">Ainda não há registros de chamada suficientes para formar um gráfico.</div>}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-black text-gray-950">Registros recentes</h2>
        <div className="mt-4 divide-y divide-gray-100">
          {grades.slice(-5).reverse().map((grade, index) => <div key={`${grade.activityTitle}-${grade.submittedAt}-${index}`} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-gray-900">{grade.activityTitle}</p><p className="text-xs text-gray-500">{grade.courseTitle} · {grade.submittedAt ? new Date(grade.submittedAt).toLocaleDateString("pt-BR") : "Sem data"}</p></div><span className="text-sm font-black text-red-600">{grade.score === null ? "Pendente" : `${grade.score} pts`}</span></div>)}
          {grades.length === 0 && <p className="py-8 text-center text-sm text-gray-500">Nenhuma nota registrada ainda.</p>}
        </div>
      </section>
    </div>
  );
}
