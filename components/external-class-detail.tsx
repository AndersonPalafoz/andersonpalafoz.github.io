"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, CalendarCheck, FileText, Loader2, RefreshCw, Save, Users } from "lucide-react";
import { ExternalAcademicEditor, ExternalStudentCreateForm } from "@/components/external-academic-editor";

type Student = { id: number; name: string; email?: string | null; status?: string | null; lastSignedIn?: string | null };
type AttendanceEntry = { status: string; justification?: string; note?: string };
type AttendanceRow = { id: number; date: string; attendanceData: string };
type AttendanceDraft = Record<string, AttendanceEntry>;
type GradeRow = { id: number; studentId: number; assessmentTitle: string; assessmentType?: string | null; assessmentVersion?: string | null; assessmentComponent?: string | null; score: string; maxScore: string; assessmentDate?: string | null; unitNumber?: number | null; feedback?: string | null };
type ClassData = { id: number; className: string; institution?: string | null; courseName?: string | null; academicTerm?: string | null; students?: Student[]; attendance?: AttendanceRow[]; grades?: GradeRow[]; materials?: Array<{ id: number; title?: string | null; description?: string | null }>; stats?: { total: number; active: number; completed: number } };
type Tab = "students" | "attendance" | "grades" | "materials";

type AttendanceCell = { studentId: number; status: string };

function parseAttendance(row: AttendanceRow): AttendanceCell[] {
  try {
    const values = JSON.parse(row.attendanceData || "{}");
    return Object.entries(values).map(([studentId, value]) => ({
      studentId: Number(studentId),
      status: typeof value === "string" ? value : String((value as AttendanceEntry).status || "present"),
    }));
  } catch {
    return [];
  }
}

function parseAttendanceDraft(row: AttendanceRow | undefined): AttendanceDraft {
  if (!row) return {};
  try {
    const values = JSON.parse(row.attendanceData || "{}");
    return Object.fromEntries(Object.entries(values).map(([studentId, value]) => [studentId, typeof value === "string" ? { status: value } : value as AttendanceEntry])) as AttendanceDraft;
  } catch { return {}; }
}

