"use client";

import { useEffect, useRef, useState } from "react";
import { Image, Music, Upload, Trash2, Copy, Search, Check, Folder, FileUp, Loader2, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MediaAsset {
  id: number;
  name: string;
  type: string;
  url: string;
  fileKey: string;
  size: string;
  uploadedAt: string;
  tag: string;
}

interface MediaPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

const EMPTY_PAGINATION: MediaPagination = {
  page: 1,
  pageSize: 24,
  total: 0,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

export function MediaAssetLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [pagination, setPagination] = useState<MediaPagination>(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [filterTag, setFilterTag] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestControllerRef = useRef<AbortController | null>(null);
  const uploadControllerRef = useRef<AbortController | null>(null);

  const cancelUpload = () => {
    uploadControllerRef.current?.abort();
    setUploading(false);
    setUploadProgress(0);
    setUploadFileName("");
    toast.info("Upload cancelado pelo usuário.");
  };

  const fetchAssets = async (page = 1) => {
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(EMPTY_PAGINATION.pageSize),
      });
      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      if (filterType !== "all") params.set("type", filterType);
      if (filterTag !== "all") params.set("tag", filterTag);

      const res = await fetch(`/api/admin/media?${params.toString()}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível carregar a biblioteca.");

      setAssets(Array.isArray(data.assets) ? data.assets : []);
      setPagination(data.pagination ?? EMPTY_PAGINATION);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("Erro ao carregar ativos de mídia:", error);
      setAssets([]);
      toast.error(error instanceof Error ? error.message : "Erro ao carregar a biblioteca de mídia.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchAssets(1);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [searchTerm, filterType, filterTag]);

  useEffect(() => () => requestControllerRef.current?.abort(), []);

  const handleCopyUrl = async (url: string, id: number) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("URL do arquivo copiada para a área de transferência!");
    window.setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Deseja realmente remover este arquivo do Supabase Storage e da biblioteca de mídia?")) return;
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Erro ao excluir arquivo.");
      toast.success("Arquivo removido com sucesso.");
      await fetchAssets(pagination.page);
    } catch (error) {
      console.error("Erro ao excluir arquivo:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao conectar com o servidor.");
    }
  };

  const processFiles = async (files: FileList | File[]) => {
    uploadControllerRef.current?.abort();
    const controller = new AbortController();
    uploadControllerRef.current = controller;

    setUploading(true);
    setUploadProgress(0);
    try {
      const fileList = Array.from(files);
      const totalFiles = fileList.length;

      for (let i = 0; i < totalFiles; i++) {
        if (controller.signal.aborted) break;
        const file = fileList[i];
        setUploadFileName(file.name);
        setUploadProgress(Math.round((i / totalFiles) * 100));

        let assetType = "image";
        if (file.type.includes("audio") || file.name.endsWith(".mp3") || file.name.endsWith(".wav")) {
          assetType = "audio";
        } else if (file.name.toLowerCase().includes("badge") || file.name.toLowerCase().includes("medal")) {
          assetType = "medal";
        } else if (file.type === "application/pdf") {
          assetType = "document";
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", assetType);
        formData.append("tag", assetType === "medal" ? "Conquista" : assetType === "audio" ? "Speaking" : "Geral");

        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Erro no upload.");
        
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      if (!controller.signal.aborted) {
        toast.success("Arquivo(s) enviado(s) e persistido(s) com sucesso!");
        await fetchAssets(1);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("Erro no upload:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao enviar arquivos.");
    } finally {
      if (!controller.signal.aborted) {
        setUploading(false);
        setUploadProgress(0);
        setUploadFileName("");
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files.length > 0) void processFiles(event.dataTransfer.files);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) void processFiles(event.target.files);
    event.target.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Folder className="text-red-600" size={20} /> Biblioteca de Mídia Persistida (Supabase Storage)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Gerencie ativos reais de áudio, medalhas e imagens da plataforma.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple accept="image/*,audio/*,.pdf" className="hidden" />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm gap-2 transition-all active:scale-95">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploading ? "Enviando para o Storage..." : "Selecionar ou Arrastar Arquivos"}
            </Button>
          </div>
        </div>

        {uploading ? (
          <div className="rounded-3xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-6 text-center space-y-4 shadow-inner">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="text-red-600 animate-spin" size={24} />
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Enviando arquivos...</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">{uploadFileName || "Preparando arquivo..."}</p>
              </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div className="bg-red-600 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} role="progressbar" aria-valuenow={uploadProgress} aria-valuemin={0} aria-valuemax={100} />
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 items-center">
              <span>Progresso do envio</span>
              <div className="flex items-center gap-3">
                <span>{uploadProgress}%</span>
                <Button type="button" variant="outline" size="sm" onClick={cancelUpload} className="h-7 text-xs font-bold border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 px-3 rounded-lg">
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 ${isDragging ? "border-red-600 bg-red-50/50 dark:bg-red-950/20 scale-[1.01]" : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-red-500 dark:hover:border-red-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
            <div className="max-w-xs mx-auto space-y-3">
              <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center transition-colors ${isDragging ? "bg-red-600 text-white shadow-lg shadow-red-600/30" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"}`}><FileUp size={24} /></div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{isDragging ? "Solte os arquivos aqui..." : "Arraste e solte arquivos aqui para upload real"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Imagens (.png, .jpg, .webp), áudios (.mp3, .wav) e PDF até 10 MB</p>
              </div>
              <span className="inline-block text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/50 px-3 py-1 rounded-full">Ou clique para procurar no computador</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} aria-hidden="true" />
            <Input aria-label="Pesquisar arquivos de mídia" placeholder="Pesquisar arquivo por nome ou tag..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="pl-10 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs font-semibold h-10" />
          </div>
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            <select aria-label="Filtrar por tipo" value={filterType} onChange={(event) => setFilterType(event.target.value)} className="bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 h-10">
              <option value="all">Todos os Tipos</option>
              <option value="medal">Medalhas & Badges</option>
              <option value="audio">Áudios (Speaking)</option>
              <option value="image">Imagens Gerais</option>
              <option value="document">Documentos</option>
            </select>
            <select aria-label="Filtrar por tag" value={filterTag} onChange={(event) => setFilterTag(event.target.value)} className="bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 h-10">
              <option value="all">Todas as Tags</option>
              <option value="Gramática">Gramática</option>
              <option value="Speaking">Speaking</option>
              <option value="Listening">Listening</option>
              <option value="Conquista">Conquista</option>
              <option value="Geral">Geral</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>{pagination.total} arquivo(s) encontrado(s)</span>
          <span>Página {pagination.page} de {pagination.totalPages}</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs font-semibold flex items-center justify-center gap-2" role="status" aria-live="polite"><Loader2 size={18} className="animate-spin text-red-600" /> Carregando ativos da biblioteca...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {assets.map((asset) => (
                <div key={asset.id} className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-red-600 shadow-sm">
                      {asset.type === "audio" ? <Music size={18} /> : asset.type === "document" ? <FileText size={18} /> : <Image size={18} />}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">{asset.tag}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={asset.name}>{asset.name}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400"><span>{asset.size}</span><span>{new Date(asset.uploadedAt).toLocaleDateString("pt-BR")}</span></div>
                  </div>
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <Button variant="outline" size="sm" onClick={() => void handleCopyUrl(asset.url, asset.id)} className="flex-1 h-8 text-xs font-bold rounded-xl gap-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700">{copiedId === asset.id ? <Check size={13} className="text-green-600" /> : <Copy size={13} />} Copiar URL</Button>
                    <Button variant="outline" size="sm" onClick={() => void handleDelete(asset.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl border-slate-200 dark:border-slate-700" title="Excluir arquivo" aria-label={`Excluir ${asset.name}`}><Trash2 size={13} /></Button>
                  </div>
                </div>
              ))}
              {assets.length === 0 && <div className="col-span-full py-12 text-center text-slate-400 text-xs font-semibold">Nenhum arquivo encontrado na biblioteca persistida.</div>}
            </div>

            {pagination.totalPages > 1 && (
              <nav className="flex items-center justify-center gap-3 pt-2" aria-label="Paginação da biblioteca de mídia">
                <Button variant="outline" size="sm" disabled={!pagination.hasPreviousPage || loading} onClick={() => void fetchAssets(pagination.page - 1)} className="rounded-xl gap-1"><ChevronLeft size={14} /> Anterior</Button>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{pagination.page} / {pagination.totalPages}</span>
                <Button variant="outline" size="sm" disabled={!pagination.hasNextPage || loading} onClick={() => void fetchAssets(pagination.page + 1)} className="rounded-xl gap-1">Próxima <ChevronRight size={14} /></Button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
