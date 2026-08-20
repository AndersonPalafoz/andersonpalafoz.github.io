"use client";

import { useState } from "react";
import { Trash2, RotateCcw, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Course {
  id: number;
  title: string;
  level: string;
  category?: string | null;
  deletedAt?: string | null;
}

export function ProfessorCoursesTrashManager({ initialCourses }: { initialCourses: Course[] }) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [trash, setTrash] = useState<Course[]>([]);
  const [loadingTrash, setLoadingTrash] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "trash">("active");

  const loadTrash = async () => {
    try {
      setLoadingTrash(true);
      const res = await fetch("/api/admin/courses?mode=trash", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setTrash(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error("Erro ao carregar lixeira.");
    } finally {
      setLoadingTrash(false);
    }
  };

  const handleSoftDelete = async (id: number, title: string) => {
    if (!confirm(`Deseja enviar o curso "${title}" para a lixeira?`)) return;
    try {
      setActionLoading(id);
      const res = await fetch(`/api/admin/courses?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao enviar para a lixeira.");
      setCourses((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Curso "${title}" enviado para a lixeira com sucesso!`);
      void loadTrash();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao mover para a lixeira.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (id: number, title: string) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/admin/courses?id=${id}&restore=true`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao restaurar curso.");
      setTrash((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Curso "${title}" restaurado com sucesso!`);
      // Recarregar a página ou atualizar lista ativa
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao restaurar curso.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="surface-card p-6 sm:p-8 rounded-3xl border border-border/70 bg-card space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-black text-foreground">Gestão e Lixeira de Cursos</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Envie cursos inativos para a lixeira ou restaure-os quando necessário.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveTab("active"); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === "active" ? "bg-red-600 text-white shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            Cursos Ativos ({courses.length})
          </button>
          <button
            onClick={() => { setActiveTab("trash"); void loadTrash(); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "trash" ? "bg-red-600 text-white shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            <Trash2 size={13} /> Lixeira
          </button>
        </div>
      </div>

      {activeTab === "active" ? (
        <div className="space-y-3">
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Nenhum curso ativo encontrado.</p>
          ) : (
            courses.map((course) => (
              <div key={course.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-muted/30">
                <div>
                  <h3 className="font-bold text-foreground text-sm">{course.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Nível: <span className="font-semibold text-foreground">{course.level}</span> {course.category ? `• Categoria: ${course.category}` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleSoftDelete(course.id, course.title)}
                    disabled={actionLoading === course.id}
                    className="h-9 gap-1.5 text-xs font-bold border-border text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl"
                  >
                    {actionLoading === course.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Enviar para Lixeira
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {loadingTrash ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-red-600" size={24} /></div>
          ) : trash.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <AlertCircle size={32} className="mx-auto text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">A lixeira de cursos está vazia.</p>
            </div>
          ) : (
            trash.map((course) => (
              <div key={course.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-dashed border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/10">
                <div>
                  <h3 className="font-bold text-foreground text-sm line-through opacity-80">{course.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Nível: {course.level}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => void handleRestore(course.id, course.title)}
                    disabled={actionLoading === course.id}
                    className="h-9 gap-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm"
                  >
                    {actionLoading === course.id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Restaurar Curso
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
