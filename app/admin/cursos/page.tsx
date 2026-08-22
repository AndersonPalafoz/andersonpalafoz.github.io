"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, ArrowLeft, Loader2, BookOpen, Layers, User, FileText, Search } from "lucide-react";
import { toast } from "sonner";
import { describeHttpError, type HttpErrorDescription } from "@/lib/error-codes";
import { COURSE_TYPE_OPTIONS, getCourseTypeDefinition, getSyncModalityLabel, validateCourseTypeFields, type SyncModality } from "@/lib/course-types";

interface Course {
  id: number;
  title: string;
  level: string;
  category?: string | null;
  modules: number;
  instructor?: string | null;
  description: string | null;
  googleDriveLinks?: string | null;
  courseType?: number;
  externalRedirectUrl?: string | null;
  syncModality?: SyncModality;
}

export default function AdminCursos() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<HttpErrorDescription | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverRemovalPending, setCoverRemovalPending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"courses" | "trash">("courses");
  const [trashCategoryFilter, setTrashCategoryFilter] = useState<string>("all");
  const [trashCourses, setTrashCourses] = useState<Course[]>([]);
  const [loadingTrash, setLoadingTrash] = useState(false);
  const [selectedTrashIds, setSelectedTrashIds] = useState<number[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    level: "A1",
    category: "",
    modules: 4,
    instructor: "Anderson Palafoz",
    modality: "individual",
    isFree: true,
    price: 0,
    description: "",
    imageUrl: "",
    audioUrl: "",
    videoUrl: "",
    googleDriveLinks: "",
    classDays: "Segundas e Quartas",
    classTime: "19:00 - 20:30",
    workloadHours: 40,
    startDate: "",
    endDate: "",
    maxAbsencePercent: 25,
    courseType: 1,
    externalRedirectUrl: "",
    syncModality: "none" as SyncModality,
  });

  useEffect(() => {
    fetchCourses();
    fetchTrash();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/courses", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const details = describeHttpError(response.status, data.error);
        setErrorDetails(details);
        throw new Error(details.message);
      }
      setCourses(Array.isArray(data) ? data : data.courses || []);
      setError(null);
      setErrorDetails(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrash = async () => {
    try {
      setLoadingTrash(true);
      const response = await fetch("/api/admin/courses?mode=trash", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setTrashCourses(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Erro ao carregar lixeira de cursos:", err);
    } finally {
      setLoadingTrash(false);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/courses?id=${id}&restore=true`, { method: "DELETE" });
      if (!response.ok) throw new Error("Falha ao restaurar curso.");
      toast.success("Curso restaurado com sucesso!");
      fetchCourses();
      fetchTrash();
      window.dispatchEvent(new Event("trash-updated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao restaurar.");
    }
  };

  const handleBatchAction = async (action: "restore" | "permanent_delete") => {
    if (selectedTrashIds.length === 0) return;
    const actionName = action === "restore" ? "restaurar" : "excluir permanentemente";
    if (!confirm(`Tem certeza que deseja ${actionName} ${selectedTrashIds.length} curso(s) selecionado(s)?`)) return;
    try {
      setBatchLoading(true);
      const res = await fetch("/api/admin/courses/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: selectedTrashIds }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha na operação em lote.");
      toast.success(`Operação em lote realizada com sucesso em ${selectedTrashIds.length} curso(s)!`);
      setSelectedTrashIds([]);
      fetchCourses();
      fetchTrash();
      window.dispatchEvent(new Event("trash-updated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro na operação em lote.");
    } finally {
      setBatchLoading(false);
    }
  };

  const handlePermanentDelete = async (id: number) => {
    try {
      setDeletingCourse(true);
      const response = await fetch(`/api/admin/courses?id=${id}&permanent=true`, { method: "DELETE" });
      if (!response.ok) throw new Error("Falha ao excluir permanentemente.");
      toast.success("Curso excluído permanentemente do sistema.");
      setTrashCourseToPermanentDelete(null);
      fetchTrash();
      window.dispatchEvent(new Event("trash-updated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir.");
    } finally {
      setDeletingCourse(false);
    }
  };

  const filteredCourses = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("pt-BR");
    return courses.filter((course) => {
      const matchesLevel = levelFilter === "all" || course.level === levelFilter;
      if (!matchesLevel) return false;

      const matchesType = typeFilter === "all" || Number(course.courseType ?? 1) === Number(typeFilter);
      if (!matchesType) return false;

      const matchesModality = modalityFilter === "all" || (course.syncModality || "none") === modalityFilter;
      if (!matchesModality) return false;

      if (!query) return true;
      return [course.title, course.category, course.instructor, course.description]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("pt-BR").includes(query));
    });
  }, [courses, levelFilter, typeFilter, modalityFilter, searchTerm]);

  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [trashCourseToPermanentDelete, setTrashCourseToPermanentDelete] = useState<Course | null>(null);
  const [showEmptyTrashModal, setShowEmptyTrashModal] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState(false);

  const handleEmptyTrash = async () => {
    try {
      setBatchLoading(true);
      const res = await fetch("/api/admin/courses/empty-trash", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao esvaziar lixeira.");
      toast.success(`Lixeira esvaziada com sucesso! ${json.count || 0} curso(s) excluído(s).`);
      setShowEmptyTrashModal(false);
      setSelectedTrashIds([]);
      fetchCourses();
      fetchTrash();
      window.dispatchEvent(new Event("trash-updated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao esvaziar lixeira.");
    } finally {
      setBatchLoading(false);
    }
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      setDeletingCourse(true);
      const response = await fetch(`/api/admin/courses?id=${courseToDelete.id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const details = describeHttpError(response.status, data.error);
        setErrorDetails(details);
        throw new Error(details.message);
      }
      const deletedId = courseToDelete.id;
      setCourses(courses.filter((c) => c.id !== deletedId));
      setErrorDetails(null);
      setCourseToDelete(null);
      fetchCourses();
      fetchTrash();
      window.dispatchEvent(new Event("trash-updated"));

      toast("Curso movido para a lixeira.", {
        description: "Você pode restaurar o curso imediatamente se foi um engano.",
        action: {
          label: "Desfazer",
          onClick: async () => {
            try {
              const res = await fetch(`/api/admin/courses?id=${deletedId}&restore=true`, { method: "DELETE" });
              if (res.ok) {
                toast.success("Ação desfeita! Curso restaurado com sucesso.");
                fetchCourses();
                fetchTrash();
                window.dispatchEvent(new Event("trash-updated"));
              } else {
                toast.error("Falha ao desfazer.");
              }
            } catch (e) {
              toast.error("Erro ao desfazer ação.");
            }
          },
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir curso.");
    } finally {
      setDeletingCourse(false);
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
      googleDriveLinks: course.googleDriveLinks || "",
      classDays: course.classDays || "Segundas e Quartas",
      classTime: course.classTime || "19:00 - 20:30",
      workloadHours: course.workloadHours || 40,
      startDate: course.startDate || "",
      endDate: course.endDate || "",
      maxAbsencePercent: course.maxAbsencePercent ?? 25,
      courseType: course.courseType ?? 1,
      externalRedirectUrl: course.externalRedirectUrl || "",
      syncModality: course.syncModality || "none",
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

    const courseTypeError = validateCourseTypeFields(formData);
    if (courseTypeError) {
      toast.error(courseTypeError);
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
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const details = describeHttpError(response.status, data.error);
          setErrorDetails(details);
          throw new Error(details.message);
        }
        const [updated] = Array.isArray(data) ? data : [data.course || data];
        setCourses(courses.map((c) => (c.id === editingId ? updated : c)));
        setEditingId(null);
        toast.success("Curso atualizado com sucesso.");
        setShowForm(false);
        setFormData({
          title: "",
          level: "A1",
          category: "",
          modules: 4,
          instructor: "Anderson Palafoz",
          modality: "individual",
          isFree: true,
          price: 0,
          description: "",
          imageUrl: "",
          audioUrl: "",
          videoUrl: "",
          googleDriveLinks: "",
          classDays: "Segundas e Quartas",
          classTime: "19:00 - 20:30",
          workloadHours: 40,
          startDate: "",
          endDate: "",
          maxAbsencePercent: 25,
          courseType: 1,
          externalRedirectUrl: "",
          syncModality: "none" as SyncModality,
        });
      } else {
        const response = await fetch("/api/admin/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const details = describeHttpError(response.status, data.error);
          setErrorDetails(details);
          throw new Error(details.message);
        }
        const [created] = Array.isArray(data) ? data : [data.course || data];
        const newCourseId = created.id;
        setCourses([...courses, created]);
        setErrorDetails(null);
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
            <div className="flex items-center justify-between gap-4 mb-2">
              <Link href="/admin" className="text-sm font-semibold text-red-600 hover:underline flex items-center gap-1">
                <ArrowLeft size={16} /> Voltar ao Painel Admin
              </Link>
              <Link href="/admin/cursos/audit" className="text-xs font-bold text-foreground bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg border border-border transition">
                Ver Registro de Atividades (Auditoria)
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
              setFormData({
                title: "",
                level: "A1",
                category: "",
                modules: 4,
                instructor: "Anderson Palafoz",
                modality: "individual",
                isFree: true,
                price: 0,
                description: "",
                imageUrl: "",
                audioUrl: "",
                videoUrl: "",
                googleDriveLinks: "",
                classDays: "Segundas e Quartas",
                classTime: "19:00 - 20:30",
                workloadHours: 40,
                startDate: "",
                endDate: "",
                maxAbsencePercent: 25,
                courseType: 1,
                externalRedirectUrl: "",
                syncModality: "none" as SyncModality,
              });
            }}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-red-600/20"
          >
            <Plus size={20} />
            {showForm ? "Fechar Formulário" : "Novo Curso Completo"}
          </button>
        </div>

        {errorDetails && (
          <div role="alert" aria-live="assertive" className="rounded-2xl border border-red-300 bg-red-50 p-5 text-red-950 shadow-sm dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-black">{errorDetails.title}</p>
                <p className="mt-1 text-sm">{errorDetails.message}</p>
                <p className="mt-2 text-xs font-semibold">{errorDetails.actionHint}</p>
              </div>
              <button type="button" onClick={() => void fetchCourses()} className="rounded-lg border border-red-300 px-3 py-2 text-xs font-bold hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/40">Tentar novamente</button>
            </div>
          </div>
        )}

        {/* Formulário Completo de Curso */}
        {showForm && (
          <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-lg p-8 transition-all animate-fadeIn">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <BookOpen size={20} className="text-red-600" />
              {editingId ? "Editar Curso" : "Cadastrar Novo Curso & Estruturar Módulos"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-2 rounded-2xl border border-border bg-muted/30 p-3 sm:grid-cols-3">
                <div className="rounded-xl bg-card px-3 py-2 text-xs font-black text-foreground shadow-sm"><span className="mr-2 text-red-600">01</span>Identidade e acesso</div>
                <div className="rounded-xl px-3 py-2 text-xs font-bold text-muted-foreground"><span className="mr-2">02</span>Calendário e frequência</div>
                <div className="rounded-xl px-3 py-2 text-xs font-bold text-muted-foreground"><span className="mr-2">03</span>Conteúdo e publicação</div>
              </div>
              <details open className="group rounded-2xl border border-border/70 bg-background/45">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-foreground marker:hidden">01. Identidade, acesso e oferta <span className="ml-1 text-xs font-normal text-muted-foreground">Toque para recolher</span></summary>
                <div className="grid grid-cols-1 gap-6 border-t border-border/70 p-4 sm:p-5 md:grid-cols-2">
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

                <div className="md:col-span-2 rounded-2xl border border-border bg-muted/30 p-4 sm:p-5">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div>
                      <label htmlFor="course-type" className="block text-sm font-semibold text-foreground mb-2">Tipo oficial do curso *</label>
                      <select
                        id="course-type"
                        value={formData.courseType}
                        onChange={(event) => {
                          const nextType = Number(event.target.value);
                          setFormData({
                            ...formData,
                            courseType: nextType,
                            syncModality: nextType === 1 ? "none" : formData.syncModality,
                          });
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition bg-card text-card-foreground"
                      >
                        {COURSE_TYPE_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.id}. {option.label}</option>)}
                      </select>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">{getCourseTypeDefinition(formData.courseType).description}</p>
                    </div>

                    <div>
                      <label htmlFor="course-sync-modality" className="block text-sm font-semibold text-foreground mb-2">Modalidade de atendimento</label>
                      <select
                        id="course-sync-modality"
                        value={formData.syncModality}
                        onChange={(event) => setFormData({ ...formData, syncModality: event.target.value as SyncModality })}
                        disabled={formData.courseType === 1}
                        className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition bg-card text-card-foreground disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="none">Sem encontros síncronos</option>
                        <option value="online_individual">Encontros online individuais</option>
                        <option value="online_group">Encontros online em grupo</option>
                        <option value="presencial">Encontros presenciais</option>
                      </select>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">{getSyncModalityLabel(formData.courseType === 1 ? "none" : formData.syncModality)}</p>
                    </div>

                    <div>
                      <label htmlFor="course-external-url" className="block text-sm font-semibold text-foreground mb-2">URL externa do curso</label>
                      <input
                        id="course-external-url"
                        type="url"
                        value={formData.externalRedirectUrl}
                        onChange={(event) => setFormData({ ...formData, externalRedirectUrl: event.target.value })}
                        placeholder="https://classroom.google.com/..."
                        className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition"
                      />
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">Use para Hotmart, Google Classroom ou outro ambiente autorizado. O link ficará visível conforme a regra da modalidade.</p>
                    </div>
                  </div>
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
              </details>

              {/* Calendário e Frequência */}
              <details open className="group rounded-2xl border border-border/70 bg-background/45">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-foreground marker:hidden">02. Calendário e frequência <span className="ml-1 text-xs font-normal text-muted-foreground">Dias, horários e regras</span></summary>
                <div className="grid grid-cols-1 gap-6 border-t border-border/70 p-4 pt-5 sm:p-5 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Dias de Aula</label>
                  <input
                    type="text"
                    value={formData.classDays}
                    onChange={(e) => setFormData({ ...formData, classDays: e.target.value })}
                    placeholder="Ex: Segundas e Quartas"
                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition bg-card text-card-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Horário</label>
                  <input
                    type="text"
                    value={formData.classTime}
                    onChange={(e) => setFormData({ ...formData, classTime: e.target.value })}
                    placeholder="Ex: 19:00 - 20:30"
                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition bg-card text-card-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Carga Horária (Horas)</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={formData.workloadHours}
                    onChange={(e) => setFormData({ ...formData, workloadHours: parseInt(e.target.value) || 40 })}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition bg-card text-card-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Data de Início</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition bg-card text-card-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Data de Término</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition bg-card text-card-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Percentual Máximo de Faltas (%)</label>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={formData.maxAbsencePercent}
                    onChange={(e) => setFormData({ ...formData, maxAbsencePercent: parseInt(e.target.value) || 25 })}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition bg-card text-card-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Acima deste percentual, o aluno reprova por frequência.</p>
                </div>
                </div>
              </details>

              <details open className="group rounded-2xl border border-border/70 bg-background/45">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-foreground marker:hidden">03. Conteúdo, mídia e publicação <span className="ml-1 text-xs font-normal text-muted-foreground">Links, descrição e capa</span></summary>
                <div className="space-y-6 border-t border-border/70 p-4 sm:p-5">
              <div>
                <label htmlFor="course-google-drive-links" className="block text-sm font-semibold text-foreground mb-2">Materiais complementares do Google Drive</label>
                <textarea
                  id="course-google-drive-links"
                  rows={4}
                  value={formData.googleDriveLinks}
                  onChange={(e) => setFormData({ ...formData, googleDriveLinks: e.target.value })}
                  placeholder="https://drive.google.com/file/d/.../view\nhttps://docs.google.com/document/d/.../edit"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
                  aria-describedby="course-google-drive-links-help"
                />
                <p id="course-google-drive-links-help" className="mt-1 text-xs text-muted-foreground">Insira um link HTTPS por linha. Apenas endereços do Google Drive ou Google Docs serão exibidos aos alunos.</p>
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
                </div>
              </details>

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
                <h2 className="text-xl font-bold text-foreground">{activeTab === "courses" ? "Cursos Disponíveis" : "Lixeira de Cursos"}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{activeTab === "courses" ? "Consulte, filtre e acesse a estrutura pedagógica de cada curso." : "Cursos arquivados que podem ser restaurados ou excluídos permanentemente."}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-xl bg-muted p-1 border border-border">
                  <button
                    onClick={() => setActiveTab("courses")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === "courses" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Ativos ({courses.length})
                  </button>
                  <button
                    onClick={() => { setActiveTab("trash"); fetchTrash(); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === "trash" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Lixeira ({trashCourses.length})
                  </button>
                </div>
                {activeTab === "courses" && (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground" aria-live="polite">{filteredCourses.length} de {courses.length} curso(s)</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_160px_160px_160px]">
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
              <label>
                <span className="sr-only">Filtrar por tipo de curso</span>
                <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20">
                  <option value="all">Todos os tipos</option>
                  {COURSE_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.id}. {opt.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">Filtrar por modalidade</span>
                <select value={modalityFilter} onChange={(event) => setModalityFilter(event.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20">
                  <option value="all">Todas as modalidades</option>
                  <option value="none">Sem encontros síncronos</option>
                  <option value="online_individual">Online individual</option>
                  <option value="online_group">Online em grupo</option>
                  <option value="presencial">Presencial</option>
                </select>
              </label>
            </div>
            {(searchTerm || levelFilter !== "all" || typeFilter !== "all" || modalityFilter !== "all") && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground font-medium">Exibindo resultados filtrados na listagem administrativa.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setLevelFilter("all");
                    setTypeFilter("all");
                    setModalityFilter("all");
                  }}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>

          {activeTab === "courses" ? (
            loading ? (
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
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${getCourseTypeDefinition(course.courseType).className}`}>
                          {getCourseTypeDefinition(course.courseType).tag}
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
                      <p className="text-xs font-semibold text-muted-foreground">{getSyncModalityLabel(course.syncModality)}{course.externalRedirectUrl ? " • Ambiente externo vinculado" : ""}</p>
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
                        onClick={() => setCourseToDelete(course)}
                        className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 font-semibold text-xs transition flex items-center gap-1.5"
                      >
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            loadingTrash ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-red-600" size={32} />
                <p className="text-muted-foreground font-medium">Carregando lixeira...</p>
              </div>
            ) : trashCourses.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <BookOpen size={48} className="mx-auto text-muted-foreground/60" />
                <p className="text-muted-foreground font-medium">A lixeira de cursos está vazia.</p>
              </div>
            ) : (
              <div>
                <div className="p-4 bg-muted/60 border-b border-border flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3 flex-wrap w-full md:w-auto pb-2 md:pb-0 border-b md:border-b-0 border-border">
                    <span className="text-xs font-bold text-muted-foreground">Filtrar Categoria:</span>
                    <select
                      value={trashCategoryFilter}
                      onChange={(e) => setTrashCategoryFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs font-bold text-foreground focus:ring-red-600"
                    >
                      <option value="all">Todas as Categorias</option>
                      <option value="Gramática">Gramática & Sintaxe</option>
                      <option value="Letramento">Letramento Étnico-Racial</option>
                      <option value="Leitura">Leitura Acadêmica</option>
                      <option value="Geral">Geral</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <input
                      type="checkbox"
                      aria-label="Selecionar todos os cursos da lixeira"
                      checked={selectedTrashIds.length === trashCourses.length && trashCourses.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedTrashIds(trashCourses.map((c) => c.id));
                        else setSelectedTrashIds([]);
                      }}
                      className="h-4 w-4 rounded border-border text-red-600 focus:ring-red-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedTrashIds.length === trashCourses.length) setSelectedTrashIds([]);
                        else setSelectedTrashIds(trashCourses.map((c) => c.id));
                      }}
                      className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-bold text-foreground hover:bg-muted transition"
                    >
                      {selectedTrashIds.length === trashCourses.length ? "Desmarcar Todos" : "Selecionar Todos"}
                    </button>
                    <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-black">
                      {selectedTrashIds.length} item(ns) selecionado(s)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={selectedTrashIds.length === 0 || batchLoading}
                      onClick={() => handleBatchAction("restore")}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition disabled:opacity-50 shadow-sm"
                    >
                      Restaurar Selecionados
                    </button>
                    <button
                      disabled={selectedTrashIds.length === 0 || batchLoading}
                      onClick={() => handleBatchAction("permanent_delete")}
                      className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition disabled:opacity-50 shadow-sm"
                    >
                      Excluir Selecionados (Definitivo)
                    </button>
                    <button
                      disabled={trashCourses.length === 0 || batchLoading}
                      onClick={() => setShowEmptyTrashModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs transition disabled:opacity-50 shadow-sm flex items-center gap-1.5"
                    >
                      <Trash2 size={14} /> Esvaziar Lixeira
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-border/70">
                  {trashCourses
                    .filter((c) => trashCategoryFilter === "all" || c.category === trashCategoryFilter)
                    .map((course) => {
                    const isSelected = selectedTrashIds.includes(course.id);
                    return (
                      <div key={course.id} className={`p-6 transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${isSelected ? "bg-red-50/40 dark:bg-red-950/20" : "hover:bg-muted/40"}`}>
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            aria-label={`Selecionar curso ${course.title}`}
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedTrashIds([...selectedTrashIds, course.id]);
                              else setSelectedTrashIds(selectedTrashIds.filter((id) => id !== course.id));
                            }}
                            className="mt-1 h-4 w-4 rounded border-border text-red-600 focus:ring-red-600"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                Excluído Lógico
                              </span>
                              <span className="text-xs text-muted-foreground font-semibold">
                                Nível {course.level}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground">{course.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{course.description || "Sem descrição informada."}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pl-7 md:pl-0">
                          <button
                            onClick={() => handleRestore(course.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-xs transition flex items-center gap-1.5"
                          >
                            Restaurar
                          </button>
                          <button
                            onClick={() => setTrashCourseToPermanentDelete(course)}
                            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                          >
                            Excluir Permanentemente
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
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

      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-course-title">
          <div className="w-full max-w-md rounded-2xl bg-card text-card-foreground p-6 shadow-2xl border border-border space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40">
                <Trash2 size={24} />
              </div>
              <div>
                <h2 id="delete-course-title" className="text-lg font-bold text-foreground">Excluir curso permanentemente?</h2>
                <p className="text-xs text-muted-foreground">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Você está prestes a excluir o curso <strong className="text-foreground">{courseToDelete.title}</strong>. Todos os módulos, aulas e registros associados também serão removidos do sistema.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deletingCourse}
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-border text-foreground font-semibold text-xs hover:bg-muted/60 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deletingCourse}
                onClick={confirmDeleteCourse}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-md shadow-red-600/20 disabled:opacity-50"
              >
                {deletingCourse && <Loader2 className="animate-spin" size={14} />}
                {deletingCourse ? "Excluindo..." : "Sim, excluir curso"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Esvaziar Lixeira */}
      {showEmptyTrashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl bg-card text-card-foreground p-6 sm:p-8 shadow-2xl border border-border space-y-6 animate-in fade-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-start gap-4 text-red-600 border-b border-border pb-4">
              <div className="p-3.5 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600">
                <Trash2 size={28} />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-foreground">Esvaziar Toda a Lixeira?</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Atenção: Esta ação excluirá permanentemente <strong>{trashCourses.length} curso(s)</strong> atualmente na lixeira. Esta operação não pode ser desfeita.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <button
                type="button"
                disabled={batchLoading}
                onClick={() => setShowEmptyTrashModal(false)}
                className="px-5 py-2.5 rounded-xl border border-border text-foreground font-bold text-xs hover:bg-muted/60 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={batchLoading}
                onClick={handleEmptyTrash}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition flex items-center gap-2 shadow-md shadow-red-600/20 disabled:opacity-50"
              >
                {batchLoading && <Loader2 className="animate-spin" size={14} />}
                {batchLoading ? "Esvaziando..." : "Sim, Esvaziar Tudo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação Detalhada para Exclusão Permanente na Lixeira */}
      {trashCourseToPermanentDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="trash-permanent-delete-title">
          <div className="w-full max-w-lg rounded-3xl bg-card text-card-foreground p-6 sm:p-8 shadow-2xl border border-border space-y-6 animate-in fade-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-start gap-4 text-red-600 border-b border-border pb-4">
              <div className="p-3.5 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600">
                <Trash2 size={28} />
              </div>
              <div className="space-y-1">
                <h2 id="trash-permanent-delete-title" className="text-xl font-black text-foreground">Exclusão Definitiva da Lixeira</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Atenção: Esta operação apagará permanentemente o curso e todos os dados vinculados do banco de dados. Os alunos perderão acesso.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-muted/50 p-4 space-y-3">
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Detalhes do Curso Selecionado</p>
              <div className="space-y-1">
                <p className="text-base font-bold text-foreground">{trashCourseToPermanentDelete.title}</p>
                <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground pt-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-background border border-border font-bold">Nível {trashCourseToPermanentDelete.level}</span>
                  {trashCourseToPermanentDelete.category && <span className="px-2.5 py-0.5 rounded-md bg-background border border-border font-bold">Categoria: {trashCourseToPermanentDelete.category}</span>}
                  <span className="px-2.5 py-0.5 rounded-md bg-background border border-border font-bold">{trashCourseToPermanentDelete.modules} Módulos</span>
                  {trashCourseToPermanentDelete.instructor && <span className="px-2.5 py-0.5 rounded-md bg-background border border-border font-bold">Prof. {trashCourseToPermanentDelete.instructor}</span>}
                </div>
              </div>
              {trashCourseToPermanentDelete.description && (
                <p className="text-xs text-muted-foreground pt-1 border-t border-border/60 line-clamp-3">
                  {trashCourseToPermanentDelete.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <button
                type="button"
                disabled={deletingCourse}
                onClick={() => setTrashCourseToPermanentDelete(null)}
                className="px-5 py-2.5 rounded-xl border border-border text-foreground font-bold text-xs hover:bg-muted/60 transition disabled:opacity-50"
              >
                Cancelar e Manter na Lixeira
              </button>
              <button
                type="button"
                disabled={deletingCourse}
                onClick={() => handlePermanentDelete(trashCourseToPermanentDelete.id)}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition flex items-center gap-2 shadow-md shadow-red-600/20 disabled:opacity-50"
              >
                {deletingCourse && <Loader2 className="animate-spin" size={14} />}
                {deletingCourse ? "Excluindo..." : "Sim, Excluir Definitivamente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
