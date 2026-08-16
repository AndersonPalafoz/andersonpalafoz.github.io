"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Trash2, Edit3, Save, Search, Globe, Layers, Loader2, ArrowLeft, Eye, UploadCloud, X } from "lucide-react";
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
  updatedAt: string;
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

export default function AdminCmsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [blocks, setBlocks] = useState<CmsBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPageFilter, setSelectedPageFilter] = useState("all");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [pageKey, setPageKey] = useState("home");
  const [sectionKey, setSectionKey] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

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

  const filteredBlocks = useMemo(() => {
    return blocks.filter((b) => {
      if (selectedPageFilter !== "all" && b.pageKey !== selectedPageFilter) return false;
      if (searchTerm && !b.title.toLowerCase().includes(searchTerm.toLowerCase()) && !b.sectionKey.toLowerCase().includes(searchTerm.toLowerCase()) && !b.content.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [blocks, selectedPageFilter, searchTerm]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingMedia(true);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar imagem.");
      
      const fileUrl = data.url;
      setContent((prev) => (prev ? `${prev}\n${fileUrl}` : fileUrl));
      toast.success("Mídia enviada e inserida com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar arquivo.");
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageKey || !sectionKey || !title || !content) {
      toast.error("Preencha todos os campos do bloco de conteúdo.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageKey, sectionKey, title, content }),
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*,.pdf" className="sr-only" onChange={handleFileUpload} />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm font-bold text-red-600 hover:underline flex items-center gap-1.5 mb-2">
              <ArrowLeft size={16} /> Voltar ao Painel Administrativo
            </Link>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Globe className="text-red-600" size={32} /> CMS Global — Editor de Todo o Site
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Gerencie textos, títulos, chamadas, banners, mídias e informações de qualquer página ou área da plataforma.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Criação/Edição */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <Edit3 className="text-red-600" size={18} /> {editingId ? "Editar Bloco CMS" : "Novo Bloco de Conteúdo"}
              </h2>
              {editingId && (
                <Button variant="ghost" size="sm" onClick={handleResetForm} className="text-xs text-gray-500 hover:text-red-600">
                  Cancelar
                </Button>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Área / Página Alvo</label>
                <select
                  value={pageKey}
                  onChange={(e) => setPageKey(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:bg-white focus:border-red-600"
                >
                  {PAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Chave da Seção (slug único)</label>
                <Input
                  placeholder="ex: hero_title, banner_text, footer_about"
                  value={sectionKey}
                  onChange={(e) => setSectionKey(e.target.value)}
                  disabled={Boolean(editingId)}
                  className="bg-gray-50 border-gray-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Título Amigável do Bloco</label>
                <Input
                  placeholder="ex: Título Principal da Home"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-gray-50 border-gray-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase">Conteúdo</label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingMedia}
                    className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                  >
                    <UploadCloud size={14} /> {uploadingMedia ? "Enviando..." : "Inserir Mídia do PC"}
                  </button>
                </div>
                <Textarea
                  placeholder="Digite aqui o texto ou conteúdo..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  className="bg-gray-50 border-gray-300 rounded-xl text-xs font-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreviewOpen(true)}
                  className="w-full border-gray-300 font-bold text-xs h-11 rounded-xl gap-1.5"
                >
                  <Eye size={15} className="text-red-600" /> Pré-visualizar
                </Button>
                <Button type="submit" disabled={saving} className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs h-11 rounded-xl shadow-md shadow-red-600/20 gap-1.5">
                  {saving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Lista de Blocos Cadastrados */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPageFilter === "brand" && <BrandEditor />}
          
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Pesquisar por título, chave ou conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-300 rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <select
                value={selectedPageFilter}
                onChange={(e) => setSelectedPageFilter(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-800"
              >
                <option value="all">Todas as páginas ({blocks.length})</option>
                {PAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredBlocks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center space-y-3">
              <Layers className="mx-auto text-gray-400" size={40} />
              <p className="text-base font-bold text-gray-800">Nenhum bloco encontrado</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">Use o formulário ao lado para cadastrar textos, títulos e informações para qualquer área do site.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBlocks.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:border-red-200 transition space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-50 text-red-700 uppercase tracking-wide">
                          {b.pageKey}
                        </span>
                        <code className="text-[11px] font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">{b.sectionKey}</code>
                      </div>
                      <h3 className="text-base font-black text-gray-900 mt-1">{b.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(b)} className="h-9 px-3 text-xs font-bold border-gray-300 gap-1.5">
                        <Edit3 size={14} className="text-red-600" /> Editar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(b.id)} className="h-9 px-3 text-xs font-bold border-red-200 text-red-700 hover:bg-red-50 gap-1.5">
                        <Trash2 size={14} /> Excluir
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100 whitespace-pre-wrap font-mono">
                    {b.content}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                    <span>Atualizado em: {new Date(b.updatedAt).toLocaleString("pt-BR")}</span>
                    <span className="font-semibold text-gray-500">ID #{b.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Pré-visualização em Tempo Real */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <Eye className="text-red-600" size={20} />
                <h3 className="font-extrabold text-gray-900 text-base">Pré-visualização em Tempo Real</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPreviewOpen(false)} className="h-8 w-8 p-0 rounded-full">
                <X size={18} />
              </Button>
            </div>

            <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
              <div>
                <span className="text-[10px] font-black uppercase text-gray-400">Página / Seção</span>
                <p className="text-xs font-bold text-red-600">{pageKey} → {sectionKey || "sem-chave"}</p>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-gray-400">Título do Bloco</span>
                <h4 className="text-lg font-black text-gray-900">{title || "Sem título"}</h4>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-gray-400">Renderização do Conteúdo</span>
                <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {content || "Nenhum conteúdo digitado ainda."}
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
