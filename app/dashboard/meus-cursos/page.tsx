"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Award, BookOpen, Building2, Calendar, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface StudentPortalEnrollment {
  student: {
    id: number;
    name: string;
    email: string | null;
    studentIdNumber: string | null;
    status: string;
    notes: string | null;
  };
  classItem: {
    id: number;
    institution: string;
    className: string;
    courseName: string;
    academicTerm: string;
    description: string | null;
  };
  grades: Array<{
    id: number;
    assessmentTitle: string;
    score: string;
    maxScore: string;
    feedback: string | null;
    createdAt: string;
  }>;
  materials: Array<{
    id: number;
    title: string;
    fileUrl: string;
    description: string | null;
  }>;
  attendanceStats: {
    totalClasses: number;
    presentCount: number;
    attendanceRate: number;
  };
}

export default function MeusCursosExternosPage() {
  const [enrollments, setEnrollments] = useState<StudentPortalEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortal = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/aluno/portal");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao carregar dados do aluno.");
        setEnrollments(data.enrollments || []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao carregar cursos.");
      } finally {
        setLoading(false);
      }
    };
    void fetchPortal();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition shadow-xs"
                title="Voltar ao Dashboard"
              >
                <ArrowLeft size={18} />
              </Link>
              <h1 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
                <BookOpen className="text-red-600" size={26} /> Meus Cursos, Notas e Frequências Externas
              </h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 pl-13">
              Acompanhe seu desempenho acadêmico, notas lançadas pelos professores, taxa de presença e materiais disponibilizados.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="py-24 text-center text-gray-400 text-xs font-semibold flex flex-col items-center justify-center gap-3">
            <Loader2 size={24} className="animate-spin text-red-600" /> Carregando seus registros acadêmicos...
          </div>
        ) : enrollments.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3 shadow-sm">
            <Building2 size={32} className="mx-auto text-gray-400" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Nenhum curso externo vinculado</h3>
            <p className="text-xs text-gray-500">Seu e-mail não está associado a nenhuma turma institucional ou externa no momento.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {enrollments.map(({ student, classItem, grades, materials, attendanceStats }) => (
              <div key={classItem.id} className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
                        {classItem.institution}
                      </span>
                      <span className="text-xs font-bold text-gray-500">Período: {classItem.academicTerm}</span>
                    </div>
                    <h2 className="text-xl font-black text-gray-950 dark:text-white">{classItem.className}</h2>
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400">{classItem.courseName}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800/60 px-4 py-3 rounded-2xl text-right">
                    <p className="text-[10px] font-bold uppercase text-gray-500">Aluno Matriculado</p>
                    <p className="text-xs font-black text-gray-950 dark:text-white">{student.name}</p>
                    {student.studentIdNumber && <p className="text-[10px] text-gray-400">Matrícula: {student.studentIdNumber}</p>}
                  </div>
                </div>

                {/* Estatísticas de Frequência */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 space-y-1">
                    <p className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1.5">
                      <Calendar size={14} className="text-red-600" /> Frequência / Presença
                    </p>
                    <p className="text-lg font-black text-gray-950 dark:text-white">{attendanceStats.attendanceRate}%</p>
                    <p className="text-[11px] text-gray-500">{attendanceStats.presentCount} presenças em {attendanceStats.totalClasses} aulas chamadas</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 space-y-1">
                    <p className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1.5">
                      <Award size={14} className="text-blue-600" /> Avaliações Realizadas
                    </p>
                    <p className="text-lg font-black text-gray-950 dark:text-white">{grades.length}</p>
                    <p className="text-[11px] text-gray-500">Notas registradas pelo professor</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 space-y-1">
                    <p className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1.5">
                      <FileText size={14} className="text-amber-600" /> Materiais Disponíveis
                    </p>
                    <p className="text-lg font-black text-gray-950 dark:text-white">{materials.length}</p>
                    <p className="text-[11px] text-gray-500">Arquivos e links de estudo</p>
                  </div>
                </div>

                {/* Lista de Notas */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">Minhas Notas e Feedbacks</h3>
                  {grades.length === 0 ? (
                    <p className="text-xs text-gray-400 py-3 text-center bg-gray-50/50 dark:bg-slate-800/20 rounded-2xl">Nenhuma nota lançada nesta turma ainda.</p>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl px-4 py-2">
                      {grades.map(g => (
                        <div key={g.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{g.assessmentTitle}</p>
                            {g.feedback && <p className="text-gray-500 italic mt-0.5">Feedback: &quot;{g.feedback}&quot;</p>}
                          </div>
                          <div className="text-right whitespace-nowrap">
                            <span className="px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-black text-sm">
                              {g.score} / {g.maxScore}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lista de Materiais */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">Materiais Didáticos da Turma</h3>
                  {materials.length === 0 ? (
                    <p className="text-xs text-gray-400 py-3 text-center bg-gray-50/50 dark:bg-slate-800/20 rounded-2xl">Nenhum material publicado até o momento.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {materials.map(m => (
                        <a
                          key={m.id}
                          href={m.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-4 rounded-2xl border border-gray-200 dark:border-slate-800 hover:border-red-600 dark:hover:border-red-500 bg-gray-50 dark:bg-slate-800/50 transition flex items-start gap-3 group"
                        >
                          <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 mt-0.5">
                            <FileText size={16} />
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-red-600 transition">{m.title}</p>
                            {m.description && <p className="text-[11px] text-gray-500 line-clamp-2">{m.description}</p>}
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
