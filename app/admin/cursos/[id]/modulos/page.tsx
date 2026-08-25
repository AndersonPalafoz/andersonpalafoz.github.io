"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, BookOpen, Loader2, GripVertical, ChevronUp, ChevronDown, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Module {
  id: number;
  title: string;
  order: number;
}

export default function AdminCourseModulesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const courseId = parseInt(id, 10);

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const resCourses = await fetch("/api/admin/courses");
        const coursesData = await resCourses.json();
        const found = (coursesData || []).find((c: any) => c.id === courseId);
        setCourse(found);

        const resMods = await fetch(`/api/admin/courses/${courseId}/modules`);
        if (!resMods.ok) throw new Error("Não foi possível carregar os módulos");
        const modsData = await resMods.json();
        setModules(modsData.modules || []);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar dados do curso:", err);
        setError(err instanceof Error ? err.message : "Não foi possível carregar a estrutura do curso.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId]);

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) {
      toast.error("Digite o título do módulo.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newModuleTitle,
          order: modules.length + 1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (!data.module?.id) throw new Error("Resposta inválida ao criar módulo");
        toast.success("Módulo criado com sucesso!");
        setModules((current) => [...current, data.module]);
        setNewModuleTitle("");
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Não foi possível criar o módulo");
      }
    } catch (err) {
      console.error("Erro ao criar módulo:", err);
      toast.error("Erro ao criar módulo.");
    } finally {
      setSaving(false);
    }
  };

  const moveModule = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= modules.length || saving) return;
    const previous = modules;
    const updated = [...modules];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    const reindexed = updated.map((module, moduleIndex) => ({ ...module, order: moduleIndex + 1 }));
    setModules(reindexed);
    setSaving(true);

    try {
      toast.loading("Salvando nova ordem dos módulos...", { id: "reorder-mod" });
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleIds: reindexed.map((module) => module.id) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Não foi possível salvar a ordem");
      setModules(data.modules || reindexed);
      toast.success("Ordem dos módulos alterada e salva com sucesso!", { id: "reorder-mod" });
    } catch (error) {
      setModules(previous);
      toast.error(error instanceof Error ? error.message : "Erro ao salvar ordem.", { id: "reorder-mod" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 sm:px-8 lg:px-12" aria-busy="true" aria-label="Carregando estrutura do curso">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="h-11 animate-pulse rounded-2xl bg-muted" />
          <div className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-9 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
          </div>
          <div className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="h-6 w-48 animate-pulse rounded bg-muted" />
            {Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-muted" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background px-4 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-100" role="alert">
          <div className="flex items-start gap-3"><AlertCircle className="mt-0.5 shrink-0" size={20} /><div><h1 className="font-black">Não foi possível carregar a estrutura do curso</h1><p className="mt-2 text-sm">{error}</p><Link href="/admin/cursos" className="mt-4 inline-flex rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700">Voltar para cursos</Link></div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumbs Hierárquicos */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground bg-card text-card-foreground px-6 py-3 rounded-2xl border border-border shadow-sm">
          <Link href="/admin" className="hover:text-red-600 font-medium">Painel Admin</Link>
          <span>/</span>
          <Link href="/admin/cursos" className="hover:text-red-600 font-medium">Cursos</Link>
          <span>/</span>
          <span className="text-foreground font-bold">Módulos do Curso</span>
        </nav>

        <div className="flex flex-col gap-4 bg-card sm:flex-row sm:items-center sm:justify-between text-card-foreground p-6 rounded-2xl border border-border shadow-sm">
          <div>
            <Link href="/admin/cursos" className="text-sm font-semibold text-red-600 hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft size={16} /> Voltar para Cursos
            </Link>
            <span className="bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase">
              Hierarquia: Curso → Módulos → Aulas
            </span>
            <h1 className="text-3xl font-bold text-foreground mt-2">
              {course ? course.title : `Curso #${courseId}`}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie e reordene os módulos pedagógicos deste curso. Use as setas para mover rapidamente.
            </p>
          </div>
          <Link href="/admin/cursos">
            <button className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow">
              Concluir Estrutura
            </button>
          </Link>
        </div>

        {/* Ação destacada para adicionar módulo */}
        <section className="flex flex-col gap-4 rounded-2xl border border-red-100 dark:border-red-900/50 bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-slate-900 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div><p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Próximo nível da hierarquia</p><h2 className="mt-2 text-xl font-black text-foreground">Construa o primeiro módulo do curso</h2><p className="mt-1 text-sm text-muted-foreground">Depois de criar o módulo, você poderá adicionar e ordenar as aulas correspondentes.</p></div>
          <button type="button" onClick={() => setShowModuleModal(true)} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-black text-white shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700"><Plus size={18} /> Adicionar módulo</button>
        </section>

        {/* Lista de Módulos com Reordenação */}
        <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Módulos Estruturados ({modules.length})</h3>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Arraste ou Reordene</span>
          </div>

          {modules.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <BookOpen size={48} className="mx-auto text-muted-foreground/60" />
              <p className="text-muted-foreground font-medium">Nenhum módulo criado para este curso ainda.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/70">
              {modules.map((mod, index) => (
                <div key={mod.id || index} className="p-6 flex items-center justify-between hover:bg-muted/60 transition">
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="cursor-grab text-muted-foreground hover:text-muted-foreground">
                      <GripVertical size={20} />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{mod.title}</h4>
                      <p className="text-xs text-muted-foreground">Módulo #{index + 1} • Pronto para adição de aulas</p>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:gap-3">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveModule(index, "up")}
                        disabled={index === 0}
                        className="rounded-lg p-2 text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                        title="Mover para cima"
                        aria-label={`Mover ${mod.title} para cima`}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveModule(index, "down")}
                        disabled={index === modules.length - 1}
                        className="rounded-lg p-2 text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                        title="Mover para baixo"
                        aria-label={`Mover ${mod.title} para baixo`}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <Link href={`/admin/aulas?courseId=${courseId}`}>
                      <button className="px-4 py-2 bg-muted hover:bg-muted text-foreground font-semibold text-xs rounded-xl transition">
                        Gerenciar Aulas
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showModuleModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" role="dialog" aria-modal="true" aria-labelledby="module-modal-title"><div className="w-full max-w-lg rounded-2xl bg-card text-card-foreground p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Novo módulo</p><h2 id="module-modal-title" className="mt-2 text-2xl font-black text-foreground">Adicionar módulo ao curso</h2><p className="mt-2 text-sm text-muted-foreground">Use um título claro para orientar a progressão pedagógica do aluno.</p></div><button type="button" onClick={() => setShowModuleModal(false)} className="rounded-lg px-2 py-1 text-2xl leading-none text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Fechar modal">×</button></div><form onSubmit={async (event) => { await handleCreateModule(event); if (newModuleTitle.trim()) setShowModuleModal(false); }} className="mt-6 space-y-4"><label htmlFor="new-module-title" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Título do módulo</label><input id="new-module-title" type="text" required autoFocus value={newModuleTitle} onChange={(event) => setNewModuleTitle(event.target.value)} placeholder="Ex.: Fundamentos da comunicação" className="h-12 w-full rounded-xl border border-border px-4 text-sm text-foreground outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100" /><div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setShowModuleModal(false)} className="h-11 rounded-xl border border-border px-5 text-sm font-bold text-foreground hover:bg-muted/60">Cancelar</button><button type="submit" disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">{saving ? <Loader2 className="animate-spin" size={17} /> : <Plus size={17} />} Criar módulo</button></div></form></div></div>}
    </div>
  );
}
