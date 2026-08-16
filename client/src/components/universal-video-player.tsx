import React, { useState } from "react";
import { Gauge, Bookmark, Youtube, Sparkles, Clock, Trash2, Edit3, PlayCircle } from "lucide-react";

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
  const [jumpedTime, setJumpedTime] = useState<number | null>(null);
  const [savedNotes, setSavedNotes] = useState<VideoNote[]>([
    { time: 15, timeFormatted: "0:15", note: "Explicação principal sobre Present Perfect" },
    { time: 45, timeFormatted: "0:45", note: "Exemplo prático de conversação com nativos" }
  ]);

  const getEmbedUrl = (rawUrl: string, jumpTo?: number | null) => {
    if (!rawUrl) return "";
    const ytMatch = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      const startParam = jumpTo ? `&start=${jumpTo}` : "";
      return `https://www.youtube.com/embed/${ytMatch[1]}?enablejsapi=1&autoplay=0${startParam}`;
    }
    const vimeoMatch = rawUrl.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:\w+\/)?videos\/|video\/|)(\d+)(?:|\/\?))/);
    if (vimeoMatch && vimeoMatch[1]) {
      const timeParam = jumpTo ? `#t=${jumpTo}s` : "";
      return `https://player.vimeo.com/video/${vimeoMatch[1]}${timeParam}`;
    }
    return rawUrl;
  };

  const embedUrl = getEmbedUrl(url, jumpedTime);

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

  const handleJumpToTime = (time: number) => {
    setJumpedTime(time);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Player e Controles Principais (2 colunas) */}
      <div className="lg:col-span-2 space-y-6">
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

        {/* Controles de Velocidade */}
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

        {/* Adicionar Nova Anotação */}
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Bookmark size={18} className="text-red-500" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Registrar Nota de Estudo</h4>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-[11px] font-bold">
              <Clock size={13} /> Momento: {formatTime(currentTimeSeconds)}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Edit3 className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Escreva sua anotação vinculada ao minuto atual..."
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              onClick={handleSaveNoteAtCurrentTime}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-1.5 shrink-0"
            >
              <Sparkles size={15} /> Salvar Nota
            </button>
          </div>
        </div>
      </div>

      {/* Barra Lateral de Anotações Clicáveis (1 coluna) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col h-full max-h-[600px]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bookmark size={18} className="text-red-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Anotações da Aula</h3>
          </div>
          <span className="text-xs font-bold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-lg">
            {savedNotes.length} notas
          </span>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 py-3">
          Clique em qualquer marcador de tempo para saltar diretamente para aquele ponto no vídeo.
        </p>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {savedNotes.map((sn, i) => (
            <div
              key={i}
              className="bg-slate-50 dark:bg-slate-800/60 hover:bg-red-50/50 dark:hover:bg-red-950/20 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-3.5 transition-all group flex flex-col gap-2 cursor-pointer"
              onClick={() => handleJumpToTime(sn.time)}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 font-mono bg-red-600 text-white px-2.5 py-0.5 rounded-lg text-[11px] font-bold shadow-xs group-hover:bg-red-700 transition-colors">
                  <PlayCircle size={13} /> {sn.timeFormatted}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(i);
                  }}
                  className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                  title="Excluir nota"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                {sn.note}
              </p>
            </div>
          ))}

          {savedNotes.length === 0 && (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Bookmark size={32} className="mx-auto opacity-40" />
              <p className="text-xs font-bold">Nenhuma nota salva ainda.</p>
              <p className="text-[10px]">Adicione notas usando o campo ao lado para criar marcadores interativos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
