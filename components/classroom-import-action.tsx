"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { ExternalLink, ShieldAlert } from "lucide-react";

const CLASSROOM_READONLY_SCOPE = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
  "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly",
  "https://www.googleapis.com/auth/classroom.rosters.readonly",
  "https://www.googleapis.com/auth/classroom.profile.emails",
].join(" ");

export const classroomAuthorizationScope = CLASSROOM_READONLY_SCOPE;

export function startClassroomAuthorization() {
  return signIn("google", { callbackUrl: "/dashboard" }, {
    prompt: "consent",
    access_type: "offline",
    scope: CLASSROOM_READONLY_SCOPE,
  });
}

export function ClassroomImportAction() {
  const [showDetails, setShowDetails] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [importingCoursework, setImportingCoursework] = useState(false);
  const [importingSubmissions, setImportingSubmissions] = useState(false);
  const [syncingRoster, setSyncingRoster] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function importCourses() {
    setSyncing(true);
    setResult(null);
    setError(null);
    try {
      const response = await fetch("/api/admin/classroom-sync", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível importar os cursos.");
      const stats = payload.stats;
      setResult(`${stats.importedCourses} curso(s) importado(s): ${stats.createdCourses} novo(s), ${stats.updatedCourses} atualizado(s).`);
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Não foi possível importar os cursos.");
    } finally {
      setSyncing(false);
    }
  }

  async function importCoursework() {
    setImportingCoursework(true);
    setResult(null);
    setError(null);
    try {
      const response = await fetch("/api/admin/classroom-coursework-sync", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível importar as atividades.");
      const stats = payload.stats;
      setResult(`${stats.fetchedCoursework} atividade(s) processada(s): ${stats.createdCoursework} nova(s), ${stats.updatedCoursework} atualizada(s).`);
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Não foi possível importar as atividades.");
    } finally {
      setImportingCoursework(false);
    }
  }

  async function importSubmissions() {
    setImportingSubmissions(true);
    setResult(null);
    setError(null);
    try {
      const response = await fetch("/api/admin/classroom-submissions-sync", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível importar as entregas.");
      const stats = payload.stats;
      setResult(`${stats.fetchedSubmissions} entrega(s) processada(s): ${stats.createdSubmissions} nova(s), ${stats.updatedSubmissions} atualizada(s).`);
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Não foi possível importar as entregas.");
    } finally {
      setImportingSubmissions(false);
    }
  }

  async function syncRoster() {
    setSyncingRoster(true);
    setResult(null);
    setError(null);
    try {
      const response = await fetch("/api/admin/classroom-roster-sync", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível sincronizar os alunos.");
      const stats = payload.stats;
      setResult(`${stats.fetchedStudents} aluno(s) processado(s): ${stats.linkedStudents} vinculado(s) e ${stats.linkedSubmissions} entrega(s) associada(s).`);
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Não foi possível sincronizar os alunos.");
    } finally {
      setSyncingRoster(false);
    }
  }

  return (
    <section className="surface-card space-y-4 border-2 border-dashed border-amber-200 bg-amber-50/30 p-6 text-center dark:border-amber-900/50 dark:bg-amber-950/20 sm:p-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"><ShieldAlert size={24} /></div>
      <div className="space-y-1"><h3 className="text-base font-black text-foreground">Nenhuma matrícula importada do Google Classroom</h3><p className="mx-auto max-w-md text-xs leading-relaxed text-muted-foreground">A conta está sem matrículas locais e não há uma conexão Classroom confirmada para importar dados. Nenhuma turma ou atividade será criada automaticamente.</p></div>
      <button type="button" onClick={() => setShowDetails((value) => !value)} className="inline-flex items-center gap-2 rounded-xl border border-amber-300 px-4 py-2.5 text-xs font-black text-amber-800 transition hover:bg-amber-100 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-950/40">{showDetails ? "Ocultar detalhes" : "Ver status da integração"}</button>
      {showDetails && <div className="mx-auto max-w-lg rounded-2xl border border-border bg-background p-4 text-left text-xs leading-5 text-muted-foreground"><p>O Google Classroom exige uma autorização específica para leitura de turmas, atividades, entregas e participantes. O login padrão não solicita esses escopos.</p><div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={() => void startClassroomAuthorization()} className="inline-flex items-center gap-2 font-bold text-primary hover:underline"><ExternalLink size={14} /> Conectar Google Classroom</button><button type="button" onClick={() => void importCourses()} disabled={syncing || importingCoursework} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 font-bold text-primary-foreground disabled:cursor-wait disabled:opacity-60">{syncing ? "Importando..." : "Importar cursos"}</button><button type="button" onClick={() => void importCoursework()} disabled={syncing || importingCoursework || importingSubmissions} className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 font-bold text-primary disabled:cursor-wait disabled:opacity-60">{importingCoursework ? "Importando atividades..." : "Importar atividades"}</button><button type="button" onClick={() => void importSubmissions()} disabled={syncing || importingCoursework || importingSubmissions || syncingRoster} className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 font-bold text-primary disabled:cursor-wait disabled:opacity-60">{importingSubmissions ? "Importando entregas..." : "Importar entregas e notas"}</button><button type="button" onClick={() => void syncRoster()} disabled={syncing || importingCoursework || importingSubmissions || syncingRoster} className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 font-bold text-primary disabled:cursor-wait disabled:opacity-60">{syncingRoster ? "Vinculando alunos..." : "Sincronizar alunos"}</button></div>{result && <p className="mt-3 font-semibold text-emerald-700">{result}</p>}{error && <p className="mt-3 font-semibold text-destructive">{error}</p>}</div>}
    </section>
  );
}
