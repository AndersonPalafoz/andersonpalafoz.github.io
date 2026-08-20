"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, MoreVertical, Edit2, Trash2, Eye, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Course {
  id: number;
  title: string;
  level: string;
  category?: string | null;
  modules?: number;
}

export function ProfessorCoursesList({ initialCourses }: { initialCourses: Course[] }) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [visibleCount, setVisibleCount] = useState(4);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id?: number; title?: string }>({
    isOpen: false,
  });

  const paginatedCourses = useMemo(() => {
    return courses.slice(0, visibleCount);
  }, [courses, visibleCount]);

  const handleSoftDelete = async (id: number, title: string) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/admin/courses?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao mover para a lixeira.");
      
      const removedCourse = courses.find((c) => c.id === id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      setOpenMenuId(null);

      // Toast com opção de desfazer
      toast.success(`Curso "${title}" enviado para a lixeira.`, {
        action: {
          label: "Desfazer",
          onClick: async () => {
            try {
              const restoreRes = await fetch(`/api/admin/courses?id=${id}&restore=true`, { method: "DELETE" });
              if (!restoreRes.ok) throw new Error("Falha ao desfazer ação.");
              if (removedCourse) {
                setCourses((prev) => [removedCourse, ...prev]);
              }
              toast.success(`Curso "${title}" restaurado com sucesso!`);
            } catch {
              toast.error("Erro ao desfazer ação.");
            }
          },
        },
        duration: 6000,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao mover curso para lixeira.");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteModal.id) return;
    const { id, title } = deleteModal;
    setDeleteModal({ isOpen: false });
    try {
      setActionLoading(id);
      const res = await fetch(`/api/admin/courses?id=${id}&permanent=true`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir permanentemente o curso.");
      setCourses((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Curso "${title}" excluído permanentemente do sistema.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir permanentemente.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="surface-card space-y-6 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-foreground flex items-center gap-2">
          Cursos <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">({courses.length})</span>
        </h2>
        <Link href="/admin/cursos" className="text-red-600 hover:text-red-700 font-bold text-xs sm:text-sm flex items-center gap-1">
          Gerenciar <ArrowRight size={16} />
        </Link>
      </div>

      <div className="space-y-3">
        {courses.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">Nenhum curso cadastrado ainda.</p>
        ) : (
          paginatedCourses.map((course) => {
            const isMenuOpen = openMenuId === course.id;
            return (
              <div key={course.id} className="relative rounded-2xl border border-border/70 bg-muted/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:border-red-200">
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base">{course.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Nível <span className="font-extrabold text-foreground">{course.level}</span> {course.category ? `• ${course.category}` : ""} {course.modules !== undefined ? `• ${course.modules} módulos` : ""}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link
                    href={`/cursos/${course.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold px-3.5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition shadow-sm"
                  >
                    <Eye size={13} /> Ver
                  </Link>

                  {/* Menu de Ações Rápidas */}
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOpenMenuId(isMenuOpen ? null : course.id)}
                      className="h-9 w-9 p-0 rounded-xl border-border hover:bg-muted"
                      aria-label="Ações rápidas"
                    >
                      <MoreVertical size={16} />
                    </Button>

                    {isMenuOpen && (
                      <div className="absolute right-0 top-11 z-20 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl space-y-1 animate-in fade-in zoom-in-95">
                        <Link
                          href={`/admin/cursos?edit=${course.id}`}
                          onClick={() => setOpenMenuId(null)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-foreground hover:bg-muted rounded-xl transition"
                        >
                          <Edit2 size={13} className="text-blue-600" /> Editar Detalhes e Links
                        </Link>
                        <button
                          onClick={() => void handleSoftDelete(course.id, course.title)}
                          disabled={actionLoading === course.id}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition text-left"
                        >
                          {actionLoading === course.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Enviar para Lixeira
                        </button>
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            setDeleteModal({ isOpen: true, id: course.id, title: course.title });
                          }}
                          disabled={actionLoading === course.id}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition text-left border-t border-border mt-1 pt-2"
                        >
                          <Trash2 size={13} /> Excluir Definitivamente
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {visibleCount < courses.length && (
          <div className="pt-2 text-center">
            <Button
              variant="outline"
              onClick={() => setVisibleCount((prev) => prev + 4)}
              className="rounded-xl text-xs font-bold border-border hover:bg-muted w-full sm:w-auto"
            >
              Carregar Mais Cursos ({courses.length - visibleCount} restantes)
            </Button>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão Definitiva */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 font-sans animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle size={28} />
              <h3 className="text-lg font-black text-foreground">Exclusão Definitiva de Curso</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tem certeza absoluta que deseja excluir permanentemente o curso <strong className="text-foreground">"{deleteModal.title}"</strong>? Esta ação apagará todos os dados associados do banco de dados e não poderá ser desfeita.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setDeleteModal({ isOpen: false })}
                className="rounded-xl text-xs font-bold"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => void handlePermanentDelete()}
                className="rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white gap-1"
              >
                <Trash2 size={14} /> Sim, Excluir Definitivamente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
