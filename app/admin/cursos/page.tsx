"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, ArrowLeft, Loader2, BookOpen, Layers, User, FileText, Search } from "lucide-react";
import { toast } from "sonner";

interface Course {
  id: number;
  title: string;
  level: string;
  category?: string | null;
  modules: number;
  instructor?: string | null;
  description: string | null;
}

export default function AdminCursos() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverRemovalPending, setCoverRemovalPending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    level: "A1",
    category: "",
    modules: 4,
    instructor: "Anderson Palafoz",
    modality: "individual" as "individual" | "group",
    isFree: true,
    price: 0,
    description: "",
    imageUrl: "",
    audioUrl: "",
    videoUrl: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/courses");
      if (!response.ok) throw new Error("Falha ao carregar cursos");
      const data = await response.json();
      setCourses(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("pt-BR");
    return courses.filter((course) => {
      const matchesLevel = levelFilter === "all" || course.level === levelFilter;
      if (!matchesLevel) return false;
      if (!query) return true;
      return [course.title, course.category, course.instructor, course.description]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("pt-BR").includes(query));
    });
  }, [courses, levelFilter, searchTerm]);

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este curso?")) return;
    try {
      const response = await fetch(`/api/admin/courses?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Falha ao deletar curso");
      setCourses(courses.filter((c) => c.id !== id));
      toast.success("Curso excluído com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir curso.");
    }
  };

  const handleEdit = (course: any) => {
    setEditingId(course.id);
    setFormData({
      title: course.title,
      level: course.level || "A1",
      category: course.category || "",
      modules: course.modules || 1,
      instructor: course.instructor || "Anderson Palafoz",
      modality: course.modality || "individual",
      isFree: course.isFree ?? true,
      price: course.price ?? 0,
      description: course.description || "",
      imageUrl: course.imageUrl || "",
      audioUrl: course.audioUrl || "",
      videoUrl: course.videoUrl || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const payload = new FormData();
    payload.append("file", file);
    payload.append("context", "course-cover");
    try {
      setUploadingCover(true);
      const response = await fetch("/api/upload", { method: "POST", body: payload });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao enviar capa");
      setFormData((current) => ({ ...current, imageUrl: data.url }));
      toast.success("Capa enviada com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar a capa.");
    } finally {
      setUploadingCover(false);
    }
  };

  const confirmCoverRemoval = () => {
    setFormData((current) => ({ ...current, imageUrl: "" }));
    setCoverRemovalPending(false);
    toast.success("Capa removida do formulário. Salve o curso para confirmar.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.level) {
      toast.error("Preencha o título e o nível do curso.");
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        const response = await fetch("/api/admin/courses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...formData }),
        });
        if (!response.ok) throw new Error("Falha ao atualizar curso");
        const [updated] = await response.json();
        setCourses(courses.map((c) => (c.id === editingId ? updated : c)));
        setEditingId(null);
        toast.success("Curso atualizado com sucesso.");
        setShowForm(false);
        setFormData({ title: "", level: "A1", category: "", modules: 4, instructor: "Anderson Palafoz", modality: "individual", isFree: true, price: 0, description: "", imageUrl: "", audioUrl: "", videoUrl: "" });
      } else {
        const response = await fetch("/api/admin/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error("Falha ao criar curso");
        const [created] = await response.json();
        const newCourseId = created.id;
        setCourses([...courses, created]);
        toast.success("Curso criado. Redirecionando para estruturar os módulos...");
        window.location.href = `/admin/cursos/${newCourseId}/modulos`;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar curso.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card text-card-foreground p-8 rounded-2xl shadow-sm border border-border">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin" className="text-sm font-semibold text-red-600 hover:underline flex items-center gap-1">
                <ArrowLeft size={16} /> Voltar ao Painel Admin
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BookOpen className="text-red-600" size={32} />
              Gerenciamento Completo de Cursos
            </h1>
            <p className="text-muted-foreground mt-1">
              Crie, edite e estruture cursos de inglês com níveis CEFR (A1-C2), módulos e ementa detalhada.
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ title: "", level: "A1", category: "", modules: 4, instructor: "Anderson Palafoz", modality: "individual", isFree: true, price: 0, description: "", imageUrl: "", audioUrl: "", videoUrl: "" });
            }}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-red-600/20"
          >
            <Plus size={20} />
            {showForm ? "Fechar Formulário" : "Novo Curso Completo"}
          </button>
        </div>

        {/* Formulário Completo de Curso */}
        {showForm && (
          <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-lg p-8 transition-all animate-fadeIn">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <BookOpen size={20} className="text-red-600" />
              {editingId ? "Editar Curso" : "Cadastrar Novo Curso & Estruturar Módulos"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Título do Curso *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Inglês Instrumental para Iniciantes (A1)"
                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Nível CEFR *</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition bg-card text-card-foreground"
                  >
                    <option value="A1">A1 - Iniciante / Beginner</option>
                    <option value="A2">A2 - Básico / Elementary</option>
                    <option value="B1">B1 - Intermediário / Intermediate</option>
                    <option value="B2">B2 - Intermediário Superior / Upper-Intermediate</option>
                    <option value="C1">C1 - Avançado / Advanced</option>
                    <option value="C2">C2 - Profissional / Mastery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Categoria pedagógica</label>
                  <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Ex: Inglês Geral, Gramática, Conversação" className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Quantidade Inicial de Módulos</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={formData.modules}
                    onChange={(e) => setFormData({ ...formData, modules: parseInt(e.target.value) || 4 })}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition bg-card text-card-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Ao salvar, você será direcionado para gerenciar os módulos e aulas deste curso.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Professor Responsável</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                    <input
                      type="text"
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      placeholder="Ex: Anderson Palafoz"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Modelo de Acesso / Precificação</label>
                  <select
                    value={formData.isFree ? "free" : "paid"}
                    onChange={(e) => setFormData({ ...formData, isFree: e.target.value === "free" })}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition bg-card text-card-foreground font-medium text-foreground"
                  >
                    <option value="free">Gratuito (Acesso Livre para Alunos)</option>
                    <option value="paid">Pago (Requer Assinatura / Pagamento Stripe)</option>
                  </select>
                </div>

                {!formData.isFree && (
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Preço do Curso (R$)</label>
                    <input
                      type="number"
                      min={1}
                      step={0.01}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="Ex: 149.90"
                      className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">URL do Vídeo / Áudio Introdutório</label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="YouTube URL ou link de áudio"
                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Imagem de Capa (URL ou Upload)</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://... ou cole o link da imagem"
                      className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition text-sm"
                    />
                    <label htmlFor="course-cover-upload" className={`inline-flex cursor-pointer items-center justify-center rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-700 transition hover:bg-red-100 whitespace-nowrap ${uploadingCover ? "pointer-events-none opacity-60" : ""}`}>
                      {uploadingCover ? "Enviando..." : "Enviar imagem"}
                    </label>
                    <input id="course-cover-upload" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleCoverUpload} className="sr-only" disabled={uploadingCover} />
                    {formData.imageUrl && <button type="button" onClick={() => setCoverRemovalPending(true)} className="inline-flex items-center justify-center rounded-xl bg-muted px-4 py-3 text-xs font-bold text-foreground transition hover:bg-muted whitespace-nowrap">Remover capa</button>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Cole um link direto ou envie JPG, PNG, WebP ou GIF. A imagem enviada fica armazenada de forma persistente.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Descrição Detalhada e Ementa</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva os objetivos pedagógicos, gramática abordada, vocabulário e metodologia (ex: modelo ESA)."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-muted/60 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition flex items-center gap-2 shadow-md shadow-red-600/20 disabled:opacity-50"
                >
                  {saving && <Loader2 className="animate-spin" size={18} />}
                  {editingId ? "Salvar Alterações" : "Criar Curso & Ir para Módulos →"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Listagem de Cursos */}
        <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-border space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Cursos Disponíveis</h2>
                <p className="mt-1 text-xs text-muted-foreground">Consulte, filtre e acesse a estrutura pedagógica de cada curso.</p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground" aria-live="polite">{filteredCourses.length} de {courses.length} curso(s)</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
              <label className="relative block">
                <span className="sr-only">Buscar cursos</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} aria-hidden="true" />
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar por título, categoria ou professor" className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-red-600 focus:ring-2 focus:ring-red-600/20" />
              </label>
              <label>
                <span className="sr-only">Filtrar por nível</span>
                <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20">
                  <option value="all">Todos os níveis</option>
                  <option value="A1">Básico · A1</option>
                  <option value="A2">Básico · A2</option>
                  <option value="B1">Intermediário · B1</option>
                  <option value="B2">Intermediário · B2</option>
                  <option value="C1">Avançado · C1</option>
                  <option value="C2">Avançado · C2</option>
                </select>
              </label>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-red-600" size={32} />
              <p className="text-muted-foreground font-medium">Carregando cursos...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-600 font-medium">{error}</div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <BookOpen size={48} className="mx-auto text-muted-foreground/60" />
              <p className="text-muted-foreground font-medium">{courses.length === 0 ? "Nenhum curso cadastrado ainda." : "Nenhum curso corresponde aos filtros atuais."}</p>
            </div>
          ) : (
            <div className="divide-y divide-border/70">
              {filteredCourses.map((course) => (
                <div key={course.id} className="p-6 hover:bg-muted/60 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
                        Nível {course.level}
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                        <Layers size={14} /> {course.modules} Módulos
                      </span>
                      {course.instructor && (
                        <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                          <User size={14} /> {course.instructor}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{course.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{course.description || "Sem descrição informada."}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link href={`/admin/cursos/${course.id}/modulos`}>
                      <button className="px-4 py-2 bg-red-50 hover:bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5">
                        <Layers size={14} /> Gerenciar Módulos
                      </button>
                    </Link>
                    <button
                      onClick={() => handleEdit(course)}
                      className="px-4 py-2 rounded-xl bg-muted hover:bg-muted text-foreground font-semibold text-xs transition flex items-center gap-1.5"
                    >
                      <Edit2 size={14} /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 font-semibold text-xs transition flex items-center gap-1.5"
                    >
                      <Trash2 size={14} /> Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {coverRemovalPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="remove-cover-title">
          <div className="w-full max-w-md rounded-2xl bg-card text-card-foreground p-6 shadow-2xl">
            <h2 id="remove-cover-title" className="text-xl font-black text-foreground">Remover imagem de capa?</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">A capa será retirada deste formulário. Para persistir a remoção, confirme salvando o curso.</p>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setCoverRemovalPending(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-foreground hover:bg-muted/60">Cancelar</button><button type="button" onClick={confirmCoverRemoval} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">Remover imagem</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
