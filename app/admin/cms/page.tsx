"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Trash2, Edit3, Save, Search, Globe, Layers, Loader2, ArrowLeft, Eye, UploadCloud, X, Smartphone, Tablet, Monitor, Folder, Undo2, Redo2, History, Copy, Clock } from "lucide-react";
import { BrandEditor } from "./brand-editor";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CmsBlock {
  id: number;
  pageKey: string;
  sectionKey: string;
  title: string;
  content: string;
  status: string;
  contentType: string;
  tag: string;
  orderIndex: number;
  updatedAt: string;
}

interface RevisionItem {
  id: number;
  blockId: number;
  title: string;
  content: string;
  status: string;
  createdAt: string;
}

const PAGE_OPTIONS = [
  { value: "brand", label: "🎨 Marca, Logo e Identidade Visual" },
  { value: "global", label: "Global (Todo o site / Navbar / Rodapé)" },
  { value: "home", label: "Página Inicial (Home)" },
  { value: "sobre", label: "Sobre o Professor" },
  { value: "aulas", label: "Catálogo de Aulas" },
  { value: "materiais", label: "Biblioteca de Materiais" },
  { value: "blog", label: "Blog e Artigos" },
  { value: "contato", label: "Página de Contato" },
  { value: "faq", label: "Perguntas Frequentes (FAQ)" },
  { value: "dashboard", label: "Área do Aluno / Dashboard" },
  { value: "professor", label: "Painel do Professor" },
  { value: "admin", label: "Painel Administrativo" },
];

import { MediaAssetLibrary } from "./media-library";
import { CMSEngagementAnalytics } from "./engagement-analytics";

