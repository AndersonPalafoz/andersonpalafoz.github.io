"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Loader, Search, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
  const [query, setQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [studentLabel, setStudentLabel] = useState<string>("");
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/notes/students")
      .then(async (r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => setStudents(data.students || []))
      .catch(() => toast.error("Não foi possível carregar a lista de alunos."))
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
    setLoadingNotes(true);
    try {
      const res = await fetch(`/api/admin/notes?studentId=${studentId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNotes(data.notes || []);
    } catch {
      toast.error("Não foi possível carregar as anotações desse aluno.");
    } finally {
      setLoadingNotes(false);
    }
  }

  async function deleteNote(note: NoteRecord) {
    if (!window.confirm(`Excluir esta anotação de ${studentLabel}? O aluno verá um aviso de que ela foi excluída por um administrador.`)) return;
    setDeletingId(note.id);
    try {
      const res = await fetch(`/api/admin/notes?id=${note.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível excluir a anotação.");
      setNotes((current) => current.map((item) => (item.id === note.id ? data.note : item)));
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
            Busque um aluno para ver as anotações de aula dele. Excluir uma anotação por aqui preserva o texto original
            para fins de auditoria, mas o aluno passa a ver um aviso de que ela foi removida por um administrador.
          </p>
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
            <h2 className="text-lg font-black text-foreground">Anotações de {studentLabel}</h2>
            {loadingNotes ? (
              <div className="flex justify-center rounded-2xl border border-border bg-card p-12">
                <Loader className="animate-spin text-red-600" />
              </div>
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
                          onClick={() => void deleteNote(note)}
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
    </div>
  );
}
