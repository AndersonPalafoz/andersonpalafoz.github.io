"use client";

import { useState } from "react";
import { Edit3, Loader2, Trash2 } from "lucide-react";

type Attendance = { id: number; sessionId: number; studentId: number; status: string; notes?: string | null };
type Session = { id: number; title: string; scheduledAt: string | Date };
type Student = { id: number; name: string | null; email: string | null };

type Props = { offerId: number; sessions: Session[]; students: Student[]; attendances: Attendance[]; onChanged: () => Promise<void> };

export function InternalClassAttendancePanel({ offerId, sessions, students, attendances, onChanged }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

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
    {error && <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{error}</p>}
    {attendances.length ? attendances.map((attendance) => {
      const student = students.find((item) => item.id === attendance.studentId);
      const session = sessions.find((item) => item.id === attendance.sessionId);
      const label = attendance.status === "present" ? "Presente" : attendance.status === "justified" ? "Justificada" : "Ausente";
      return <div key={attendance.id} className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-foreground">{student?.name || "Aluno não identificado"}</p><p className="text-sm text-muted-foreground">{session?.title || "Sessão não identificada"} · {session ? new Date(session.scheduledAt).toLocaleDateString("pt-BR") : ""}</p></div><div className="flex flex-wrap items-center gap-2">{editingId === attendance.id ? <select autoFocus value={attendance.status} onChange={(event) => void updateAttendance(attendance, event.target.value)} disabled={savingId === attendance.id} className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-bold"><option value="present">Presente</option><option value="absent">Ausente</option><option value="justified">Justificada</option></select> : <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">{label}</span>}<button type="button" onClick={() => setEditingId(attendance.id)} disabled={savingId === attendance.id} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-bold text-foreground hover:bg-muted"><Edit3 size={13} aria-hidden="true" />Editar</button><button type="button" onClick={() => void deleteAttendance(attendance)} disabled={deletingId === attendance.id} className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-2 py-1 text-xs font-bold text-destructive hover:bg-destructive/10 disabled:opacity-60">{deletingId === attendance.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} aria-hidden="true" />}Excluir</button></div></div>;
    }) : <p className="rounded-xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">Nenhum registro de presença nesta turma.</p>}
  </div>;
}
