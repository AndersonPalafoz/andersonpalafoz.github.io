"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Loader, Search, ShieldAlert, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface StudentOption {
  id: number;
  name: string | null;
  email: string | null;
  role: string;
  deletedAt: string | null;
}

interface NoteRecord {
  id: number;
  lessonId: number;
  note: string;
  createdAt: string;
  updatedAt: string;
  deletedByAdminAt: string | null;
  deletedByAdminEmail: string | null;
  lesson?: { title?: string | null } | null;
}

export default function AdminNotesPage() {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentsError, setStudentsError] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [studentLabel, setStudentLabel] = useState<string>("");
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notesError, setNotesError] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<NoteRecord | null>(null);

  useEffect(() => {
    fetch("/api/admin/notes/students")
      .then(async (r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { setStudents(data.students || []); setStudentsError(false); })
      .catch(() => { setStudentsError(true); toast.error("Não foi possível carregar a lista de alunos."); })
      .finally(() => setLoadingStudents(false));
  }, []);

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return students
      .filter((s) => `${s.name || ""} ${s.email || ""}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, students]);

  async function loadNotes(studentId: number, label: string) {
    setSelectedStudentId(studentId);
    setStudentLabel(label);
    setQuery("");
    setNotesError(false);
    setLoadingNotes(true);
    try {
      const res = await fetch(`/api/admin/notes?studentId=${studentId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNotes(data.notes || []);
    } catch {
      setNotesError(true);
      toast.error("Não foi possível carregar as anotações desse aluno.");
    } finally {
      setLoadingNotes(false);
    }
  }

  async function deleteNote(note: NoteRecord) {
    setDeletingId(note.id);
    try {
      const res = await fetch(`/api/admin/notes?id=${note.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível excluir a anotação.");
      setNotes((current) => current.map((item) => (item.id === note.id ? data.note : item)));
      setPendingDelete(null);
      toast.success("Anotação excluída. O aluno verá o aviso de exclusão administrativa.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível excluir a anotação.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="site-shell px-4 py-8 sm:px-6 lg:px-8">
      <div className="page-container space-y-8 pb-16">
                  <div>
            <Link href="/admin" className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400">
            <ArrowLeft size={14} /> Voltar ao Painel Admin
          </Link>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">Anotações dos Alunos</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Busque um aluno para consultar as anotações de aula. A remoção administrativa é registrada como soft delete:
              o aluno vê o aviso, enquanto o conteúdo original permanece restrito à auditoria.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="surface-card flex items-center gap-3 rounded-2xl p-4">
              <span className="rounded-xl bg-red-50 p-2.5 text-red-600 dark:bg-red-950/30 dark:text-red-400"><Users size={18} /></span>
              <div><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Alunos disponíveis</p><p className="text-xl font-black text-foreground">{students.length}</p></div>
            </div>
            <div className="surface-card flex items-center gap-3 rounded-2xl p-4">
              <span className="rounded-xl bg-amber-50 p-2.5 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"><ShieldAlert size={18} /></span>
              <div><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Área de auditoria</p><p className="text-sm font-bold text-foreground">Exclusões preservadas</p></div>
            </div>
          </div>

          <div className="surface-card space-y-4 rounded-3xl p-6 sm:p-8">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Buscar aluno</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nome ou e-mail do aluno..."
              disabled={loadingStudents}
              className="w-full rounded-2xl border border-border bg-background px-10 py-3 text-sm outline-none focus:border-red-500"
            />
          </div>
          {studentsError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">Não foi possível consultar os alunos agora. Atualize a página e tente novamente.</div>
          )}
          {!loadingStudents && !studentsError && query.trim() && filteredStudents.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">Nenhum aluno encontrado para “{query}”.</p>
          )}
          {filteredStudents.length > 0 && (
            <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
              {filteredStudents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => void loadNotes(s.id, s.name || s.email || `Aluno #${s.id}`)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-muted"
                >
                  <span className="font-semibold text-foreground">{s.name || "Sem nome"}</span>
                  <span className="text-xs text-muted-foreground">{s.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedStudentId && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Aluno selecionado</p><h2 className="text-lg font-black text-foreground">Anotações de {studentLabel}</h2></div>
              <button type="button" onClick={() => { setSelectedStudentId(null); setNotes([]); setStudentLabel(""); }} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"><X size={14} /> Limpar seleção</button>
            </div>
            {loadingNotes ? (
              <div className="grid gap-3 sm:grid-cols-2"><div className="h-36 animate-pulse rounded-2xl bg-muted" /><div className="h-36 animate-pulse rounded-2xl bg-muted" /></div>
            ) : notesError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">Não foi possível carregar as anotações. Selecione o aluno novamente ou atualize a página.</div>
            ) : notes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
                <FileText className="mx-auto mb-3 text-muted-foreground" />
                Este aluno ainda não possui anotações salvas.
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <article key={note.id} className="surface-card space-y-3 rounded-2xl p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-foreground">{note.lesson?.title || `Aula #${note.lessonId}`}</h3>
                        <p className="text-xs text-muted-foreground">
                          Atualizada em {new Date(note.updatedAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      {!note.deletedByAdminAt && (
                        <button
                          onClick={() => setPendingDelete(note)}
                          disabled={deletingId === note.id}
                          aria-label="Excluir anotação"
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          {deletingId === note.id ? <Loader className="animate-spin" size={14} /> : <Trash2 size={14} />}
                          Excluir
                        </button>
                      )}
                    </div>
                    {note.deletedByAdminAt ? (
                      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                        <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                        <span>
                          Excluída por um administrador ({note.deletedByAdminEmail}) em{" "}
                          {new Date(note.deletedByAdminAt).toLocaleString("pt-BR")}. Conteúdo original preservado apenas para auditoria.
                        </span>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap rounded-xl bg-muted/50 p-3 text-sm text-foreground">{note.note}</p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Excluir anotação do aluno?"
        description={`O aluno ${studentLabel || "selecionado"} verá um aviso de exclusão administrativa. O conteúdo original será preservado somente para auditoria.`}
        busy={Boolean(pendingDelete && deletingId === pendingDelete.id)}
        onCancel={() => { if (!deletingId) setPendingDelete(null); }}
        onConfirm={() => { if (pendingDelete) void deleteNote(pendingDelete); }}
      />
    </div>
  );
}
