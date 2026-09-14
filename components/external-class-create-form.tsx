"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type ClassFormValues = {
  institution: string; className: string; courseName: string; academicTerm: string; description: string;
  classDays: string; classTime: string; workloadHours: string; startDate: string; endDate: string;
  passingAverage: string; maxAbsencePercent: string; durationType: string; durationValue: string; durationUnit: string;
  modality: string; level: string; meetingLink: string; classroomLocation: string; instructorName: string; monitors: string;
};

type Props = { classId?: number; initialValues?: Partial<ClassFormValues> };
const emptyForm: ClassFormValues = { institution: "IsF", className: "", courseName: "", academicTerm: "", description: "", classDays: "", classTime: "", workloadHours: "40", startDate: "", endDate: "", passingAverage: "6", maxAbsencePercent: "25", durationType: "semester", durationValue: "", durationUnit: "semester", modality: "Remota", level: "Básico (A1-A2)", meetingLink: "", classroomLocation: "", instructorName: "", monitors: "" };

export function ExternalClassCreateForm({ classId, initialValues }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ClassFormValues>({ ...emptyForm, ...initialValues });
  const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  const update = (key: keyof ClassFormValues, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) { event.preventDefault(); setSaving(true); setError(""); try { const response = await fetch("/api/professor/external-classes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: classId ? "updateClass" : "createClass", ...(classId ? { classId } : {}), ...form }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error || "Não foi possível salvar a turma."); router.push("/professor/turmas-externas/gerenciar"); router.refresh(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível salvar a turma."); } finally { setSaving(false); } }
  const field = (key: keyof ClassFormValues, label: string, props: Record<string, string> = {}) => <label className="text-sm font-bold">{label}<input value={form[key]} onChange={(event) => update(key, event.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background p-3" {...props} /></label>;
  return <form onSubmit={submit} className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7"><div className="grid gap-4 sm:grid-cols-2">{field("institution", "Instituição", { required: "true" })}{field("academicTerm", "Período letivo", { required: "true", placeholder: "2026.1" })}{field("className", "Nome da turma", { required: "true", placeholder: "Turma Vespertina" })}{field("courseName", "Curso ou disciplina", { required: "true", placeholder: "Inglês Instrumental" })}</div><div className="border-t border-border pt-5"><h3 className="font-black">Calendário e encontros</h3><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{field("startDate", "Data de início", { type: "date" })}{field("endDate", "Data de término", { type: "date" })}{field("classDays", "Dias da semana", { placeholder: "Terças e quintas" })}{field("classTime", "Horário", { placeholder: "14:00–16:00" })}</div></div><div className="border-t border-border pt-5"><h3 className="font-black">Critérios acadêmicos</h3><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{field("workloadHours", "Carga horária (h)", { type: "number", min: "1" })}{field("passingAverage", "Média mínima", { type: "number", min: "0", max: "10", step: "0.01" })}{field("maxAbsencePercent", "Limite de faltas (%)", { type: "number", min: "0", max: "100" })}{field("durationValue", "Duração (opcional)", { type: "number", min: "1" })}</div></div><div className="border-t border-border pt-5"><h3 className="font-black">Formato e acesso</h3><div className="mt-4 grid gap-4 sm:grid-cols-2">{field("modality", "Modalidade", { placeholder: "Remota, presencial ou híbrida" })}{field("level", "Nível", { placeholder: "Básico (A1-A2)" })}{field("meetingLink", "Link da aula", { type: "url" })}{field("classroomLocation", "Sala ou local")}{field("instructorName", "Professor responsável")}{field("monitors", "Monitores")}</div></div><label className="block text-sm font-bold">Descrição<textarea value={form.description} onChange={(event) => update("description", event.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-border bg-background p-3" /></label>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}<div className="flex flex-wrap justify-end gap-2"><button type="button" onClick={() => router.push("/professor/turmas-externas/gerenciar")} className="rounded-xl border border-border px-4 py-3 text-sm font-bold">Cancelar</button><button disabled={saving} className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? "Salvando..." : classId ? "Salvar alterações" : "Criar turma"}</button></div></form>;
}

export type { ClassFormValues };
export { emptyForm };