export function ExternalClassDetail({ id }: { id: string }) {
  const [data, setData] = useState<ClassData | null>(null);
  const [tab, setTab] = useState<Tab>("grades");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [attendanceDraft, setAttendanceDraft] = useState<AttendanceDraft>({});
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeRow | null>(null);
  const [gradeDraft, setGradeDraft] = useState({ title: "", score: "" });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/professor/external-classes", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível carregar a turma.");
      const found = (payload.classes || []).find((item: ClassData) => item.id === Number(id));
      if (!found) throw new Error("Turma não encontrada ou sem permissão de acesso.");
      setData(found);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar a turma.");
    } finally {
      setLoading(false);
    }
  };

  // A turma é recarregada quando o identificador muda ou após um lançamento salvo.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [id]);

  const students = useMemo(() => data?.students || [], [data]);
  const grades = useMemo(() => data?.grades || [], [data]);
  const attendance = useMemo(() => data?.attendance || [], [data]);
  const attendanceSummary = useMemo(() => {
    const cells = attendance.flatMap(parseAttendance);
    const present = cells.filter((cell) => cell.status === "present" || cell.status === "late").length;
    return { records: attendance.length, present, total: cells.length, rate: cells.length ? Math.round((present / cells.length) * 100) : 0 };
  }, [attendance]);
  const gradesByStudent = useMemo(() => {
    const grouped = new Map<number, GradeRow[]>();
    for (const student of students) grouped.set(student.id, []);
    for (const grade of grades) {
      const studentId = Number(grade.studentId);
      const records = grouped.get(studentId);
      if (records) records.push(grade);
    }
    return grouped;
  }, [students, grades]);
  const gradeStudents = useMemo(() => {
    const knownIds = new Set(students.map((student) => student.id));
    const unmatched = grades.filter((grade) => !knownIds.has(Number(grade.studentId))).map((grade) => ({ id: Number(grade.studentId), name: `Aluno ${grade.studentId}`, email: null, status: "legacy" }));
    return [...students, ...unmatched.filter((student, index, rows) => rows.findIndex((candidate) => candidate.id === student.id) === index)];
  }, [students, grades]);
  const gradeComponentLabel = (component?: string | null) => ({
    grammar: "Grammar",
    reading: "Reading",
    writing: "Writing",
    listening: "Listening",
    speaking: "Speaking",
    presentation: "Apresentação sobre a Copa do Mundo",
    total: "Total da prova",
  }[component || ""] || component || "Avaliação");
  const editGrade = (grade: GradeRow) => { setEditingGrade(grade); setGradeDraft({ title: grade.assessmentTitle, score: grade.score }); };
  const cancelGradeEdit = () => { setEditingGrade(null); setGradeDraft({ title: "", score: "" }); };
  const saveGradeEdit = async () => {
    if (!editingGrade || !gradeDraft.title.trim() || !gradeDraft.score.trim()) return;
    const response = await fetch("/api/professor/external-classes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "updateGrade", gradeId: editingGrade.id, assessmentTitle: gradeDraft.title, score: gradeDraft.score, maxScore: editingGrade.maxScore, assessmentType: editingGrade.assessmentType, assessmentVersion: editingGrade.assessmentVersion, assessmentComponent: editingGrade.assessmentComponent, assessmentDate: editingGrade.assessmentDate, unitNumber: editingGrade.unitNumber, feedback: editingGrade.feedback, classId: Number(id) }) });
    if (!response.ok) { const payload = await response.json(); window.alert(payload.error || "Não foi possível atualizar a nota."); return; }
    cancelGradeEdit(); await load();
  };
  const openAttendanceEditor = (row?: AttendanceRow) => {
    setAttendanceDate(row?.date || new Date().toISOString().slice(0, 10));
    const parsed = parseAttendanceDraft(row);
    setAttendanceDraft(Object.fromEntries(students.map((student) => [String(student.id), { ...(parsed[String(student.id)] || {}), status: parsed[String(student.id)]?.status || "present" }])) as AttendanceDraft);
    setTab("attendance");
  };
  const updateAttendanceEntry = (studentId: number, field: keyof AttendanceEntry, value: string) => {
    setAttendanceDraft((current) => ({ ...current, [String(studentId)]: { ...current[String(studentId)], status: current[String(studentId)]?.status || "present", [field]: value } }));
  };
  const cancelAttendanceEditor = () => {
    setAttendanceDraft({});
    setAttendanceDate("");
  };
  const saveAttendanceTable = async () => {
    if (!attendanceDate) return;
    setSavingAttendance(true);
    try {
      const response = await fetch("/api/professor/external-classes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "saveAttendance", classId: Number(id), date: attendanceDate, attendanceData: attendanceDraft }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível salvar a frequência.");
      await load();
      setAttendanceDraft({});
    } catch (cause) { window.alert(cause instanceof Error ? cause.message : "Não foi possível salvar a frequência."); }
    finally { setSavingAttendance(false); }
  };

  if (loading) return <section className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground"><Loader2 className="mx-auto mb-3 animate-spin" />Carregando dados da turma...</section>;
  if (error || !data) return <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700" role="alert">{error || "Turma não encontrada."}<button onClick={() => void load()} className="ml-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold"><RefreshCw size={14} /> Tentar novamente</button></section>;

  const tabs: Array<{ id: Tab; label: string; count: number; icon: typeof Users }> = [
    { id: "students", label: "Alunos", count: students.length, icon: Users },
    { id: "attendance", label: "Frequência", count: attendanceSummary.records, icon: CalendarCheck },
    { id: "grades", label: "Notas SIMAL", count: grades.length, icon: FileText },
    { id: "materials", label: "Materiais", count: data.materials?.length || 0, icon: BookOpen },
  ];

  return <section className="space-y-5">
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between">
      <div><Link href="/professor/turmas-externas/gerenciar" className="mb-3 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-red-600"><ArrowLeft size={14} /> Voltar para turmas</Link><p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">{data.institution || "Turma externa"}</p><h2 className="mt-1 text-2xl font-black">{data.className}</h2><p className="mt-1 text-sm text-muted-foreground">{data.courseName || "Curso não informado"} · {data.academicTerm || "Período não informado"}</p></div>
      <button onClick={() => void load()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border px-3 text-sm font-bold hover:bg-muted"><RefreshCw size={15} /> Atualizar</button>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{[["Alunos", students.length], ["Ativos", data.stats?.active || 0], ["Aulas lançadas", attendanceSummary.records], ["Frequência", `${attendanceSummary.rate}%`], ["Notas SIMAL", grades.length]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-border bg-card p-4"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>)}</div>
    <ExternalStudentCreateForm classId={data.id} onSaved={() => void load()} />
    <div className="overflow-hidden rounded-2xl border border-border bg-card"><div className="flex overflow-x-auto border-b border-border">{tabs.map(({ id: tabId, label, count, icon: Icon }) => <button key={tabId} onClick={() => setTab(tabId)} className={`flex min-w-fit items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold ${tab === tabId ? "border-red-600 text-red-600" : "border-transparent text-muted-foreground hover:bg-muted"}`}><Icon size={16} /> {label} <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{count}</span></button>)}</div>
      <div className="p-5">
        {tab === "students" && <div className="divide-y divide-border">{students.map((student) => <div key={student.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-bold">{student.name}</p><p className="text-xs text-muted-foreground">{student.email || "Sem e-mail"}</p></div><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">{student.status || "active"}</span></div>)}</div>}
        {tab === "attendance" && <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-red-100 bg-red-50/60 p-4">
            <div><p className="text-sm font-black text-red-700">Lançamento em lote</p><p className="text-xs text-muted-foreground">Edite presença, justificativa e anotação de todos os alunos de uma vez.</p></div>
            <button type="button" onClick={() => openAttendanceEditor()} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700"><CalendarCheck size={15} /> Nova chamada</button>
          </div>
          {attendanceDraft && Object.keys(attendanceDraft).length > 0 && <div className="overflow-hidden rounded-xl border border-border"><div className="flex flex-wrap items-end gap-3 border-b border-border bg-muted/40 p-4"><label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Data<input type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} className="mt-1 block rounded-lg border border-border bg-background px-3 py-2 text-sm" /></label><div className="flex gap-2"><button type="button" disabled={savingAttendance} onClick={() => void saveAttendanceTable()} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"><Save size={15} /> {savingAttendance ? "Salvando..." : "Salvar chamada"}</button><button type="button" disabled={savingAttendance} onClick={cancelAttendanceEditor} className="rounded-lg border border-border px-4 py-2 text-sm font-bold hover:bg-background disabled:opacity-60">Cancelar criação</button></div></div><div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-sm"><thead className="bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="p-3">Aluno</th><th className="p-3">Status</th><th className="p-3">Justificativa</th><th className="p-3">Anotação</th></tr></thead><tbody className="divide-y divide-border">{students.map((student) => { const entry = attendanceDraft[String(student.id)] || { status: "present" }; return <tr key={student.id}><td className="p-3 font-bold">{student.name}</td><td className="p-3"><select value={entry.status} onChange={(event) => updateAttendanceEntry(student.id, "status", event.target.value)} className="rounded-lg border border-border bg-background px-2 py-2"><option value="present">Presente</option><option value="absent">Ausente</option><option value="late">Atrasado</option><option value="excused">Justificado</option></select></td><td className="p-3"><input value={entry.justification || ""} onChange={(event) => updateAttendanceEntry(student.id, "justification", event.target.value)} placeholder="Motivo / documento" className="w-full min-w-44 rounded-lg border border-border bg-background px-3 py-2" /></td><td className="p-3"><input value={entry.note || ""} onChange={(event) => updateAttendanceEntry(student.id, "note", event.target.value)} placeholder="Observação" className="w-full min-w-44 rounded-lg border border-border bg-background px-3 py-2" /></td></tr>; })}</tbody></table></div></div>}
          <div className="space-y-3">{attendance.length ? attendance.map((row) => { const cells = parseAttendance(row); const absences = cells.filter((cell) => cell.status === "absent").length; return <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"><div><p className="font-bold">{new Date(`${row.date}T12:00:00`).toLocaleDateString("pt-BR")}</p><p className="text-xs text-muted-foreground">{cells.length} registros lançados</p></div><div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold ${absences ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{absences} ausência(s)</span><button type="button" onClick={() => openAttendanceEditor(row)} className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold hover:bg-muted">Editar tabela</button></div></div>; }) : <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Nenhuma chamada cadastrada.</p>}</div>
        </div>}
        {tab === "grades" && <div className="space-y-5">{grades.length ? gradeStudents.map((student) => { const records = gradesByStudent.get(student.id) || []; if (!records.length) return null; return <div key={student.id} className="rounded-xl border border-border p-4"><div className="mb-3 flex items-center justify-between gap-3"><div><p className="font-black">{student.name}</p><p className="text-xs text-muted-foreground">{records.length} lançamento(s)</p></div><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">SIMAL</span></div><div className="grid gap-2 sm:grid-cols-2">{records.map((grade) => <div key={grade.id} className="rounded-lg bg-muted/50 p-3"><div className="flex justify-between gap-3"><p className="text-sm font-bold">{grade.assessmentTitle}</p><p className="text-sm font-black text-red-600">{grade.score}/{grade.maxScore}</p></div><p className="mt-1 text-xs text-muted-foreground">{gradeComponentLabel(grade.assessmentComponent)}{grade.assessmentVersion ? ` · Versão ${grade.assessmentVersion}` : ""}{grade.unitNumber ? ` · Unidade ${grade.unitNumber}` : ""}{grade.assessmentDate ? ` · ${new Date(`${grade.assessmentDate}T12:00:00`).toLocaleDateString("pt-BR")}` : ""}</p>{editingGrade?.id === grade.id ? <div className="mt-3 grid gap-2 sm:grid-cols-2"><input value={gradeDraft.title} onChange={(event) => setGradeDraft((current) => ({ ...current, title: event.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" aria-label="Título da nota" /><input value={gradeDraft.score} onChange={(event) => setGradeDraft((current) => ({ ...current, score: event.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" aria-label="Nota" /><div className="flex gap-2 sm:col-span-2"><button type="button" onClick={() => void saveGradeEdit()} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white">Salvar alteração</button><button type="button" onClick={cancelGradeEdit} className="rounded-lg border border-border px-3 py-2 text-xs font-bold hover:bg-background">Cancelar / reverter</button></div></div> : <button type="button" onClick={() => editGrade(grade)} className="mt-3 rounded-lg border border-border px-2.5 py-1 text-xs font-bold hover:bg-background">Editar nota</button>}</div>)}</div></div>; }) : <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Nenhuma nota SIMAL encontrada para esta turma.</p>}<ExternalAcademicEditor classId={data.id} students={students} onSaved={() => void load()} /></div>}
        {tab === "materials" && <div className="space-y-3">{data.materials?.length ? data.materials.map((material) => <div key={material.id} className="rounded-xl border border-border p-4"><p className="font-bold">{material.title}</p><p className="text-sm text-muted-foreground">{material.description || "Material da turma"}</p></div>) : <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Nenhum material cadastrado.</p>}</div>}
      </div>
    </div>
  </section>;
}
