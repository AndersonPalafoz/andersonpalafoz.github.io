"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, MoreVertical, Edit2, Trash2, Eye, Loader2, AlertCircle, Search, Download, FileText, Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface Course {
  id: number;
  title: string;
  level: string;
  category?: string | null;
  modules?: number;
  isFree?: boolean;
  price?: number;
  status?: string | null;
}

export function ProfessorCoursesList({ initialCourses }: { initialCourses: Course[] }) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(4);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [statusDropdownId, setStatusDropdownId] = useState<number | null>(null);
  const [animatingId, setAnimatingId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id?: number; title?: string }>({
    isOpen: false,
  });

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term || c.title.toLowerCase().includes(term) || c.level.toLowerCase().includes(term) || (c.category && c.category.toLowerCase().includes(term));
      
      const currentStatus = c.status || ((c.modules || 0) > 0 ? "Ativo & Pronto" : "Em Breve");
      const matchesStatus = statusFilter === "all" || currentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [courses, searchTerm, statusFilter]);

  const paginatedCourses = useMemo(() => {
    return filteredCourses.slice(0, visibleCount);
  }, [filteredCourses, visibleCount]);

  const handleStatusChange = async (courseId: number, newStatus: string) => {
    try {
      setActionLoading(courseId);
      const res = await fetch("/api/admin/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: courseId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar status do curso.");
      
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, status: newStatus } : c))
      );
      setStatusDropdownId(null);
      setAnimatingId(courseId);
      setTimeout(() => setAnimatingId(null), 1000);

      toast.success(`Status alterado para "${newStatus}" com sucesso!`, {
        description: "A alteração foi salva permanentemente no banco de dados.",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSoftDelete = async (id: number, title: string) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/admin/courses?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao mover para a lixeira.");
      
      const removedCourse = courses.find((c) => c.id === id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      setOpenMenuId(null);

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

  const exportCSV = () => {
    const headers = ["ID", "Titulo", "Nivel", "Categoria", "Modulos", "Status"];
    const rows = filteredCourses.map((c) => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.level,
      `"${(c.category || "Geral").replace(/"/g, '""')}"`,
      c.modules || 0,
      c.status || ((c.modules || 0) > 0 ? "Ativo & Pronto" : "Em Breve"),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_cursos_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Relatório CSV de cursos exportado com sucesso!");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Anderson Palafoz Platform - Relatório de Cursos", 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 28);
    doc.text(`Total de cursos listados: ${filteredCourses.length}`, 14, 34);

    let y = 44;
    doc.setFont("helvetica", "bold");
    doc.text("ID", 14, y);
    doc.text("Título do Curso", 28, y);
    doc.text("Nível", 130, y);
    doc.text("Módulos", 165, y);

    y += 6;
    doc.line(14, y, 196, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    filteredCourses.forEach((c) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(String(c.id), 14, y);
      doc.text(c.title.length > 55 ? c.title.substring(0, 52) + "..." : c.title, 28, y);
      doc.text(c.level, 130, y);
      doc.text(String(c.modules || 4), 165, y);
      y += 8;
    });

    doc.save(`relatorio_cursos_${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("Relatório PDF de cursos exportado com sucesso!");
  };

  return (
    <div className="surface-card space-y-6 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            Cursos <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">({filteredCourses.length})</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Gerenciamento, pesquisa e exportação do catálogo acadêmico.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="rounded-xl text-xs font-bold gap-1.5 border-border hover:bg-muted"
          >
            <Download size={13} /> CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportPDF}
            className="rounded-xl text-xs font-bold gap-1.5 border-border hover:bg-muted"
          >
            <FileText size={13} /> PDF
          </Button>
          <Link href="/admin/cursos" className="text-red-600 hover:text-red-700 font-bold text-xs sm:text-sm flex items-center gap-1 pl-2">
            Gerenciar <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Barra de Pesquisa e Filtros Rápidos por Status */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar curso por nome, nível (A1-C2) ou categoria..."
            className="w-full rounded-2xl border border-border bg-muted/30 pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600 transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 mr-1">
            <Filter size={12} /> Filtro Rápido:
          </span>
          {[
            { label: "Todos", value: "all" },
            { label: "Ativo & Pronto", value: "Ativo & Pronto" },
            { label: "Em Breve", value: "Em Breve" },
            { label: "Lotado", value: "Lotado" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${statusFilter === tab.value ? "bg-red-600 text-white shadow-sm" : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredCourses.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">Nenhum curso encontrado para a busca ou filtro selecionado.</p>
        ) : (
          paginatedCourses.map((course) => {
            const isMenuOpen = openMenuId === course.id;
            const isStatusDropdownOpen = statusDropdownId === course.id;
            const isRecentlyUpdated = animatingId === course.id;
            
            const currentStatus = course.status || ((course.modules || 0) > 0 ? "Ativo & Pronto" : "Em Breve");
            const statusBadgeClass =
              currentStatus === "Ativo & Pronto"
                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200"
                : currentStatus === "Lotado"
                ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-200"
                : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-200";

            return (
              <div
                key={course.id}
                className={`relative rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${isRecentlyUpdated ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/30 scale-[1.01]" : "border-border/70 bg-muted/40 hover:border-red-200"}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-foreground text-sm sm:text-base">{course.title}</h3>
                    
                    {/* Tag de Status Interativa com Animação */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setStatusDropdownId(isStatusDropdownOpen ? null : course.id);
                          setOpenMenuId(null);
                        }}
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full cursor-pointer transition flex items-center gap-1 shadow-xs ${statusBadgeClass}`}
                        title="Clique para alterar o status do curso"
                      >
                        {actionLoading === course.id ? <Loader2 size={10} className="animate-spin" /> : null}
                        {currentStatus} ▾
                      </button>

                      {isStatusDropdownOpen && (
                        <div className="absolute left-0 top-7 z-30 w-44 rounded-2xl border border-border bg-card p-2 shadow-xl space-y-1 animate-in fade-in zoom-in-95 font-sans">
                          <p className="text-[10px] font-bold text-muted-foreground px-2 py-1 uppercase tracking-wider">Alterar Status</p>
                          {["Ativo & Pronto", "Em Breve", "Lotado"].map((st) => (
                            <button
                              key={st}
                              onClick={() => void handleStatusChange(course.id, st)}
                              className={`flex items-center justify-between w-full px-3 py-1.5 text-xs font-bold rounded-xl transition text-left ${currentStatus === st ? "bg-red-50 dark:bg-red-950/50 text-red-600" : "text-foreground hover:bg-muted"}`}
                            >
                              {st}
                              {currentStatus === st && <Check size={12} className="text-red-600" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
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
                      onClick={() => {
                        setOpenMenuId(isMenuOpen ? null : course.id);
                        setStatusDropdownId(null);
                      }}
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

        {visibleCount < filteredCourses.length && (
          <div className="pt-2 text-center">
            <Button
              variant="outline"
              onClick={() => setVisibleCount((prev) => prev + 4)}
              className="rounded-xl text-xs font-bold border-border hover:bg-muted w-full sm:w-auto"
            >
              Carregar Mais Cursos ({filteredCourses.length - visibleCount} restantes)
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
