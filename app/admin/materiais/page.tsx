"use client";

import { useEffect, useState } from "react";
import { Trash2, Edit2, Plus, Download, ArrowLeft, Loader2, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { describeHttpError, type HttpErrorDescription } from "@/lib/error-codes";

interface Material {
  id: number;
  title: string;
  category: string;
  level: string;
  fileUrl: string | null;
  description?: string | null;
  isPublic?: boolean;
  createdAt: string;
}

export default function AdminMateriaisReal() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/materials", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const details = describeHttpError(res.status, data.error);
        setErrorDetails(details);
        throw new Error(details.message);
      }
      setMaterials(data.materials || data);
      setError(null);
      setErrorDetails(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

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
      toast.success("Material excluído com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir material.");
    } finally {
      setMaterialToDelete(null);
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
              <FileText className="text-blue-600" size={32} />
              Gerenciamento Completo de Materiais
            </h1>
            <p className="text-muted-foreground mt-1">
              Adicione e organize recursos didáticos (Worksheets, Slides, Handouts, Áudios) classificados por nível CEFR.
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ title: "", category: "Worksheets", level: "A1", fileUrl: "", description: "", isPublic: true });
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-blue-600/20"
          >
            <Plus size={20} />
            {showForm ? "Fechar Formulário" : "Novo Material Acadêmico"}
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
              <button type="button" onClick={() => void fetchMaterials()} className="rounded-lg border border-red-300 px-3 py-2 text-xs font-bold hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/40">Tentar novamente</button>
            </div>
          </div>
        )}

        {/* Formulário Completo de Material */}
        {showForm && (
          <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-lg p-8 transition-all animate-fadeIn">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              {editingId ? "Editar Material Acadêmico" : "Cadastrar Novo Material Acadêmico"}
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Título do Material *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Worksheet - Simple Present & Routine"
                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Categoria Pedagógica *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition bg-card text-card-foreground"
                  >
                    <option value="Worksheets">Worksheets (Atividades)</option>
                    <option value="Slides">Slides de Aula</option>
                    <option value="Handouts">Handouts & Resumos</option>
                    <option value="Audio">Áudio & Pronúncia</option>
                    <option value="Comics">Comics na Educação</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Nível CEFR</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition bg-card text-card-foreground"
                  >
                    <option value="A1">A1 - Iniciante</option>
                    <option value="A2">A2 - Básico</option>
                    <option value="B1">B1 - Intermediário</option>
                    <option value="B2">B2 - Intermediário Superior</option>
                    <option value="C1">C1 - Avançado</option>
                    <option value="C2">C2 - Profissional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Arquivo (upload persistente ou link externo)</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <label htmlFor="material-file-upload" className={`inline-flex cursor-pointer items-center justify-center rounded-xl bg-blue-50 px-4 py-3 text-xs font-bold text-blue-700 transition hover:bg-blue-100 ${uploadingFile ? "pointer-events-none opacity-60" : ""}`}>
                        {uploadingFile ? "Enviando..." : "Enviar arquivo"}
                      </label>
                      <input id="material-file-upload" type="file" accept="application/pdf,image/jpeg,image/png,image/webp,image/gif,audio/mpeg,audio/wav" onChange={handleFileUpload} className="sr-only" disabled={uploadingFile} />
                      {formData.fileUrl && <span className="flex min-w-0 items-center truncate rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">Arquivo vinculado</span>}
                    </div>
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                      <input type="url" value={formData.fileUrl} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} placeholder="Ou cole https://drive.google.com/file/d/..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition" />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">PDFs, imagens e áudios são armazenados de forma persistente; links do Google Drive continuam suportados.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Visibilidade de Publicação</label>
                  <select
                    value={formData.isPublic ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.value === "true" })}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition bg-card text-card-foreground font-medium text-foreground"
                  >
                    <option value="true">Público (Disponível na Biblioteca para todos)</option>
                    <option value="false">Privado (Exclusivo para Alunos Matriculados)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Instruções de Uso ou Descrição</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Instruções para o professor ou aluno sobre como utilizar este material em sala de aula ou estudo autônomo."
                  className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                />
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
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
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Biblioteca de Materiais</h2>
            <span className="text-sm text-muted-foreground font-medium">{materials.length} itens cadastrados</span>
          </div>

          {loading ? (
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
                        <Download size={14} /> Acessar Link
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
          )}
        </div>
      </div>
      {materialToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-material-title">
          <div className="w-full max-w-md rounded-2xl bg-card text-card-foreground p-6 shadow-2xl">
            <h2 id="delete-material-title" className="text-xl font-black text-foreground">Excluir material?</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">A ação removerá <strong>{materialToDelete.title}</strong> da biblioteca e não poderá ser desfeita pelo painel.</p>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setMaterialToDelete(null)} className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-foreground hover:bg-background">Cancelar</button><button type="button" onClick={() => void confirmDelete()} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">Excluir material</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
