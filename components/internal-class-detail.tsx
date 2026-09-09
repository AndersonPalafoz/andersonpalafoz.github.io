"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, CalendarDays, CheckCircle2, ClipboardCheck, Edit3, GraduationCap, Loader2, Trash2, Users, X } from "lucide-react";
import { InternalClassAttendancePanel } from "@/components/internal-class-attendance-panel";
import { InternalClassActivitiesPanel } from "@/components/internal-class-activities-panel";

type Student = { id: number; name: string | null; email: string | null };
type Session = { id: number; title: string; description?: string | null; scheduledAt: string | Date; durationMinutes?: number | null; status: string };
type Summary = { sessions: Session[]; activities: Array<{ id: number; title: string; description?: string | null; dueDate: string | Date | null }>; attendances: Array<{ id: number; sessionId: number; studentId: number; status: string; notes?: string | null }>; averageProgress: number; attendanceRate: number; completedActivities: number; totalActivities: number };
type Props = { offer: { id?: number; offerName: string; academicTerm: string; institution: string | null; status: string; modality: string | null; classDays: string | null; classTime: string | null }; course: { title: string; level: string } | null; students: Student[]; role: string };

const tabs = [
  { id: "overview", label: "Visão geral", icon: Activity }, { id: "students", label: "Alunos", icon: Users }, { id: "sessions", label: "Sessões", icon: CalendarDays },
  { id: "attendance", label: "Presença", icon: ClipboardCheck }, { id: "activities", label: "Atividades", icon: GraduationCap }, { id: "progress", label: "Progresso", icon: CheckCircle2 },
] as const;

