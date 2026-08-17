import { useState, useRef } from "react";
import { Image, Music, Upload, Trash2, Copy, Search, Check, Folder, FileUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MediaAsset {
  id: string;
  name: string;
  type: "medal" | "audio" | "image";
  url: string;
  size: string;
  uploadedAt: string;
  tag: string;
}

const initialAssets: MediaAsset[] = [
  { id: "1", name: "badge-grammar-master.png", type: "medal", url: "/manus-storage/badge-grammar.png", size: "120 KB", uploadedAt: "15 Ago 2026", tag: "Gramática" },
  { id: "2", name: "badge-speaking-pro.png", type: "medal", url: "/manus-storage/badge-speaking.png", size: "145 KB", uploadedAt: "14 Ago 2026", tag: "Speaking" },
  { id: "3", name: "speaking-prompt-b1-audio.mp3", type: "audio", url: "/manus-storage/speaking-b1.mp3", size: "1.2 MB", uploadedAt: "12 Ago 2026", tag: "Áudio B1" },
  { id: "4", name: "listening-exercise-unit2.mp3", type: "audio", url: "/manus-storage/listening-unit2.mp3", size: "2.4 MB", uploadedAt: "10 Ago 2026", tag: "Listening" },
];

export function MediaAssetLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredAssets = assets.filter((asset) => {
    if (filterType !== "all" && asset.type !== filterType) return false;
    if (filterTag !== "all" && asset.tag !== filterTag) return false;
    if (searchTerm && !asset.name.toLowerCase().includes(searchTerm.toLowerCase()) && !asset.tag.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("URL do arquivo copiada para a área de transferência!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Deseja realmente remover este arquivo da biblioteca de mídia?")) return;
    setAssets((prev) => prev.filter((a) => a.id !== id));
    toast.success("Arquivo removido com sucesso.");
  };

  const processFiles = async (files: FileList | File[]) => {
    setUploading(true);
    try {
      const newAssets: MediaAsset[] = [];
      for (const file of Array.from(files)) {
        let assetType: "medal" | "audio" | "image" = "image";
        if (file.type.includes("audio") || file.name.endsWith(".mp3") || file.name.endsWith(".wav")) {
          assetType = "audio";
        } else if (file.name.includes("badge") || file.name.includes("medal")) {
          assetType = "medal";
        }

        const sizeKb = (file.size / 1024).toFixed(1);
        const sizeStr = Number(sizeKb) > 1024 ? `${(Number(sizeKb) / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

        const newAsset: MediaAsset = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          type: assetType,
          url: `/manus-storage/${file.name}`,
          size: sizeStr,
          uploadedAt: "Agora mesmo",
          tag: assetType === "medal" ? "Conquista" : assetType === "audio" ? "Speaking" : "Geral",
        };
        newAssets.push(newAsset);
      }

      setAssets((prev) => [...newAssets, ...prev]);
      toast.success(`${newAssets.length} arquivo(s) enviado(s) e indexado(s) com sucesso!`);
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao enviar arquivos.");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Folder className="text-red-600" size={20} /> Biblioteca de Mídia (Medalhas & Áudios)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Gerencie ícones de conquistas, medalhas dos quizzes e áudios do assistente virtual de speaking.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/*,audio/*,.pdf"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm gap-2 transition-all active:scale-95"
            >
              <Upload size={14} /> {uploading ? "Enviando..." : "Selecionar ou Arrastar Arquivos"}
            </Button>
          </div>
        </div>

        {/* Zona de Drag and Drop */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-red-600 bg-red-50/50 dark:bg-red-950/20 scale-[1.01]"
              : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-red-500 dark:hover:border-red-500 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <div className="max-w-xs mx-auto space-y-3">
            <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center transition-colors ${isDragging ? "bg-red-600 text-white shadow-lg shadow-red-600/30" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"}`}>
              <FileUp size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {isDragging ? "Solte os arquivos aqui..." : "Arraste e solte arquivos aqui"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Suporta imagens (.png, .jpg), áudios (.mp3, .wav) e documentos (.pdf)
              </p>
            </div>
            <span className="inline-block text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/50 px-3 py-1 rounded-full">
              Ou clique para procurar no computador
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="Pesquisar arquivo por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl text-xs font-semibold h-10"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 h-10"
            >
              <option value="all">Todos os Tipos</option>
              <option value="medal">Medalhas & Badges</option>
              <option value="audio">Áudios (Speaking)</option>
              <option value="image">Imagens Gerais</option>
            </select>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 h-10"
            >
              <option value="all">Todas as Tags</option>
              <option value="Gramática">Gramática</option>
              <option value="Speaking">Speaking</option>
              <option value="Listening">Listening</option>
              <option value="Conquista">Conquista</option>
              <option value="Geral">Geral</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-red-600 shadow-sm">
                  {asset.type === "audio" ? <Music size={18} /> : <Image size={18} />}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {asset.tag}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={asset.name}>{asset.name}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{asset.size}</span>
                  <span>{asset.uploadedAt}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUrl(asset.url, asset.id)}
                  className="flex-1 h-8 text-xs font-bold rounded-xl gap-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  {copiedId === asset.id ? <Check size={13} className="text-green-600" /> : <Copy size={13} />} Copiar URL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(asset.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl border-slate-200 dark:border-slate-700"
                  title="Excluir arquivo"
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
          ))}
          {filteredAssets.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs font-semibold">
              Nenhum arquivo encontrado com os filtros atuais.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
