"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Award, Building2, Calendar, FileText, Loader2, Mail, ShieldAlert, User } from "lucide-react";
import { toast } from "sonner";

interface GradeItem { id: number; assessmentTitle: string; score: string; maxScore: string; feedback: string | null; createdAt: string | Date; }
interface AttendanceItem { date: string; status: string; }
interface EnrollmentItem {
  classId: number;
  institution: string;
  className: string;
  courseName: string;
  academicTerm: string;
  status: string;
  notes: string | null;
  updatedAt: string | Date;
  maxAbsencePercent: number;
  grades: GradeItem[];
  attendance: AttendanceItem[];
  attendanceSummary: {
    totalSessions: number;
    present: number;
    absent: number;
    late: number;
    attendanceRate: number | null;
    absencePercent?: number;
    isAboveAbsenceLimit?: boolean;
  };
}

interface StudentReport {
  studentInfo: {
    id: number;
    name: string;
    email: string | null;
    studentIdNumber: string | null;
  };
  enrollments: EnrollmentItem[];
}

export default function StudentReportPage() {
  const params = useParams();
  const studentId = params?.studentId as string;

  const [report, setReport] = useState<StudentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/professor/external-student-report?studentId=${studentId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao carregar boletim.");
        setReport(data.report);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Erro ao carregar boletim.");
        toast.error(err instanceof Error ? err.message : "Erro ao carregar boletim.");
      } finally {
        setLoading(false);
      }
    };
    void fetchReport();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-gray-500 text-xs font-semibold gap-3">
        <Loader2 size={24} className="animate-spin text-red-600" /> Gerando boletim acadêmico consolidado...
      </div>
    );
  }

  if (errorMsg || !report) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <ShieldAlert size={40} className="text-red-600 mx-auto" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Não foi possível carregar o boletim</h2>
        <p className="text-xs text-gray-500 max-w-md">{errorMsg || "Aluno não encontrado ou sem permissão de acesso."}</p>
        <Link
          href="/professor/turmas-externas"
          className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
        >
          Voltar para Turmas Externas
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2 text-gray-900 dark:bg-slate-950 dark:text-white sm:p-4 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Cabeçalho de Navegação */}
        <header className="flex flex-col items-stretch gap-3 border-b border-gray-200 pb-5 print:hidden dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:pb-6">
          <Link
            href="/professor/turmas-externas"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 shadow-xs transition hover:bg-gray-100 dark:border-slate-800 dark:bg-slate-900 dark:text-gray-300 sm:w-auto"
          >
            <ArrowLeft size={16} /> Voltar para Gestão de Turmas
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 sm:w-auto"
          >
            <FileText size={16} /> Imprimir / Salvar PDF
          </button>
        </header>

        {/* Cartão de Identificação do Aluno */}
        <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
                Boletim Acadêmico Consolidado
              </span>
              <h1 className="mt-1 break-words text-2xl font-black text-gray-950 dark:text-white">{report.studentInfo.name}</h1>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-600/10 text-lg font-bold text-red-600">
              <User size={24} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Mail size={14} className="text-red-600" />
              <span>E-mail: <strong className="text-gray-900 dark:text-white">{report.studentInfo.email || "Não informado"}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Award size={14} className="text-red-600" />
              <span>Matrícula / ID: <strong className="text-gray-900 dark:text-white">{report.studentInfo.studentIdNumber || "Não informada"}</strong></span>
            </div>
          </div>
        </section>

        {/* Histórico de Matrículas e Cursos Externos */}
        <section className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Building2 size={16} className="text-red-600" /> Matrículas e Cursos Externos ({report.enrollments.length})
          </h2>

          {report.enrollments.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-xs text-gray-500">
              Nenhuma matrícula vinculada encontrada para este aluno.
            </div>
          ) : (
            <div className="space-y-4">
              {report.enrollments.map((enrol, idx) => (
                <article key={idx} className="space-y-4 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200">
                          {enrol.institution}
                        </span>
                        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                          <Calendar size={12} /> Período: {enrol.academicTerm}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-gray-950 dark:text-white">{enrol.courseName}</h3>
                      <p className="text-xs font-semibold text-red-600 dark:text-red-400">Turma: {enrol.className}</p>
                    </div>
                    <div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        enrol.status === "completed"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                          : enrol.status === "inactive"
                          ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          : "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                      }`}>
                        {enrol.status === "completed" ? "Concluído" : enrol.status === "inactive" ? "Inativo" : "Ativo (Cursando)"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <div className="mb-3 flex items-center justify-between"><strong className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">Notas lançadas</strong><span className="text-[10px] text-gray-500">{enrol.grades.length} registro(s)</span></div>
                      {enrol.grades.length === 0 ? <p className="text-xs text-gray-500">Nenhuma nota lançada nesta turma.</p> : <div className="space-y-2">{enrol.grades.map((grade) => <div key={grade.id} className="flex items-start justify-between gap-3 border-b border-gray-200/70 pb-2 text-xs last:border-0 last:pb-0 dark:border-slate-700"><div className="min-w-0 flex-1"><p className="break-words font-bold text-gray-900 dark:text-white">{grade.assessmentTitle}</p>{grade.feedback && <p className="mt-0.5 break-words text-gray-500">{grade.feedback}</p>}</div><span className="shrink-0 whitespace-nowrap font-black text-red-600">{grade.score} / {grade.maxScore}</span></div>)}</div>}
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 space-y-3">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><strong className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">Frequência registrada</strong><span className="text-[10px] font-semibold text-gray-500">Limite máx. faltas: {enrol.maxAbsencePercent}%</span></div>
                      {enrol.attendance.length === 0 ? <p className="text-xs text-gray-500">Nenhuma presença registrada nesta turma.</p> : (
                        <>
                          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"><strong className="block text-base">{enrol.attendanceSummary.present}</strong>Presenças</div>
                            <div className="rounded-xl bg-red-50 p-2 text-red-700 dark:bg-red-950/30 dark:text-red-300"><strong className="block text-base">{enrol.attendanceSummary.absent}</strong>Faltas ({enrol.attendanceSummary.absencePercent ?? 0}%)</div>
                            <div className="rounded-xl bg-amber-50 p-2 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"><strong className="block text-base">{enrol.attendanceSummary.late}</strong>Atrasos</div>
                          </div>
                          {enrol.attendanceSummary.isAboveAbsenceLimit ? (
                            <div role="alert" className="flex items-center gap-2 p-3 rounded-xl bg-red-100 dark:bg-red-950/70 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 text-xs font-bold">
                              <ShieldAlert size={16} className="shrink-0 text-red-600 dark:text-red-400" />
                              <span>Alerta: Aluno ultrapassou o limite máximo de faltas ({enrol.attendanceSummary.absencePercent}% &gt; {enrol.maxAbsencePercent}%)! Risco de reprovação por frequência.</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold">
                              <span>Frequência dentro do limite regulamentar (&le; {enrol.maxAbsencePercent}% de faltas).</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {enrol.notes && <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3.5 text-xs text-gray-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-gray-300"><strong className="mb-0.5 block text-gray-900 dark:text-white">Observações Acadêmicas:</strong>{enrol.notes}</div>}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
