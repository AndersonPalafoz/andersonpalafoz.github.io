"use client";

import { useState, useMemo } from "react";
import { Trash2, RotateCcw, AlertCircle, Loader2, Search, CheckSquare, Square, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  // Estados da lixeira avançada
  const [trashSearch, setTrashSearch] = useState("");
  const [trashLevelFilter, setTrashLevelFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; type: "single" | "batch"; permanent: boolean; id?: number; title?: string }>({
    isOpen: false,
    type: "single",
    permanent: false,
  });

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

  const executeConfirmedAction = async () => {
    const { type, permanent, id } = confirmModal;
    setConfirmModal({ isOpen: false, type: "single", permanent: false });

    try {
      if (type === "single" && id !== undefined) {
        setActionLoading(id);
        if (permanent) {
          const res = await fetch(`/api/admin/courses?id=${id}&permanent=true`, { method: "DELETE" });
          if (!res.ok) throw new Error("Falha ao excluir permanentemente.");
          setTrash((prev) => prev.filter((c) => c.id !== id));
          toast.success("Curso excluído permanentemente do sistema.");
        }
      } else if (type === "batch") {
        if (permanent) {
          await Promise.all(
            selectedIds.map(async (courseId) => {
              await fetch(`/api/admin/courses?id=${courseId}&permanent=true`, { method: "DELETE" });
            })
          );
          setTrash((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
          toast.success(`${selectedIds.length} cursos excluídos permanentemente.`);
        } else {
          await Promise.all(
            selectedIds.map(async (courseId) => {
              await fetch(`/api/admin/courses?id=${courseId}&restore=true`, { method: "DELETE" });
            })
          );
          toast.success(`${selectedIds.length} cursos restaurados com sucesso!`);
          window.location.reload();
        }
        setSelectedIds([]);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao executar ação em lote.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestoreSingle = async (id: number, title: string) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/admin/courses?id=${id}&restore=true`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao restaurar curso.");
      setTrash((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Curso "${title}" restaurado com sucesso!`);
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao restaurar curso.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredTrash = useMemo(() => {
    const query = trashSearch.trim().toLowerCase();
    return trash.filter((course) => {
      const matchLevel = trashLevelFilter === "all" || course.level === trashLevelFilter;
      if (!matchLevel) return false;
      if (!query) return true;
      return course.title.toLowerCase().includes(query) || (course.category && course.category.toLowerCase().includes(query));
    });
  }, [trash, trashSearch, trashLevelFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTrash.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTrash.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <div className="surface-card p-6 sm:p-8 rounded-3xl border border-border/70 bg-card space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-black text-foreground">Gestão e Lixeira de Cursos</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Envie cursos para a lixeira, restaure-os ou gerencie exclusões permanentes.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === "active" ? "bg-red-600 text-white shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            Cursos Ativos ({courses.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("trash");
              void loadTrash();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "trash" ? "bg-red-600 text-white shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            <Trash2 size={13} /> Lixeira ({trash.length})
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
        <div className="space-y-4">
          {/* Barra de Pesquisa e Filtros da Lixeira */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-muted/40 p-3 rounded-2xl border border-border">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Buscar na lixeira..."
                value={trashSearch}
                onChange={(e) => setTrashSearch(e.target.value)}
                className="pl-9 text-xs rounded-xl bg-background border-border"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={trashLevelFilter}
                onChange={(e) => setTrashLevelFilter(e.target.value)}
                className="text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground font-bold"
              >
                <option value="all">Todos os Níveis</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    onClick={() => setConfirmModal({ isOpen: true, type: "batch", permanent: false })}
                    className="h-9 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl gap-1"
                  >
                    <RotateCcw size={13} /> Restaurar ({selectedIds.length})
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setConfirmModal({ isOpen: true, type: "batch", permanent: true })}
                    className="h-9 text-xs font-bold rounded-xl gap-1"
                  >
                    <Trash2 size={13} /> Excluir ({selectedIds.length})
                  </Button>
                </div>
              )}
            </div>
          </div>

          {loadingTrash ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-red-600" size={24} /></div>
          ) : filteredTrash.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <AlertCircle size={32} className="mx-auto text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">Nenhum curso encontrado na lixeira para os filtros aplicados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground font-semibold">
                <button onClick={toggleSelectAll} className="flex items-center gap-1.5 hover:text-foreground">
                  {selectedIds.length === filteredTrash.length ? <CheckSquare size={16} className="text-red-600" /> : <Square size={16} />}
                  Selecionar Todos ({filteredTrash.length})
                </button>
              </div>

              {filteredTrash.map((course) => {
                const isSelected = selectedIds.includes(course.id);
                return (
                  <div key={course.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border transition ${isSelected ? "border-red-500 bg-red-50/50 dark:bg-red-950/20" : "border-dashed border-red-200 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10"}`}>
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleSelectOne(course.id)} className="text-muted-foreground hover:text-foreground">
                        {isSelected ? <CheckSquare size={18} className="text-red-600" /> : <Square size={18} />}
                      </button>
                      <div>
                        <h3 className="font-bold text-foreground text-sm line-through opacity-80">{course.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Nível: {course.level} {course.category ? `• ${course.category}` : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void handleRestoreSingle(course.id, course.title)}
                        disabled={actionLoading === course.id}
                        className="h-9 gap-1 text-xs font-bold rounded-xl"
                      >
                        <RotateCcw size={13} /> Restaurar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setConfirmModal({ isOpen: true, type: "single", permanent: true, id: course.id, title: course.title })}
                        disabled={actionLoading === course.id}
                        className="h-9 gap-1 text-xs font-bold rounded-xl"
                      >
                        <Trash2 size={13} /> Excluir Permanentemente
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal de Confirmação de Segurança */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 font-sans animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle size={28} />
              <h3 className="text-lg font-black text-foreground">Confirmação de Exclusão Permanente</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {confirmModal.type === "single"
                ? `Tem certeza absoluta que deseja excluir permanentemente o curso "${confirmModal.title}"? Esta ação removerá todos os registros do banco de dados e não poderá ser desfeita.`
                : `Tem certeza absoluta que deseja excluir permanentemente os ${selectedIds.length} cursos selecionados? Esta ação não poderá ser desfeita.`}
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setConfirmModal({ isOpen: false, type: "single", permanent: false })}
                className="rounded-xl text-xs font-bold"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => void executeConfirmedAction()}
                className="rounded-xl text-xs font-bold gap-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 size={14} /> Sim, Excluir Permanentemente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