export function InternalClassDetail({ offer, course, students, role }: Props) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("overview");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  async function loadSummary(signal?: AbortSignal) {
    if (!offer.id || signal?.aborted) return;
    setSummaryLoading(true);
    try {
      const response = await fetch(`/api/course-offers/${offer.id}/academic-summary`, { cache: "no-store", signal });
      if (!response.ok) throw new Error("Não foi possível carregar o resumo acadêmico.");
      const data = await response.json();
      if (!signal?.aborted) setSummary(data);
    } catch {
      if (!signal?.aborted) setSummary(null);
    } finally {
      if (!signal?.aborted) setSummaryLoading(false);
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => { void loadSummary(controller.signal); }, 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [offer.id]);
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [removingStudentId, setRemovingStudentId] = useState<number | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [savingSession, setSavingSession] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<number | null>(null);
  const [editError, setEditError] = useState("");
  const [form, setForm] = useState({ offerName: offer.offerName, academicTerm: offer.academicTerm, modality: offer.modality ?? "Remota", classDays: offer.classDays ?? "", classTime: offer.classTime ?? "", status: offer.status });
  const statusLabel = offer.status === "published" ? "Publicada" : offer.status === "archived" ? "Arquivada" : "Rascunho";
  async function saveOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!offer.id) return;
    setSaving(true); setEditError("");
    try { const response = await fetch(`/api/course-offers/${offer.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Não foi possível atualizar a turma."); setEditing(false); router.refresh(); } catch (error) { setEditError(error instanceof Error ? error.message : "Não foi possível atualizar a turma."); } finally { setSaving(false); }
  }
  async function deleteOffer() {
    if (!offer.id || !window.confirm("Arquivar esta turma? Os registros acadêmicos serão preservados e a turma deixará de aparecer na lista ativa.")) return;
    setDeleting(true); setEditError("");
    try { const response = await fetch(`/api/course-offers/${offer.id}`, { method: "DELETE" }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Não foi possível arquivar a turma."); router.push("/professor/turmas-internas"); router.refresh(); } catch (error) { setEditError(error instanceof Error ? error.message : "Não foi possível arquivar a turma."); setDeleting(false); }
  }
  async function removeStudent(studentId: number) {
    if (!offer.id || !window.confirm("Desvincular este aluno da turma? O histórico acadêmico será preservado.")) return;
    setRemovingStudentId(studentId); setEditError("");
    try {
      const response = await fetch(`/api/course-offers/${offer.id}/students`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível desvincular o aluno.");
      router.refresh();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Não foi possível desvincular o aluno.");
    } finally {
      setRemovingStudentId(null);
    }
  }
  async function refreshSummary() {
    await loadSummary();
  }

  async function saveSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!offer.id || !editingSession) return;
    const formData = new FormData(event.currentTarget);
    setSavingSession(true);
    setEditError("");
    try {
      const response = await fetch("/api/admin/sessions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingSession.id, offerId: offer.id, title: String(formData.get("title") || ""), description: String(formData.get("description") || ""), scheduledAt: String(formData.get("scheduledAt") || ""), durationMinutes: Number(formData.get("durationMinutes") || 60), status: String(formData.get("status") || "scheduled") }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível atualizar a sessão.");
      setEditingSession(null);
      const refreshed = await fetch(`/api/course-offers/${offer.id}/academic-summary`);
      if (refreshed.ok) setSummary(await refreshed.json());
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Não foi possível atualizar a sessão.");
    } finally {
      setSavingSession(false);
    }
  }

  async function deleteSession(session: Session) {
    if (!offer.id || !window.confirm(`Excluir a sessão “${session.title}”? Os registros de presença associados também serão removidos.`)) return;
    setDeletingSessionId(session.id);
    setEditError("");
    try {
      const response = await fetch("/api/admin/sessions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: session.id, offerId: offer.id }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível excluir a sessão.");
      const refreshed = await fetch(`/api/course-offers/${offer.id}/academic-summary`);
      if (refreshed.ok) setSummary(await refreshed.json());
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Não foi possível excluir a sessão.");
    } finally {
      setDeletingSessionId(null);
    }
  }

  const sessions = summary?.sessions ?? [];
  const attendances = summary?.attendances ?? [];
  const attendanceCounts = attendances.reduce((counts, attendance) => ({ ...counts, [attendance.status]: (counts[attendance.status] ?? 0) + 1 }), {} as Record<string, number>);
  const sessionStatusLabel = (status: string) => status === "completed" ? "Concluída" : status === "cancelled" ? "Cancelada" : status === "in_progress" ? "Em andamento" : "Agendada";
  const metrics = [{ label: "Progresso médio", value: `${summary?.averageProgress ?? 0}%` }, { label: "Presença", value: `${summary?.attendanceRate ?? 0}%` }, { label: "Atividades concluídas", value: `${summary?.completedActivities ?? 0}/${summary?.totalActivities ?? 0}` }];
  return <div className="flex flex-col gap-5">
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-red-600">{course?.level ?? "Curso interno"} · {offer.academicTerm}</p><h1 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">{offer.offerName}</h1><p className="mt-2 text-sm text-muted-foreground">{course?.title ?? "Curso não informado"}{offer.institution ? ` · ${offer.institution}` : ""}</p></div><div className="flex flex-wrap items-center gap-2"><span className="w-fit rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{statusLabel}</span><button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-bold text-foreground hover:bg-muted"><Edit3 size={15} aria-hidden="true" />Editar</button><button type="button" onClick={deleteOffer} disabled={deleting} className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 px-3 py-2 text-sm font-bold text-destructive hover:bg-destructive/10 disabled:opacity-60">{deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} aria-hidden="true" />}Arquivar</button></div></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{metrics.map((metric) => <div key={metric.label} className="rounded-2xl bg-muted/50 p-4"><p className="text-xs font-semibold text-muted-foreground">{metric.label}</p><p className="mt-1 text-2xl font-black text-foreground">{metric.value}</p></div>)}</div></div>
    <div className="overflow-x-auto rounded-2xl border border-border bg-card p-2 shadow-sm"><div className="flex min-w-max gap-1" role="tablist" aria-label="Seções da turma">{tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${activeTab === id ? "bg-red-600 text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><Icon size={16} aria-hidden="true" />{label}</button>)}</div></div>
    {activeTab === "attendance" && offer.id && <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6" role="tabpanel"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-xl font-black text-foreground">Presença</h2><p className="mt-1 text-sm text-muted-foreground">Registros persistidos por aluno e sessão, com edição e exclusão protegidas.</p></div>{summaryLoading && <Loader2 className="animate-spin text-red-600" size={20} aria-label="Carregando presença" />}</div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/20"><p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Presentes</p><p className="mt-1 text-2xl font-black text-emerald-800 dark:text-emerald-200">{attendanceCounts.present ?? 0}</p></div><div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/20"><p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">Justificadas</p><p className="mt-1 text-2xl font-black text-amber-800 dark:text-amber-200">{attendanceCounts.justified ?? 0}</p></div><div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/20"><p className="text-xs font-bold uppercase tracking-wide text-red-700 dark:text-red-300">Ausentes</p><p className="mt-1 text-2xl font-black text-red-800 dark:text-red-200">{attendanceCounts.absent ?? 0}</p></div></div>{summaryLoading && !summary ? <div className="mt-5 rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">Carregando registros de presença…</div> : <InternalClassAttendancePanel offerId={offer.id} sessions={sessions} students={students} attendances={attendances} onChanged={refreshSummary} />}</section>}
    <section className={`rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 ${activeTab === "attendance" ? "hidden" : ""}`} role="tabpanel"><h2 className="text-xl font-black text-foreground">{tabs.find((tab) => tab.id === activeTab)?.label}</h2>{activeTab === "students" ? <div className="mt-5 divide-y divide-border">{students.length ? students.map((student) => <div key={student.id} className="flex items-center justify-between gap-4 py-3"><div><p className="font-bold text-foreground">{student.name || "Aluno sem nome"}</p><p className="text-sm text-muted-foreground">{student.email || "E-mail não informado"}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">Ativo</span><button type="button" onClick={() => void removeStudent(student.id)} disabled={removingStudentId === student.id} className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-2 py-1 text-xs font-bold text-destructive hover:bg-destructive/10 disabled:opacity-60" aria-label={`Desvincular ${student.name || "aluno"}`}>{removingStudentId === student.id ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : <Trash2 size={13} aria-hidden="true" />}Desvincular</button></div></div>) : <p className="py-8 text-sm text-muted-foreground">Nenhum aluno vinculado ainda.</p>}</div> : activeTab === "sessions" ? <div className="mt-5 flex flex-col gap-3">{summaryLoading && !summary ? <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">Carregando sessões…</div> : sessions.length ? sessions.map((session) => <div key={session.id} className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-foreground">{session.title}</p><p className="text-sm text-muted-foreground">{new Date(session.scheduledAt).toLocaleDateString("pt-BR", { dateStyle: "full" })} · {new Date(session.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · {session.durationMinutes ?? 60} min · {sessionStatusLabel(session.status)}</p>{session.description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{session.description}</p>}</div><div className="flex items-center gap-2"><button type="button" onClick={() => setEditingSession(session)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-bold text-foreground hover:bg-muted"><Edit3 size={13} aria-hidden="true" />Editar</button><button type="button" onClick={() => void deleteSession(session)} disabled={deletingSessionId === session.id} className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-2 py-1 text-xs font-bold text-destructive hover:bg-destructive/10 disabled:opacity-60"><Trash2 size={13} aria-hidden="true" />{deletingSessionId === session.id ? "Excluindo" : "Excluir"}</button></div></div>) : <p className="py-8 text-sm text-muted-foreground">Nenhuma sessão registrada.</p>}</div> : <><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{activeTab === "overview" ? "Acompanhe a operação da turma com dados acadêmicos reais." : "Os registros desta seção são carregados a partir dos vínculos acadêmicos existentes."}</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{metrics.map((metric) => <div key={metric.label} className="rounded-2xl border border-dashed border-border p-4"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{metric.label}</p><p className="mt-2 text-2xl font-black text-foreground">{metric.value}</p></div>)}</div><p className="mt-5 text-xs font-semibold text-muted-foreground">Acesso: {role === "admin" ? "administrador" : "professor responsável"}.</p></>}</section>    {activeTab === "activities" && <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6" role="tabpanel"><h2 className="text-xl font-black text-foreground">Atividades</h2><InternalClassActivitiesPanel activities={summary?.activities ?? []} onChanged={refreshSummary} /></section>}

    {editingSession && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setEditingSession(null)}><form onSubmit={saveSession} className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="edit-session-title"><div className="flex items-start justify-between gap-4"><div><h2 id="edit-session-title" className="text-xl font-black text-foreground">Editar sessão</h2><p className="mt-1 text-sm text-muted-foreground">Atualize os dados desta sessão da turma.</p></div><button type="button" onClick={() => setEditingSession(null)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Fechar edição da sessão"><X size={18} /></button></div><div className="mt-6 grid gap-4"><label className="grid gap-1.5 text-sm font-semibold text-foreground">Título<input name="title" required defaultValue={editingSession.title} className="rounded-xl border border-border bg-background px-3 py-2.5 font-normal" /></label><label className="grid gap-1.5 text-sm font-semibold text-foreground">Descrição<textarea name="description" defaultValue={editingSession.description ?? ""} className="min-h-24 rounded-xl border border-border bg-background px-3 py-2.5 font-normal" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-semibold text-foreground">Data e hora<input name="scheduledAt" type="datetime-local" required defaultValue={new Date(editingSession.scheduledAt).toISOString().slice(0, 16)} className="rounded-xl border border-border bg-background px-3 py-2.5 font-normal" /></label><label className="grid gap-1.5 text-sm font-semibold text-foreground">Duração (minutos)<input name="durationMinutes" type="number" min="1" required defaultValue={editingSession.durationMinutes ?? 60} className="rounded-xl border border-border bg-background px-3 py-2.5 font-normal" /></label></div><label className="grid gap-1.5 text-sm font-semibold text-foreground">Status<select name="status" defaultValue={editingSession.status} className="rounded-xl border border-border bg-background px-3 py-2.5 font-normal"><option value="scheduled">Agendada</option><option value="completed">Concluída</option><option value="cancelled">Cancelada</option></select></label></div>{editError && <p className="mt-4 text-sm font-semibold text-destructive">{editError}</p>}<div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setEditingSession(null)} className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-foreground hover:bg-muted">Cancelar</button><button type="submit" disabled={savingSession} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{savingSession ? "Salvando..." : "Salvar sessão"}</button></div></form></div>}
    {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setEditing(false)}><form onSubmit={saveOffer} className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="edit-internal-class-title"><div className="flex items-start justify-between gap-4"><div><h2 id="edit-internal-class-title" className="text-xl font-black text-foreground">Editar turma interna</h2><p className="mt-1 text-sm text-muted-foreground">Atualize os dados operacionais desta turma.</p></div><button type="button" onClick={() => setEditing(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Fechar edição"><X size={18} /></button></div><div className="mt-6 grid gap-4"><label className="grid gap-1.5 text-sm font-semibold text-foreground">Nome<input required value={form.offerName} onChange={(event) => setForm({ ...form, offerName: event.target.value })} className="rounded-xl border border-border bg-background px-3 py-2.5 font-normal" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-semibold text-foreground">Período<input required value={form.academicTerm} onChange={(event) => setForm({ ...form, academicTerm: event.target.value })} className="rounded-xl border border-border bg-background px-3 py-2.5 font-normal" /></label><label className="grid gap-1.5 text-sm font-semibold text-foreground">Modalidade<select value={form.modality} onChange={(event) => setForm({ ...form, modality: event.target.value })} className="rounded-xl border border-border bg-background px-3 py-2.5 font-normal"><option>Remota</option><option>Presencial</option><option>Híbrida</option></select></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-semibold text-foreground">Dias<input value={form.classDays} onChange={(event) => setForm({ ...form, classDays: event.target.value })} placeholder="Segundas e quartas" className="rounded-xl border border-border bg-background px-3 py-2.5 font-normal" /></label><label className="grid gap-1.5 text-sm font-semibold text-foreground">Horário<input value={form.classTime} onChange={(event) => setForm({ ...form, classTime: event.target.value })} placeholder="19h às 21h" className="rounded-xl border border-border bg-background px-3 py-2.5 font-normal" /></label></div><label className="grid gap-1.5 text-sm font-semibold text-foreground">Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="rounded-xl border border-border bg-background px-3 py-2.5 font-normal"><option value="draft">Rascunho</option><option value="published">Publicada</option><option value="archived">Arquivada</option></select></label>{editError && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{editError}</p>}</div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setEditing(false)} className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground">Cancelar</button><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving && <Loader2 size={16} className="animate-spin" />}Salvar alterações</button></div></form></div>}
  </div>;
}
