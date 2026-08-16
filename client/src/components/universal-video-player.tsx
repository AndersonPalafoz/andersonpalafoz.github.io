import React, { useState } from "react";
import { Gauge, Bookmark, Youtube, Sparkles, Clock, Trash2, Edit3 } from "lucide-react";

interface UniversalVideoPlayerProps {
  url: string;
  title?: string;
}

interface VideoNote {
  time: number;
  timeFormatted: string;
  note: string;
}

export function UniversalVideoPlayer({ url, title = "Videoaula" }: UniversalVideoPlayerProps) {
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const currentTimeSeconds = 45; // fixed mock active playback timestamp
  const [currentNote, setCurrentNote] = useState<string>("");
  const [savedNotes, setSavedNotes] = useState<VideoNote[]>([
    { time: 15, timeFormatted: "0:15", note: "Explicação principal sobre Present Perfect" },
    { time: 45, timeFormatted: "0:45", note: "Exemplo prático de conversação com nativos" }
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

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const handleSaveNoteAtCurrentTime = () => {
    if (!currentNote.trim()) return;
    const newNote: VideoNote = {
      time: currentTimeSeconds,
      timeFormatted: formatTime(currentTimeSeconds),
      note: currentNote.trim()
    };
    setSavedNotes([...savedNotes, newNote].sort((a, b) => a.time - b.time));
    setCurrentNote("");
  };

  const handleDeleteNote = (index: number) => {
    setSavedNotes(savedNotes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
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
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bookmark size={18} className="text-red-500" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Notas de Estudo Vinculadas ao Tempo</h4>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-[11px] font-bold">
            <Clock size={13} /> Momento atual: {formatTime(currentTimeSeconds)}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Edit3 className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Escreva sua anotação vinculada ao minuto atual da aula..."
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              onClick={handleSaveNoteAtCurrentTime}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-1.5 shrink-0"
            >
              <Sparkles size={15} /> Salvar Nota no Tempo {formatTime(currentTimeSeconds)}
            </button>
          </div>

          <div className="space-y-2 pt-2">
            {savedNotes.map((sn, i) => (
              <div key={i} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono bg-red-500/10 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-lg font-bold">
                    ⏱ {sn.timeFormatted}
                  </span>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">{sn.note}</span>
                </div>
                <button
                  onClick={() => handleDeleteNote(i)}
                  className="text-slate-400 hover:text-red-600 transition-colors p-1"
                  title="Excluir nota"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {savedNotes.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">Nenhuma anotação salva ainda. Use o campo acima para registrar observações durante a aula.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
