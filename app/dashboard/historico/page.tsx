'use client';

import { useEffect, useMemo, useState } from "react";
import { Award, BarChart3, CalendarCheck, TrendingUp, Filter, Calendar, Download, AlertTriangle, CheckCircle2, BookOpen, Cloud } from "lucide-react";
import { toast } from "sonner";
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from "recharts";
import { mergeAcademicTimelines, AcademicComparisonPoint } from "@/lib/academic-comparison";
import { createTablePdf, downloadPdf } from "@/lib/pdf-export";

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string>("all");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoadError(null);
        const response = await fetch("/api/dashboard/historico", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Não foi possível carregar o histórico.");
        setTimeline(payload.timeline);
        setClassTimeline(payload.classTimeline || []);
        setGrades(payload.grades);
        setAttendance(payload.attendance);
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Não foi possível carregar o histórico.";
        setLoadError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    void loadHistory();
  }, []);

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
  const semesterOptions = useMemo(() => {
    const keys = new Set<string>();
    for (const point of timeline) if (point.monthKey) {
      const [year, monthValue] = point.monthKey.split("-");
      keys.add(`${year}.${Number(monthValue) <= 6 ? "1" : "2"}`);
    }
    for (const grade of grades) if (grade.submittedAt) {
      const date = new Date(grade.submittedAt);
      keys.add(`${date.getFullYear()}.${date.getMonth() + 1 <= 6 ? "1" : "2"}`);
    }
    return Array.from(keys).sort((a, b) => b.localeCompare(a));
  }, [timeline, grades]);

  const presenceRate = useMemo(() => {
    if (!attendance.length) return "—";
    const present = attendance.filter((item) => item.status === "present").length;
    return `${Math.round((present / attendance.length) * 100)}%`;
  }, [attendance]);

  // Alerta de desempenho inteligente com base na tendência
  const performanceAlert = useMemo(() => {
    if (filteredGrades.length < 2) {
      return { type: "info", text: "Continue realizando as atividades e quizzes para gerar análises de tendência acadêmica." };
    }
    const recent = filteredGrades.slice(-2);
    const lastScore = recent[1]?.score ?? 0;
    const prevScore = recent[0]?.score ?? 0;
    if (lastScore > prevScore + 5) {
      return { type: "success", text: `Desempenho em alta! Sua nota mais recente (${lastScore} pts) superou a anterior em ${(lastScore - prevScore).toFixed(0)} pontos.` };
    }
    if (lastScore < prevScore - 5) {
      return { type: "warning", text: `Atenção: leve queda de ${(prevScore - lastScore).toFixed(0)} pontos na última atividade. Recomendamos revisar a trilha adaptativa.` };
    }
    return { type: "stable", text: "Seu ritmo de notas está estável e consistente ao longo do semestre." };
  }, [filteredGrades]);

  // Agrupamento por Disciplina / Curso
  const gradesByCourse = useMemo(() => {
    const map: Record<string, { courseTitle: string; count: number; totalScore: number; grades: GradeRecord[] }> = {};
    filteredGrades.forEach((g) => {
      const title = g.courseTitle || "Geral";
      if (!map[title]) {
        map[title] = { courseTitle: title, count: 0, totalScore: 0, grades: [] };
      }
      map[title].count += 1;
      if (g.score !== null) map[title].totalScore += g.score;
      map[title].grades.push(g);
    });
    return Object.values(map).map((item) => ({
      ...item,
      avg: item.count > 0 ? (item.grades.filter(x => x.score !== null).reduce((acc, x) => acc + (x.score || 0), 0) / (item.grades.filter(x => x.score !== null).length || 1)).toFixed(1) : "—"
    }));
  }, [filteredGrades]);

  const handleExportPDF = async () => {
    if (filteredGrades.length === 0) {
      toast.error("Nenhum registro para exportar no período selecionado.");
      return;
    }
    try {
      const rows = filteredGrades.map((g) => [
        g.courseTitle,
        g.activityTitle,
        g.submittedAt ? new Date(g.submittedAt).toLocaleDateString("pt-BR") : "N/A",
        g.score !== null ? `${g.score} pts` : "Pendente"
      ]);
      const pdfBytes = await createTablePdf(
        `Histórico Acadêmico — Anderson Palafoz (${selectedSemester === "all" ? "Geral" : selectedSemester})`,
        ["Disciplina / Curso", "Atividade", "Data", "Nota"],
        rows
      );
      downloadPdf(pdfBytes, `historico-academico-${selectedSemester}-${Date.now()}.pdf`);
      toast.success("Histórico acadêmico exportado em PDF com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao gerar PDF.");
    }
  };



  if (loading) {
    return (
      <div className="space-y-8 pb-12 font-sans animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4 w-48 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-8 w-80 bg-gray-200 dark:bg-slate-800 rounded-xl"></div>
            <div className="h-4 w-96 bg-gray-100 dark:bg-slate-800/60 rounded-lg"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-40 bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>
          </div>
        </div>

        <div className="h-16 w-full bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="h-32 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 space-y-3">
            <div className="h-4 w-28 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-8 w-20 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
          </div>
          <div className="h-32 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 space-y-3">
            <div className="h-4 w-28 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-8 w-20 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
          </div>
          <div className="h-32 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 space-y-3">
            <div className="h-4 w-28 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-8 w-20 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
          </div>
        </div>

        <div className="h-64 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 space-y-4">
          <div className="h-5 w-48 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-gray-100 dark:bg-slate-800/60 rounded-2xl"></div>
            <div className="h-24 bg-gray-100 dark:bg-slate-800/60 rounded-2xl"></div>
            <div className="h-24 bg-gray-100 dark:bg-slate-800/60 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 space-y-4 bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/50 shadow-sm">
        <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-600 rounded-2xl">
          <AlertTriangle size={32} />
        </div>
        <div>
          <h2 className="text-lg font-black text-gray-950 dark:text-white">Não foi possível carregar o histórico acadêmico.</h2>
          <p className="mt-1 text-xs text-gray-500 max-w-md">{loadError}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-md transition"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-red-600 flex items-center gap-1.5">
            <Cloud size={14} className="text-red-600" /> Registros acadêmicos persistidos
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 dark:text-white">Histórico Acadêmico e Relatórios</h1>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-6 text-gray-500 dark:text-gray-400">Acompanhe notas e frequência usando somente registros acadêmicos reais da sua conta.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-2.5 rounded-2xl shadow-xs">
            <Filter size={15} className="text-red-600 shrink-0" />
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none"
            >
              <option value="all">Todos os semestres registrados</option>
              {semesterOptions.map((semester) => <option key={semester} value={semester}>{semester}</option>)}
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportPDF}
            className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-md transition flex items-center gap-2"
          >
            <Download size={15} /> Exportar PDF
          </button>
        </div>
      </header>

      {/* Resumo calculado a partir dos registros carregados */}
      <div className={`p-4 rounded-2xl border flex items-center gap-3.5 shadow-xs ${
        performanceAlert.type === "success" ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200" :
        performanceAlert.type === "warning" ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200" :
        "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200"
      }`}>
        {performanceAlert.type === "success" ? <CheckCircle2 size={20} className="text-emerald-600 shrink-0" /> :
         performanceAlert.type === "warning" ? <AlertTriangle size={20} className="text-amber-600 shrink-0" /> :
         <TrendingUp size={20} className="text-blue-600 shrink-0" />}
        <div className="text-xs font-bold">
          <span className="uppercase tracking-wider block text-[10px] opacity-75 mb-0.5">Resumo do desempenho registrado</span>
          {performanceAlert.text}
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-gray-500">Média das Notas</span><Award size={20} className="text-red-600" /></div><p className="mt-3 text-3xl font-black text-gray-950 dark:text-white">{gradeAverage}</p><p className="mt-1 text-xs text-gray-500">pontuação média no filtro</p></div>
        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-gray-500">Frequência Geral</span><CalendarCheck size={20} className="text-emerald-600" /></div><p className="mt-3 text-3xl font-black text-emerald-700 dark:text-emerald-400">{presenceRate}</p><p className="mt-1 text-xs text-gray-500">presenças registradas</p></div>
        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-gray-500">Avaliações Filtradas</span><TrendingUp size={20} className="text-blue-600" /></div><p className="mt-3 text-3xl font-black text-gray-950 dark:text-white">{filteredGrades.length}</p><p className="mt-1 text-xs text-gray-500">atividades pontuadas</p></div>
      </section>

      {/* Visão Detalhada por Disciplina */}
      <section className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-gray-950 dark:text-white flex items-center gap-2">
            <BookOpen size={18} className="text-red-600" /> Desempenho por Disciplina / Curso
          </h2>
          <span className="text-xs font-bold text-gray-500">{gradesByCourse.length} disciplina(s) ativa(s)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gradesByCourse.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-900 dark:text-white truncate max-w-[180px]">{item.courseTitle}</span>
                <span className="bg-red-600 text-white font-black text-xs px-2.5 py-0.5 rounded-full">{item.avg} pts</span>
              </div>
              <p className="text-[11px] text-gray-500">{item.count} atividade(s) avaliada(s)</p>
              <div className="w-full bg-gray-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-red-600 h-full" style={{ width: `${Math.min(Number(item.avg) || 0, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-lg font-black text-gray-950 dark:text-white flex items-center gap-2"><Calendar size={18} className="text-red-600" /> Evolução Gráfica das Notas</h2><p className="mt-1 text-xs text-gray-500">Comparativo temporal entre seu desempenho e a média da turma.</p></div><BarChart3 size={20} className="text-red-600" /></div>
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
          <p className="text-xs text-gray-500 mb-4">Registro completo de notas do semestre filtrado.</p>
          
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
