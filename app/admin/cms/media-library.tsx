import React, { useState } from "react";
import { Image, Music, Upload, Trash2, Copy, Search, Check, Folder } from "lucide-react";
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

  const handleSimulatedUpload = (type: "medal" | "audio" | "image") => {
    const name = type === "medal" ? `badge-custom-${Date.now()}.png` : type === "audio" ? `speaking-audio-${Date.now()}.mp3` : `image-${Date.now()}.jpg`;
    const newAsset: MediaAsset = {
      id: String(Date.now()),
      name,
      type,
      url: `/manus-storage/${name}`,
      size: "850 KB",
      uploadedAt: "Agora mesmo",
      tag: type === "medal" ? "Conquista" : "Geral",
    };
    setAssets([newAsset, ...assets]);
    toast.success(`Novo arquivo (${type}) enviado e indexado na biblioteca!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Folder className="text-red-600" size={20} /> Biblioteca de Mídia (Medalhas & Áudios)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Gerencie ícones de conquistas, medalhas dos quizzes e áudios do assistente virtual de speaking.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => handleSimulatedUpload("medal")}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-sm gap-1.5"
            >
              <Upload size={14} /> Enviar Medalha
            </Button>
            <Button
              onClick={() => handleSimulatedUpload("audio")}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-sm gap-1.5"
            >
              <Upload size={14} /> Enviar Áudio
            </Button>
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
              <option value="Áudio B1">Áudio B1</option>
              <option value="Listening">Listening</option>
              <option value="Conquista">Conquista</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-28 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center relative overflow-hidden">
                  {asset.type === "medal" ? (
                    <div className="text-4xl">🏅</div>
                  ) : asset.type === "audio" ? (
                    <Music className="text-red-600" size={32} />
                  ) : (
                    <Image className="text-slate-400" size={32} />
                  )}
                  <span className="absolute top-2 right-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-900/80 text-white">
                    {asset.type}
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate" title={asset.name}>{asset.name}</h4>
                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full shrink-0">
                      {asset.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{asset.size} • {asset.uploadedAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUrl(asset.url, asset.id)}
                  className="flex-1 h-8 text-[11px] font-bold border-slate-200 dark:border-slate-700 gap-1"
                >
                  {copiedId === asset.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  {copiedId === asset.id ? "Copiado" : "Copiar URL"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(asset.id)}
                  className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50"
                  title="Excluir arquivo"
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
