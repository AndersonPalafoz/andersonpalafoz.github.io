"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, BookOpen, Loader2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
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
      } catch (err) {
        console.error("Erro ao carregar dados do curso:", err);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-red-600">
          <Loader2 className="animate-spin" size={28} />
          <span className="text-lg font-semibold">Carregando estrutura do curso...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumbs Hierárquicos */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 bg-white px-6 py-3 rounded-2xl border border-gray-200 shadow-sm">
          <Link href="/admin" className="hover:text-red-600 font-medium">Painel Admin</Link>
          <span>/</span>
          <Link href="/admin/cursos" className="hover:text-red-600 font-medium">Cursos</Link>
          <span>/</span>
          <span className="text-gray-900 font-bold">Módulos do Curso</span>
        </nav>

        <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <Link href="/admin/cursos" className="text-sm font-semibold text-red-600 hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft size={16} /> Voltar para Cursos
            </Link>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
              Hierarquia: Curso → Módulos → Aulas
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">
              {course ? course.title : `Curso #${courseId}`}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
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
        <section className="flex flex-col gap-4 rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div><p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Próximo nível da hierarquia</p><h2 className="mt-2 text-xl font-black text-gray-900">Construa o primeiro módulo do curso</h2><p className="mt-1 text-sm text-gray-600">Depois de criar o módulo, você poderá adicionar e ordenar as aulas correspondentes.</p></div>
          <button type="button" onClick={() => setShowModuleModal(true)} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-black text-white shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700"><Plus size={18} /> Adicionar módulo</button>
        </section>

        {/* Lista de Módulos com Reordenação */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Módulos Estruturados ({modules.length})</h3>
            <span className="text-xs font-semibold text-gray-400 uppercase">Arraste ou Reordene</span>
          </div>

          {modules.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <BookOpen size={48} className="mx-auto text-gray-300" />
              <p className="text-gray-600 font-medium">Nenhum módulo criado para este curso ainda.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {modules.map((mod, index) => (
                <div key={mod.id || index} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="cursor-grab text-gray-400 hover:text-gray-600">
                      <GripVertical size={20} />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 font-bold flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{mod.title}</h4>
                      <p className="text-xs text-gray-500">Módulo #{index + 1} • Pronto para adição de aulas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveModule(index, "up")}
                        disabled={index === 0}
                        className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition"
                        title="Mover para cima"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveModule(index, "down")}
                        disabled={index === modules.length - 1}
                        className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition"
                        title="Mover para baixo"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <Link href={`/admin/aulas?courseId=${courseId}`}>
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition">
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
      {showModuleModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="module-modal-title"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Novo módulo</p><h2 id="module-modal-title" className="mt-2 text-2xl font-black text-gray-900">Adicionar módulo ao curso</h2><p className="mt-2 text-sm text-gray-600">Use um título claro para orientar a progressão pedagógica do aluno.</p></div><button type="button" onClick={() => setShowModuleModal(false)} className="rounded-lg px-2 py-1 text-2xl leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Fechar modal">×</button></div><form onSubmit={async (event) => { await handleCreateModule(event); if (newModuleTitle.trim()) setShowModuleModal(false); }} className="mt-6 space-y-4"><label htmlFor="new-module-title" className="text-xs font-black uppercase tracking-widest text-gray-500">Título do módulo</label><input id="new-module-title" type="text" required autoFocus value={newModuleTitle} onChange={(event) => setNewModuleTitle(event.target.value)} placeholder="Ex.: Fundamentos da comunicação" className="h-12 w-full rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100" /><div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setShowModuleModal(false)} className="h-11 rounded-xl border border-gray-300 px-5 text-sm font-bold text-gray-700 hover:bg-gray-50">Cancelar</button><button type="submit" disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">{saving ? <Loader2 className="animate-spin" size={17} /> : <Plus size={17} />} Criar módulo</button></div></form></div></div>}
    </div>
  );
}
