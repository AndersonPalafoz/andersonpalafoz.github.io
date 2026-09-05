"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, Edit2, Plus, Download, ArrowLeft, Loader2, FileText } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { describeHttpError, type HttpErrorDescription } from "@/lib/error-codes";
import { getCourseOffers } from "@/lib/course-offer-client";
import type { CourseOffer } from "@/lib/course-offer-types";

interface Material {
  id: number;
  title: string;
  category: string;
  level: string;
  fileUrl: string | null;
  description?: string | null;
  isPublic?: boolean;
  createdAt: string;
  deletedAt?: string | null;
}

export default function AdminMateriaisReal() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [offers, setOffers] = useState<CourseOffer[]>([]);
  const [offerFilter, setOfferFilter] = useState("all");
  const [trashMaterials, setTrashMaterials] = useState<Material[]>([]);
  const [activeTab, setActiveTab] = useState<"materials" | "trash">("materials");
  const [loading, setLoading] = useState(true);
  const [loadingTrash, setLoadingTrash] = useState(false);
  const [selectedTrashIds, setSelectedTrashIds] = useState<number[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<HttpErrorDescription | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "Worksheets",
    level: "A1",
    fileUrl: "",
    description: "",
    isPublic: true,
  });
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [trashMaterialToPermanentDelete, setTrashMaterialToPermanentDelete] = useState<Material | null>(null);
  const [deletingPermanent, setDeletingPermanent] = useState(false);

  useEffect(() => {
    void getCourseOffers().then(setOffers).catch((error) => console.warn("Não foi possível carregar as ofertas para filtrar materiais.", error));
  }, []);

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      const query = offerFilter !== "all" ? `?offerId=${encodeURIComponent(offerFilter)}` : "";
      const res = await fetch(`/api/admin/materials${query}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const details = describeHttpError(res.status, data.error);
        setErrorDetails(details);
        throw new Error(details.message);
      }
      setMaterials(Array.isArray(data) ? data : data.materials || []);
      setError(null);
      setErrorDetails(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [offerFilter]);

  const fetchTrash = useCallback(async () => {
    try {
      setLoadingTrash(true);
      const res = await fetch("/api/admin/materials?mode=trash", { cache: "no-store" });
      const data = await res.json().catch(() => ([]));
      if (res.ok) {
        setTrashMaterials(Array.isArray(data) ? data : data.materials || []);
      }
    } catch (err) {
      console.error("Erro ao carregar lixeira de materiais:", err);
    } finally {
      setLoadingTrash(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchMaterials();
      void fetchTrash();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchMaterials, fetchTrash]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category) {
      toast.error("Preencha título e categoria do material.");
      return;
    }

    try {
      setSaving(true);
      const method = editingId ? "PUT" : "POST";
      const url = "/api/admin/materials";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...formData } : formData),
      });

      const responseData = await res.json().catch(() => ({}));
      if (!res.ok) {
        const details = describeHttpError(res.status, responseData.error);
        setErrorDetails(details);
        throw new Error(details.message);
      }

      setErrorDetails(null);
      await fetchMaterials();
      await fetchTrash();
      setFormData({ title: "", category: "Worksheets", level: "A1", fileUrl: "", description: "", isPublic: true });
      setEditingId(null);
      setShowForm(false);
      toast.success("Material salvo com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar material.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (material: any) => {
    setFormData({
      title: material.title,
      category: material.category || "Worksheets",
      level: material.level || "A1",
      fileUrl: material.fileUrl || "",
      description: material.description || "",
      isPublic: material.isPublic ?? true,
    });
    setEditingId(material.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const payload = new FormData();
    payload.append("file", file);
    payload.append("context", "material");
    try {
      setUploadingFile(true);
      const response = await fetch("/api/upload", { method: "POST", body: payload });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao enviar arquivo");
      setFormData((current) => ({ ...current, fileUrl: data.url }));
      toast.success("Arquivo enviado e vinculado ao material.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar o arquivo.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDelete = (material: Material) => setMaterialToDelete(material);

  const confirmDelete = async () => {
    if (!materialToDelete) return;
    try {
      const res = await fetch(`/api/admin/materials?id=${materialToDelete.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const details = describeHttpError(res.status, data.error);
        setErrorDetails(details);
        throw new Error(details.message);
      }
      setErrorDetails(null);
      setMaterials((current) => current.filter((m) => m.id !== materialToDelete.id));
      toast.success("Material movido para a lixeira com sucesso.");
      setMaterialToDelete(null);
      fetchMaterials();
      fetchTrash();
    } catch (error) {
      toast.error(errMessage(error));
    } finally {
      setMaterialToDelete(null);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/materials?id=${id}&restore=true`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao restaurar material.");
      toast.success("Material restaurado com sucesso!");
      fetchMaterials();
      fetchTrash();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao restaurar.");
    }
  };

  const handlePermanentDelete = async (id: number) => {
    try {
      setDeletingPermanent(true);
      const res = await fetch(`/api/admin/materials?id=${id}&permanent=true`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir permanentemente.");
      toast.success("Material excluído permanentemente do sistema.");
      setTrashMaterialToPermanentDelete(null);
      fetchTrash();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir.");
    } finally {
      setDeletingPermanent(false);
    }
  };

  const handleBatchAction = async (action: "restore" | "permanent_delete") => {
    if (selectedTrashIds.length === 0) return;
    const actionName = action === "restore" ? "restaurar" : "excluir permanentemente";
    if (!confirm(`Tem certeza que deseja ${actionName} ${selectedTrashIds.length} material(is) selecionado(s)?`)) return;
    try {
      setBatchLoading(true);
      const res = await fetch("/api/admin/materials/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: selectedTrashIds }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha na operação em lote.");
      toast.success(`Operação em lote realizada com sucesso em ${selectedTrashIds.length} material(is)!`);
      setSelectedTrashIds([]);
      fetchMaterials();
      fetchTrash();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro na operação em lote.");
    } finally {
      setBatchLoading(false);
    }
  };

  function errMessage(error: unknown) {
    return error instanceof Error ? error.message : "Erro ao processar solicitação.";
  }

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
              <FileText className="text-blue-600" size={32} />
              Gerenciamento Completo de Materiais
            </h1>
            <p className="text-muted-foreground mt-1">
              Crie, edite, organize e gerencie a lixeira dos materiais educacionais da plataforma.
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ title: "", category: "Worksheets", level: "A1", fileUrl: "", description: "", isPublic: true });
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-blue-600/25"
          >
            <Plus size={18} /> Novo Material
          </button>
        </div>

        {error && <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold">{error}</div>}

        {showForm && (
          <div className="bg-card text-card-foreground p-8 rounded-2xl border border-border shadow-sm">
            <h2 className="text-xl font-bold mb-3">{editingId ? "Editar Material" : "Cadastrar Novo Material"}</h2>
            <div className="mb-6 grid grid-cols-1 gap-2 rounded-2xl border border-border bg-muted/30 p-3 sm:grid-cols-3">
              <div className="rounded-xl bg-card px-3 py-2 text-xs font-black text-foreground shadow-sm"><span className="mr-2 text-blue-600">01</span>Identificação</div>
              <div className="rounded-xl px-3 py-2 text-xs font-bold text-muted-foreground"><span className="mr-2">02</span>Arquivo e acesso</div>
              <div className="rounded-xl px-3 py-2 text-xs font-bold text-muted-foreground"><span className="mr-2">03</span>Resumo e publicação</div>
            </div>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Título do Material</label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Guia Prático de Verbos Modais"
                    className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground font-semibold focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="Worksheets">Worksheets</option>
                    <option value="Slides">Slides</option>
                    <option value="Áudios">Áudios & Podcasts</option>
                    <option value="Artigos">Artigos & Leituras</option>
                    <option value="Infográficos">Infográficos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Nível CEFR</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground font-semibold focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="A1">Básico · A1</option>
                    <option value="A2">Básico · A2</option>
                    <option value="B1">Intermediário · B1</option>
                    <option value="B2">Intermediário · B2</option>
                    <option value="C1">Avançado · C1</option>
                    <option value="C2">Avançado · C2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Visibilidade</label>
                  <select
                    value={formData.isPublic ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.value === "true" })}
                    className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground font-semibold focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="true">Público (Visível para visitantes)</option>
                    <option value="false">Exclusivo para Alunos Matriculados</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Link Direto ou Arquivo do Google Drive / S3</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    placeholder="https://... ou use upload abaixo"
                    className="flex-1 h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                  <label className="cursor-pointer flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs transition">
                    {uploadingFile ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                    <span>Enviar Arquivo</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                <div className="mt-3 rounded-2xl border border-border/70 bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><FileText size={16} className="shrink-0 text-blue-600" /><span className="truncate text-xs font-bold text-foreground">{formData.fileUrl ? "Arquivo vinculado ao material" : "Nenhum arquivo vinculado ainda"}</span></div><span className={`rounded-full px-2 py-1 text-[10px] font-black ${formData.fileUrl ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{formData.fileUrl ? "Pronto" : "Pendente"}</span></div>
                  <p className="mt-1 truncate text-[11px] text-muted-foreground">{formData.fileUrl || "Cole um link ou use o botão Enviar Arquivo acima."}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Descrição / Resumo</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Instruções pedagógicas, objetivos e ementa do material..."
                  className="w-full rounded-xl border border-border bg-background p-4 text-sm text-foreground focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-background transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  {saving && <Loader2 className="animate-spin" size={18} />}
                  {editingId ? "Salvar Alterações" : "Cadastrar Material"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Listagem de Materiais */}
        <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">{activeTab === "materials" ? "Biblioteca de Materiais" : "Lixeira de Materiais"}</h2>
              <p className="text-xs text-muted-foreground mt-1">{activeTab === "materials" ? "Gerencie os recursos de apoio para os alunos." : "Materiais arquivados que podem ser restaurados ou excluídos permanentemente."}</p>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground" htmlFor="materials-offer-filter">Oferta / Coorte
              <select id="materials-offer-filter" value={offerFilter} onChange={(event) => setOfferFilter(event.target.value)} className="h-10 max-w-full rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground">
                <option value="all">Todos os contextos</option>
                {offers.filter((offer) => !offer.deletedAt).map((offer) => <option key={offer.id} value={offer.id}>{offer.offerName} · {offer.academicTerm}</option>)}
              </select>
            </label>
            <div className="flex items-center gap-3">
              <div className="flex rounded-xl bg-muted p-1 border border-border">
                <button
                  onClick={() => setActiveTab("materials")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === "materials" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Ativos ({materials.length})
                </button>
                <button
                  onClick={() => { setActiveTab("trash"); fetchTrash(); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === "trash" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Lixeira ({trashMaterials.length})
                </button>
              </div>
            </div>
          </div>

          {activeTab === "materials" ? (
            loading ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-muted-foreground font-medium">Carregando materiais...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center text-red-600 font-medium">{error}</div>
            ) : materials.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileText size={48} className="mx-auto text-gray-300" />
                <p className="text-muted-foreground font-medium">Nenhum material cadastrado ainda.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/70">
                {materials.map((mat) => (
                  <div key={mat.id} className="p-6 hover:bg-background transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                          {mat.category}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-muted text-foreground">
                          {mat.level}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${mat.isPublic !== false ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"}`}>
                          {mat.isPublic !== false ? "Público" : "Privado (Alunos)"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{mat.title}</h3>
                      {mat.description && <p className="text-sm text-muted-foreground line-clamp-2">{mat.description}</p>}
                    </div>

                    <div className="flex items-center gap-3">
                      {mat.fileUrl && (
                        <a
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-semibold text-xs transition flex items-center gap-1.5"
                        >
                          <Download size={14} /> Arquivo
                        </a>
                      )}
                      <button
                        onClick={() => handleEdit(mat)}
                        className="px-4 py-2 rounded-xl bg-muted hover:bg-gray-200 text-foreground font-semibold text-xs transition flex items-center gap-1.5"
                      >
                        <Edit2 size={14} /> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(mat)}
                        className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs transition flex items-center gap-1.5"
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
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-muted-foreground font-medium">Carregando lixeira...</p>
              </div>
            ) : trashMaterials.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileText size={48} className="mx-auto text-gray-300" />
                <p className="text-muted-foreground font-medium">A lixeira de materiais está vazia.</p>
              </div>
            ) : (
              <div>
                <div className="p-4 bg-muted/60 border-b border-border flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <input
                      type="checkbox"
                      aria-label="Selecionar todos os materiais"
                      checked={selectedTrashIds.length === trashMaterials.length && trashMaterials.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedTrashIds(trashMaterials.map((m) => m.id));
                        else setSelectedTrashIds([]);
                      }}
                      className="h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedTrashIds.length === trashMaterials.length) setSelectedTrashIds([]);
                        else setSelectedTrashIds(trashMaterials.map((m) => m.id));
                      }}
                      className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-bold text-foreground hover:bg-muted transition"
                    >
                      {selectedTrashIds.length === trashMaterials.length ? "Desmarcar Todos" : "Selecionar Todos"}
                    </button>
                    <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-black">
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
                  </div>
                </div>

                <div className="divide-y divide-border/70">
                  {trashMaterials.map((mat) => {
                    const isSelected = selectedTrashIds.includes(mat.id);
                    return (
                      <div key={mat.id} className={`p-6 transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${isSelected ? "bg-blue-50/40 dark:bg-blue-950/20" : "hover:bg-background"}`}>
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            aria-label={`Selecionar material ${mat.title}`}
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedTrashIds([...selectedTrashIds, mat.id]);
                              else setSelectedTrashIds(selectedTrashIds.filter((id) => id !== mat.id));
                            }}
                            className="mt-1 h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-600"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                Na Lixeira
                              </span>
                              <span className="text-xs text-muted-foreground font-semibold">{mat.category} · Nível {mat.level}</span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground">{mat.title}</h3>
                            {mat.description && <p className="text-sm text-muted-foreground line-clamp-2">{mat.description}</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pl-7 md:pl-0">
                          <button
                            onClick={() => handleRestore(mat.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-xs transition"
                          >
                            Restaurar
                          </button>
                          <button
                            onClick={() => setTrashMaterialToPermanentDelete(mat)}
                            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-sm"
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

      {materialToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-material-title">
          <div className="w-full max-w-md rounded-2xl bg-card text-card-foreground p-6 shadow-2xl">
            <h2 id="delete-material-title" className="text-xl font-black text-foreground">Mover material para a lixeira?</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">O material <strong>{materialToDelete.title}</strong> será arquivado e poderá ser restaurado posteriormente na aba da lixeira.</p>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setMaterialToDelete(null)} className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-foreground hover:bg-background">Cancelar</button><button type="button" onClick={() => void confirmDelete()} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">Mover para lixeira</button></div>
          </div>
        </div>
      )}

      {trashMaterialToPermanentDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="perm-delete-material-title">
          <div className="w-full max-w-lg rounded-2xl bg-card text-card-foreground p-6 shadow-2xl space-y-4">
            <h2 id="perm-delete-material-title" className="text-xl font-black text-red-600">Excluir permanentemente do sistema?</h2>
            <div className="p-4 rounded-xl bg-muted/60 border border-border text-xs space-y-2">
              <p><strong>Título:</strong> {trashMaterialToPermanentDelete.title}</p>
              <p><strong>Categoria:</strong> {trashMaterialToPermanentDelete.category} · <strong>Nível:</strong> {trashMaterialToPermanentDelete.level}</p>
              <p className="text-muted-foreground">{trashMaterialToPermanentDelete.description || "Sem descrição."}</p>
            </div>
            <p className="text-xs text-muted-foreground">Esta ação é irreversível e removerá permanentemente o material e seus vínculos de progresso.</p>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setTrashMaterialToPermanentDelete(null)} className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-background">Cancelar</button>
              <button type="button" disabled={deletingPermanent} onClick={() => void handlePermanentDelete(trashMaterialToPermanentDelete.id)} className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold transition disabled:opacity-50">
                {deletingPermanent && <Loader2 className="animate-spin inline mr-1.5" size={14} />} Excluir Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