export default function AdminCmsPage() {
  const { data: session, status: authStatus } = useSession();
  const [activeTab, setActiveTab] = useState<"content" | "media" | "analytics">("content");
  const router = useRouter();

  const [blocks, setBlocks] = useState<CmsBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPageFilter, setSelectedPageFilter] = useState("all");

  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [pageKey, setPageKey] = useState("home");
  const [sectionKey, setSectionKey] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("published");
  const [contentType, setContentType] = useState("text");
  const [tag, setTag] = useState("Geral");
  const [orderIndex, setOrderIndex] = useState(0);

  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // O CMS usa apenas dados e operações persistidas; não há recurso de IA nesta interface.
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [isDragging, setIsDragging] = useState(false);

  // Revisions Modal
  const [revisionsModalOpen, setRevisionsModalOpen] = useState(false);
  const [activeRevisions, setActiveRevisions] = useState<RevisionItem[]>([]);
  const [revisionsBlockId, setRevisionsBlockId] = useState<number | null>(null);

  // Image crop modal

  // Undo / Redo history
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);


  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authStatus !== "loading") {
      if (!session?.user || session.user.role !== "admin") {
        router.replace("/");
      }
    }
  }, [authStatus, session, router]);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/cms", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar blocos.");
      setBlocks(data.blocks || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar CMS.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === "admin") {
      void fetchBlocks();
    }
  }, [session]);

  const recordHistory = (newContent: string) => {
    const updated = history.slice(0, historyIndex + 1);
    updated.push(newContent);
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    recordHistory(val);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setContent(history[prevIndex]);
      toast.info("Desfeito com sucesso.");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setContent(history[nextIndex]);
      toast.info("Refeito com sucesso.");
    }
  };

  // A revisão de conteúdo é feita manualmente pelo administrador antes da publicação.

  // WYSIWYG toolbar format helper
  const applyFormatting = (tagType: string) => {
    let formatted = content;
    if (tagType === "bold") formatted = content ? `**${content}**` : `**Texto em negrito**`;
    if (tagType === "italic") formatted = content ? `*${content}*` : `*Texto em itálico*`;
    if (tagType === "h2") formatted = content ? `\n## ${content}\n` : `\n## Título de Seção\n`;
    if (tagType === "bullet") formatted = content ? `\n- ${content}\n` : `\n- Item de lista\n`;
    if (tagType === "link") formatted = content ? `[${content}](https://andersonpalafoz.com.br)` : `[Visite o site](https://andersonpalafoz.com.br)`;
    handleContentChange(formatted);
    toast.success(`Formatação aplicada: ${tagType}`);
  };

  const filteredBlocks = useMemo(() => {
    return blocks.filter((b) => {
      if (selectedPageFilter !== "all" && b.pageKey !== selectedPageFilter) return false;

      if (selectedStatusFilter !== "all" && b.status !== selectedStatusFilter) return false;
      if (searchTerm && !b.title.toLowerCase().includes(searchTerm.toLowerCase()) && !b.sectionKey.toLowerCase().includes(searchTerm.toLowerCase()) && !b.content.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [blocks, selectedPageFilter, selectedStatusFilter, searchTerm]);

  const processUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", file.type.includes("pdf") ? "document" : file.type.includes("audio") ? "audio" : "image");
    formData.append("tag", "CMS");

    try {
      setUploadingMedia(true);
      setUploadProgress(25);
      const res = await fetch("/api/admin/media", { method: "POST", body: formData });
      setUploadProgress(75);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar arquivo.");
      
      const fileUrl = data.asset?.url || data.url;
      setUploadProgress(100);
      handleContentChange(content ? `${content}\n${fileUrl}` : fileUrl);
      toast.success("Arquivo enviado e persistido com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar arquivo.");
    } finally {
      setUploadingMedia(false);
      setUploadProgress(0);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    await processUpload(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processUpload(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageKey || !sectionKey || !title || !content) {
      toast.error("Preencha todos os campos obrigatórios do bloco.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, pageKey, sectionKey, title, content, status, contentType, orderIndex, tag }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar.");
      toast.success(data.message || "Conteúdo atualizado com sucesso!");
      setEditingId(null);
      setSectionKey("");
      setTitle("");
      setContent("");
      await fetchBlocks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar conteúdo.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (block: CmsBlock) => {
    setEditingId(block.id);
    setPageKey(block.pageKey);
    setSectionKey(block.sectionKey);
    setTitle(block.title);
    setContent(block.content);
    setStatus(block.status || "published");
    setContentType(block.contentType || "text");
    setTag(block.tag || "Geral");
    setOrderIndex(block.orderIndex || 0);
    recordHistory(block.content);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDuplicate = async (id: number) => {
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate", id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao duplicar.");
      toast.success(data.message || "Bloco duplicado com sucesso!");
      await fetchBlocks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao duplicar bloco.");
    }
  };

  const handleOpenRevisions = async (block: CmsBlock) => {
    try {
      setRevisionsBlockId(block.id);
      const res = await fetch(`/api/admin/cms?blockId=${block.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar revisões.");
      setActiveRevisions(data.revisions || []);
      setRevisionsModalOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar histórico.");
    }
  };

  const handleRestoreRevision = async (revId: number) => {
    if (!revisionsBlockId) return;
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", id: revId, blockId: revisionsBlockId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao restaurar versão.");
      toast.success(data.message || "Versão anterior restaurada com sucesso!");
      setRevisionsModalOpen(false);
      await fetchBlocks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao restaurar versão.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Deseja realmente excluir este bloco de conteúdo do CMS?")) return;
    try {
      const res = await fetch(`/api/admin/cms?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao excluir.");
      toast.success(data.message || "Bloco removido.");
      setBlocks((current) => current.filter((b) => b.id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir bloco.");
    }
  };

  const handleResetForm = () => {
    setEditingId(null);
    setPageKey("home");
    setSectionKey("");
    setTitle("");
    setContent("");
    setStatus("published");
    setContentType("text");
    setTag("Geral");
    setOrderIndex(0);
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-red-500" size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 pb-16">
      <input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*,.pdf" className="sr-only" onChange={handleFileUpload} />

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1.5 mb-2">
              <ArrowLeft size={15} /> Voltar ao Painel Administrativo
            </Link>
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400"><span>Admin</span><span>/</span><span>CMS</span><span>/</span><span className="text-red-600">{activeTab === "content" ? "Conteúdo" : activeTab === "media" ? "Biblioteca de mídia" : "Engajamento"}</span></div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Globe className="text-red-600" size={30} /> CMS Global & Biblioteca de Conteúdo
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Gerenciamento universal de conteúdo com histórico de revisões, editor visual rico, status, tags e duplicação em tempo real.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2.5 rounded-2xl">
            <Layers className="text-red-600" size={18} />
            <span className="text-xs font-bold text-red-800">Banco de Dados & Supabase Storage</span>
          </div>
        </div>
      </div>

      {/* Abas Superiores do CMS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-sm">
          <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Seções do CMS">
            {[
              { id: "content" as const, label: "Conteúdo", description: "Editar e publicar blocos", icon: Edit3 },
              { id: "media" as const, label: "Biblioteca de mídia", description: "Imagens, áudio e documentos", icon: Folder },
              { id: "analytics" as const, label: "Engajamento", description: "Consultar dados reais", icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-center transition sm:flex-row sm:justify-start sm:px-4 sm:py-3 sm:text-left ${active ? "bg-red-600 text-white shadow-md shadow-red-600/20" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-xl sm:h-9 sm:w-9 ${active ? "bg-white/15" : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400"}`}>
                    <Icon size={17} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[10px] font-black sm:text-xs">{tab.label}</span>
                    <span className={`mt-0.5 hidden truncate text-[10px] sm:block ${active ? "text-red-100" : "text-slate-500 dark:text-slate-400"}`}>{tab.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {activeTab === "media" ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
          <MediaAssetLibrary />
        </div>
      ) : activeTab === "analytics" ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
          <CMSEngagementAnalytics />
        </div>
      ) : (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Criação/Edição Avançado */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm sticky top-24 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Edit3 className="text-red-600" size={16} /> {editingId ? "Editar Bloco Avançado" : "Novo Bloco de Conteúdo"}
              </h2>
              {editingId && (
                <Button variant="ghost" size="sm" onClick={handleResetForm} className="text-xs text-slate-400 hover:text-red-600">
                  Cancelar
                </Button>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Área / Página Alvo</label>
                <select
                  value={pageKey}
                  onChange={(e) => setPageKey(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:bg-white focus:border-red-600"
                >
                  {PAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="published">Publicado</option>
                    <option value="draft">Rascunho</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Tag / Categoria</label>
                  <Input
                    placeholder="ex: Destaque, Hero, FAQ"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold h-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Chave da Seção (slug único)</label>
                <Input
                  placeholder="ex: hero_title, banner_text"
                  value={sectionKey}
                  onChange={(e) => setSectionKey(e.target.value)}
                  disabled={Boolean(editingId)}
                  className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Título Amigável do Bloco</label>
                <Input
                  placeholder="ex: Título Principal da Home"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Conteúdo (Editor Rico)</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyFormatting("bold")}
                      className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-slate-700 dark:text-slate-300"
                      title="Negrito"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormatting("italic")}
                      className="px-1.5 py-0.5 text-[10px] italic bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-slate-700 dark:text-slate-300"
                      title="Itálico"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormatting("h2")}
                      className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-slate-700 dark:text-slate-300"
                      title="Título H2"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormatting("bullet")}
                      className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-slate-700 dark:text-slate-300"
                      title="Lista"
                    >
                      • List
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormatting("link")}
                      className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-slate-700 dark:text-slate-300"
                      title="Inserir Link"
                    >
                      Link
                    </button>
                    <button type="button" onClick={handleUndo} disabled={historyIndex <= 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-30" title="Desfazer">
                      <Undo2 size={13} />
                    </button>
                    <button type="button" onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-30" title="Refazer">
                      <Redo2 size={13} />
                    </button>
                  </div>
                </div>
                <Textarea
                  placeholder="Digite o texto ou markdown formatado..."
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  rows={6}
                  className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl text-xs font-normal font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreviewOpen(true)}
                  className="w-full border-slate-200 dark:border-slate-800 font-bold text-xs h-11 rounded-xl gap-1.5 hover:bg-slate-50"
                >
                  <Eye size={15} className="text-red-600" /> Pré-visualizar
                </Button>
                <Button type="submit" disabled={saving} className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs h-11 rounded-xl shadow-md shadow-red-600/20 gap-1.5">
                  {saving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
                  Salvar Bloco
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Gerenciador de Mídia e Listagem Avançada com Filtros e Busca */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPageFilter === "brand" && <BrandEditor />}

          {/* Gerenciador de Mídia com Drag & Drop */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`bg-white dark:bg-slate-900 rounded-3xl border-2 p-6 shadow-sm space-y-4 transition-all ${isDragging ? "border-red-500 dark:border-red-600 bg-red-50/40 dark:bg-red-950/20 scale-[1.01]" : "border-slate-200 dark:border-slate-800"}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Folder className="text-red-600" size={18} />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Gerenciador de Mídia (Arraste arquivos aqui)</h3>
              </div>
              <Button onClick={() => fileInputRef.current?.click()} size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-9 rounded-xl gap-1.5">
                <UploadCloud size={14} /> Enviar Arquivo
              </Button>
            </div>

            {uploadingMedia && (
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div className="bg-red-600 h-2.5 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}

            <div className="rounded-2xl border border-red-100 dark:border-red-900/50 bg-red-50/60 dark:bg-red-950/20 p-4 text-xs text-slate-600 dark:text-slate-400">
              <p className="font-bold text-slate-800 dark:text-slate-200">A biblioteca completa usa dados paginados e filtros no servidor.</p>
              <p className="mt-1">Para pesquisar, visualizar ou copiar ativos já persistidos, abra a aba Biblioteca de mídia. O upload abaixo continua disponível para inserir rapidamente um arquivo real no bloco em edição.</p>
              <Button type="button" variant="outline" onClick={() => setActiveTab("media")} className="mt-3 h-9 rounded-xl border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-900 text-xs font-bold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40">Abrir biblioteca paginada</Button>
            </div>
          </div>
          
          {/* Barra de Filtros, Busca e Ferramentas de Backup JSON */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  placeholder="Pesquisar por título, chave ou conteúdo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold h-10"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 h-10"
                >
                  <option value="all">Todos os Status</option>
                  <option value="published">Publicado</option>
                  <option value="draft">Rascunho</option>
                </select>
                <select
                  value={selectedPageFilter}
                  onChange={(e) => setSelectedPageFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 h-10"
                >
                  <option value="all">Todas as Páginas</option>
                  {PAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(blocks, null, 2));
                    const downloadAnchor = document.createElement("a");
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", `cms_backup_${Date.now()}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                    toast.success("Backup JSON exportado com sucesso!");
                  }}
                  className="h-10 px-3 text-xs font-bold border-slate-200 dark:border-slate-800 gap-1.5 hover:bg-slate-50"
                >
                  Exportar JSON
                </Button>
              </div>
            </div>
          </div>

          {filteredBlocks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center space-y-3">
              <Layers className="mx-auto text-slate-400" size={40} />
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">Nenhum bloco encontrado</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Use o formulário ao lado para cadastrar textos, títulos e informações para qualquer área do site.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBlocks.map((b) => (
                <div key={b.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:border-red-200 transition space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-50 text-red-700 uppercase tracking-wide">
                          {b.pageKey}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.status === "published" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300" : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"}`}>
                          {b.status === "published" ? "Publicado" : "Rascunho"}
                        </span>
                        <code className="text-[11px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">{b.sectionKey}</code>
                      </div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">{b.title}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => handleOpenRevisions(b)} className="h-9 px-2.5 text-xs font-bold border-slate-200 dark:border-slate-800 gap-1 hover:bg-slate-50">
                        <History size={13} className="text-blue-600" /> Histórico
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDuplicate(b.id)} className="h-9 px-2.5 text-xs font-bold border-slate-200 dark:border-slate-800 gap-1 hover:bg-slate-50">
                        <Copy size={13} className="text-emerald-600" /> Duplicar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(b)} className="h-9 px-2.5 text-xs font-bold border-slate-200 dark:border-slate-800 gap-1 hover:bg-slate-50">
                        <Edit3 size={13} className="text-red-600" /> Editar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(b.id)} className="h-9 px-2.5 text-xs font-bold border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 gap-1">
                        <Trash2 size={13} /> Excluir
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap font-mono">
                    {b.content}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Atualizado em: {new Date(b.updatedAt).toLocaleString("pt-BR")}</span>
                    <span className="font-semibold text-slate-500 dark:text-slate-400">ID #{b.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Modal de Histórico de Revisões e Restauração */}
      {revisionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <History className="text-blue-600" size={20} />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Histórico de Versões e Revisões</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setRevisionsModalOpen(false)} className="h-8 w-8 p-0 rounded-full">
                <X size={18} />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {activeRevisions.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-8 text-center">Nenhuma revisão anterior registrada para este bloco.</p>
              ) : (
                activeRevisions.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{rev.title}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock size={11} /> {new Date(rev.createdAt).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-mono truncate max-w-md">{rev.content}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleRestoreRevision(rev.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 rounded-xl shrink-0 gap-1"
                    >
                      Restaurar Versão
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setRevisionsModalOpen(false)} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl">
                Fechar Histórico
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pré-visualização Responsiva em Tempo Real */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Eye className="text-red-600" size={20} />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Pré-visualização Responsiva em Tempo Real</h3>
              </div>
              
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${previewDevice === "mobile" ? "bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                >
                  <Smartphone size={14} /> Celular
                </button>
                <button
                  onClick={() => setPreviewDevice("tablet")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${previewDevice === "tablet" ? "bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                >
                  <Tablet size={14} /> Tablet
                </button>
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${previewDevice === "desktop" ? "bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                >
                  <Monitor size={14} /> Desktop
                </button>
              </div>

              <Button variant="ghost" size="sm" onClick={() => setPreviewOpen(false)} className="h-8 w-8 p-0 rounded-full">
                <X size={18} />
              </Button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div
                className={`transition-all duration-300 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-300 dark:border-slate-700 overflow-hidden ${
                  previewDevice === "mobile" ? "w-full max-w-[375px] h-[600px]" : previewDevice === "tablet" ? "w-full max-w-[768px] h-[550px]" : "w-full h-full min-h-[400px]"
                } p-6 flex flex-col`}
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400">Página: {pageKey}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Preview ao vivo</span>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">{title || "Título de Exemplo"}</h2>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-100 dark:border-slate-800">
                    {content || "Conteúdo do bloco aparecerá aqui..."}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setPreviewOpen(false)} className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-6 py-2.5 rounded-xl">
                Fechar Pré-visualização
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
