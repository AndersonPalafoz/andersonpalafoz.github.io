"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";

type Course = { id: number; title: string; level: string };

export function CreateInternalClassDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [offerName, setOfferName] = useState("");
  const [academicTerm, setAcademicTerm] = useState("");
  const [modality, setModality] = useState("Remota");
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || courses.length > 0) return;
    void fetch("/api/professor/courses", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch(() => setError("Não foi possível carregar os cursos internos."));
  }, [open, courses.length]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/course-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, offerName, academicTerm, modality, status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível criar a turma.");
      setOpen(false);
      setCourseId("");
      setOfferName("");
      setAcademicTerm("");
      onCreated();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Não foi possível criar a turma.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-red-600 px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700">
        <Plus size={16} aria-hidden="true" /> Nova turma
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
          <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="create-internal-class-title">
            <div className="flex items-start justify-between gap-4"><div><h2 id="create-internal-class-title" className="text-xl font-black text-foreground">Criar turma interna</h2><p className="mt-1 text-sm text-muted-foreground">A turma será vinculada a um curso disponível na plataforma.</p></div><button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Fechar"><X size={18} /></button></div>
            <div className="mt-6 grid gap-4">
              <label className="grid gap-1.5 text-sm font-semibold text-foreground">Curso interno<select required value={courseId} onChange={(event) => setCourseId(event.target.value)} className="rounded-xl border border-border bg-background px-3 py-2.5 font-normal"><option value="">Selecione um curso</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title} · {course.level}</option>)}</select></label>
              <label className="grid gap-1.5 text-sm font-semibold text-foreground">Nome da turma<input required value={offerName} onChange={(event) => setOfferName(event.target.value)} placeholder="Ex.: Inglês B1 — Noite" className="rounded-xl border border-border bg-background px-3 py-2.5 font-normal" /></label>
              <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-semibold text-foreground">Período acadêmico<input required value={academicTerm} onChange={(event) => setAcademicTerm(event.target.value)} placeholder="2026.2" className="rounded-xl border border-border bg-background px-3 py-2.5 font-normal" /></label><label className="grid gap-1.5 text-sm font-semibold text-foreground">Modalidade<select value={modality} onChange={(event) => setModality(event.target.value)} className="rounded-xl border border-border bg-background px-3 py-2.5 font-normal"><option>Remota</option><option>Presencial</option><option>Híbrida</option></select></label></div>
              <label className="grid gap-1.5 text-sm font-semibold text-foreground">Publicação<select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-border bg-background px-3 py-2.5 font-normal"><option value="draft">Salvar como rascunho</option><option value="published">Publicar agora</option></select></label>
              {error && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground">Cancelar</button><button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{loading && <Loader2 size={16} className="animate-spin" />}Criar turma</button></div>
          </form>
        </div>
      )}
    </>
  );
}
