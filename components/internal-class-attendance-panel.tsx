"use client";

import { useState } from "react";
import { CalendarPlus, Edit3, Loader2, Save, Trash2, X } from "lucide-react";

type Attendance = { id: number; sessionId: number; studentId: number; status: string; notes?: string | null };
type Session = { id: number; title: string; scheduledAt: string | Date };
type Student = { id: number; name: string | null; email: string | null };

type Props = { offerId: number; sessions: Session[]; students: Student[]; attendances: Attendance[]; onChanged: () => Promise<void> };

export function InternalClassAttendancePanel({ offerId, sessions, students, attendances, onChanged }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [savingNew, setSavingNew] = useState(false);
  const [newCall, setNewCall] = useState({ title: "", scheduledAt: "", durationMinutes: "60" });
  const [drafts, setDrafts] = useState<Record<string, { status: string; notes: string }>>({});
  function cancelNewCall() { setCreating(false); setNewCall({ title: "", scheduledAt: "", durationMinutes: "60" }); setDrafts({}); }
  function updateDraft(studentId: number, field: "status" | "notes", value: string) { setDrafts((current) => ({ ...current, [String(studentId)]: { status: current[String(studentId)]?.status || "present", notes: current[String(studentId)]?.notes || "", [field]: value } })); }
  async function saveNewCall() {
    if (!newCall.title.trim() || !newCall.scheduledAt) return;
    setSavingNew(true); setError("");
    try {
      const response = await fetch("/api/admin/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ offerId, title: newCall.title, scheduledAt: newCall.scheduledAt, durationMinutes: Number(newCall.durationMinutes), attendanceRecords: students.map((student) => ({ studentId: student.id, status: drafts[String(student.id)]?.status || "present", notes: drafts[String(student.id)]?.notes || "" })) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível criar a chamada.");
      cancelNewCall(); await onChanged();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível criar a chamada."); } finally { setSavingNew(false); }
  }

  async function updateAttendance(attendance: Attendance, status: string) {
    setSavingId(attendance.id); setError("");
    try {
      const response = await fetch("/api/admin/attendance", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attendanceId: attendance.id, sessionId: attendance.sessionId, offerId, status, notes: attendance.notes }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível atualizar a presença.");
      setEditingId(null); await onChanged();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível atualizar a presença."); } finally { setSavingId(null); }
  }

  async function deleteAttendance(attendance: Attendance) {
    if (!window.confirm("Excluir este registro de presença?")) return;
    setDeletingId(attendance.id); setError("");
    try {
      const response = await fetch("/api/admin/attendance", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attendanceId: attendance.id, sessionId: attendance.sessionId, offerId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível excluir a presença.");
      await onChanged();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível excluir a presença."); } finally { setDeletingId(null); }
  }

  return <div className="mt-5 flex flex-col gap-3">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/60 p-4 dark:border-red-950/40 dark:bg-red-950/10"><div><p className="font-black text-red-700 dark:text-red-300">Lançamento em lote</p><p className="text-xs text-muted-foreground">Registre presença, justificativa e anotações de todos os alunos de uma vez.</p></div><button type="button" onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700"><CalendarPlus size={15} /> Nova chamada</button></div>
    {creating && <div className="overflow-hidden rounded-xl border border-border"><div className="flex flex-wrap items-end gap-3 border-b border-border bg-muted/40 p-4"><label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Título<input value={newCall.title} onChange={(event) => setNewCall({ ...newCall, title: event.target.value })} placeholder="Aula 01" className="rounded-lg border border-border bg-background px-3 py-2 text-sm normal-case" /></label><label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Data e hora<input type="datetime-local" value={newCall.scheduledAt} onChange={(event) => setNewCall({ ...newCall, scheduledAt: event.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm normal-case" /></label><div className="flex gap-2"><button type="button" disabled={savingNew} onClick={() => void saveNewCall()} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-60"><Save size={15} />Salvar chamada</button><button type="button" disabled={savingNew} onClick={cancelNewCall} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-bold hover:bg-background"><X size={15} />Cancelar</button></div></div><div className="overflow-x-auto"><table className="min-w-[650px] w-full text-left text-sm"><thead className="bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="p-3">Aluno</th><th className="p-3">Status</th><th className="p-3">Justificativa / anotação</th></tr></thead><tbody className="divide-y divide-border">{students.map((student) => { const draft = drafts[String(student.id)] || { status: "present", notes: "" }; return <tr key={student.id}><td className="p-3 font-bold">{student.name || "Aluno sem nome"}</td><td className="p-3"><select value={draft.status} onChange={(event) => updateDraft(student.id, "status", event.target.value)} className="rounded-lg border border-border bg-background px-2 py-2"><option value="present">Presente</option><option value="absent">Ausente</option><option value="justified">Justificada</option></select></td><td className="p-3"><input value={draft.notes} onChange={(event) => updateDraft(student.id, "notes", event.target.value)} placeholder="Motivo ou anotação" className="w-full rounded-lg border border-border bg-background px-3 py-2" /></td></tr>; })}</tbody></table></div></div>}
    {error && <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{error}</p>}
    {attendances.length ? attendances.map((attendance) => {
      const student = students.find((item) => item.id === attendance.studentId);
      const session = sessions.find((item) => item.id === attendance.sessionId);
      const label = attendance.status === "present" ? "Presente" : attendance.status === "justified" ? "Justificada" : "Ausente";
      return <div key={attendance.id} className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-foreground">{student?.name || "Aluno não identificado"}</p><p className="text-sm text-muted-foreground">{session?.title || "Sessão não identificada"} · {session ? new Date(session.scheduledAt).toLocaleDateString("pt-BR") : ""}</p></div><div className="flex flex-wrap items-center gap-2">{editingId === attendance.id ? <select autoFocus value={attendance.status} onChange={(event) => void updateAttendance(attendance, event.target.value)} disabled={savingId === attendance.id} className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-bold"><option value="present">Presente</option><option value="absent">Ausente</option><option value="justified">Justificada</option></select> : <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">{label}</span>}<button type="button" onClick={() => setEditingId(attendance.id)} disabled={savingId === attendance.id} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-bold text-foreground hover:bg-muted"><Edit3 size={13} aria-hidden="true" />Editar</button><button type="button" onClick={() => void deleteAttendance(attendance)} disabled={deletingId === attendance.id} className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-2 py-1 text-xs font-bold text-destructive hover:bg-destructive/10 disabled:opacity-60">{deletingId === attendance.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} aria-hidden="true" />}Excluir</button></div></div>;
    }) : <p className="rounded-xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">Nenhum registro de presença nesta turma.</p>}
  </div>;
}
