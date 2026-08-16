import React, { useState } from "react";
import { Gauge, Bookmark, Youtube, Sparkles } from "lucide-react";

interface UniversalVideoPlayerProps {
  url: string;
  title?: string;
}

export function UniversalVideoPlayer({ url, title = "Videoaula" }: UniversalVideoPlayerProps) {
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [markers, setMarkers] = useState<number[]>([15, 45, 90]);
  const [currentNote, setCurrentNote] = useState<string>("");
  const [savedNotes, setSavedNotes] = useState<{ time: number; note: string }[]>([
    { time: 15, note: "Explicação principal sobre Present Perfect" },
    { time: 45, note: "Exemplo prático com conversação" }
  ]);

  const getEmbedUrl = (rawUrl: string) => {
    if (!rawUrl) return "";
    const ytMatch = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?enablejsapi=1&autoplay=0`;
    }
    const vimeoMatch = rawUrl.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:\w+\/)?videos\/|video\/|)(\d+)(?:|\/\?))/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return rawUrl;
  };

  const embedUrl = getEmbedUrl(url);

  const handleAddMarker = (seconds: number) => {
    if (!markers.includes(seconds)) {
      setMarkers([...markers, seconds].sort((a, b) => a - b));
    }
  };

  const handleSaveNote = () => {
    if (!currentNote.trim()) return;
    setSavedNotes([...savedNotes, { time: 30, note: currentNote }]);
    setCurrentNote("");
  };

  return (
    <div className="space-y-4">
      <div className="w-full aspect-video rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black shadow-2xl relative">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <Youtube size={36} className="text-red-500" />
            <span className="text-xs font-bold">Nenhum vídeo compatível carregado. Insira um link válido do YouTube ou Vimeo.</span>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-red-600/10 dark:bg-red-600/20 text-red-600 dark:text-red-400 flex items-center justify-center font-black text-xs">
            <Gauge size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Velocidade de Reprodução</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Ajuste o ritmo da aula para facilitar o listening</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
            <button
              key={rate}
              onClick={() => setPlaybackRate(rate)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                playbackRate === rate
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark size={18} className="text-red-500" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Marcadores e Notas de Estudo</h4>
          </div>
          <button
            onClick={() => handleAddMarker(65)}
            className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
          >
            <Sparkles size={14} /> Marcar Momento Atual
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {markers.map((m, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs"
            >
              ⏱ {Math.floor(m / 60)}:{String(m % 60).padStart(2, "0")}
            </span>
          ))}
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Adicionar nota vinculada ao minuto da aula..."
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={handleSaveNote}
              className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition-colors shadow-md shadow-red-600/20"
            >
              Salvar Nota
            </button>
          </div>

          <div className="space-y-1.5 pt-1">
            {savedNotes.map((sn, i) => (
              <div key={i} className="flex items-center justify-between bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                <span className="font-mono text-red-500 font-bold">
                  {Math.floor(sn.time / 60)}:{String(sn.time % 60).padStart(2, "0")}
                </span>
                <span className="flex-1 px-3 text-slate-700 dark:text-slate-300">{sn.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
