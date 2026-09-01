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

  return (
    <section className="surface-card space-y-4 border-2 border-dashed border-amber-200 bg-amber-50/30 p-6 text-center dark:border-amber-900/50 dark:bg-amber-950/20 sm:p-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"><ShieldAlert size={24} /></div>
      <div className="space-y-1"><h3 className="text-base font-black text-foreground">Nenhuma matrícula importada do Google Classroom</h3><p className="mx-auto max-w-md text-xs leading-relaxed text-muted-foreground">A conta está sem matrículas locais e não há uma conexão Classroom confirmada para importar dados. Nenhuma turma ou atividade será criada automaticamente.</p></div>
      <button type="button" onClick={() => setShowDetails((value) => !value)} className="inline-flex items-center gap-2 rounded-xl border border-amber-300 px-4 py-2.5 text-xs font-black text-amber-800 transition hover:bg-amber-100 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-950/40">{showDetails ? "Ocultar detalhes" : "Ver status da integração"}</button>
      {showDetails && <div className="mx-auto max-w-lg rounded-2xl border border-border bg-background p-4 text-left text-xs leading-5 text-muted-foreground"><p>O Google Classroom exige uma autorização específica para leitura de turmas, atividades, entregas e participantes. O login padrão não solicita esses escopos.</p><button type="button" onClick={() => void startClassroomAuthorization()} className="mt-3 inline-flex items-center gap-2 font-bold text-primary hover:underline"><ExternalLink size={14} /> Conectar Google Classroom</button></div>}
    </section>
  );
}
