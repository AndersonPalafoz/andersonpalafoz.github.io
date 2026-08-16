"use client";

import { useRef, useEffect, useState } from "react";
import { Headphones, Video, BookmarkCheck, Gauge, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface MediaPlayerProps {
  type: "audio" | "video";
  url: string;
  title?: string;
  mediaKey?: string;
  lessonId?: number;
  onCompleteLesson?: (lessonId: number) => void;
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export function MediaPlayer({ type, url, title, mediaKey = url, lessonId, onCompleteLesson }: MediaPlayerProps) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const [resumed, setResumed] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [ended, setEnded] = useState(false);

  const storageKey = `media_progress_${btoa(mediaKey).slice(0, 32)}`;

  useEffect(() => {
    const savedTime = localStorage.getItem(storageKey);
    if (savedTime && mediaRef.current) {
      const time = parseFloat(savedTime);
      if (time > 2 && mediaRef.current.duration && time < mediaRef.current.duration - 5) {
        mediaRef.current.currentTime = time;
        setResumed(true);
        toast.info("Retomando reprodução de onde você parou.", { duration: 3000 });
      }
    }
  }, [storageKey]);

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      localStorage.setItem(storageKey, String(mediaRef.current.currentTime));
    }
  };

  const handleEnded = () => {
    setEnded(true);
    toast.success("Mídia concluída com sucesso!");
    if (lessonId && onCompleteLesson) {
      onCompleteLesson(lessonId);
    }
  };

  const changeSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (mediaRef.current) {
      mediaRef.current.playbackRate = newSpeed;
    }
    toast.success(`Velocidade de reprodução: ${newSpeed}x`);
  };

  if (!url) return null;

  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");

  return (
    <div className="surface-card my-6 overflow-hidden p-4 sm:p-5 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-600">
          {type === "video" ? <Video size={16} /> : <Headphones size={16} />}
          {title || (type === "video" ? "Vídeo Complementar / Aula" : "Áudio / Listening")}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {resumed && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              <BookmarkCheck size={13} /> Retomado
            </span>
          )}
          {!isYouTube && (
            <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-lg text-xs font-semibold">
              <Gauge size={13} className="text-muted-foreground" />
              {PLAYBACK_SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => changeSpeed(s)}
                  className={`px-1.5 py-0.5 rounded ${speed === s ? "bg-red-600 text-white font-bold" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {type === "video" ? (
        isYouTube ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
            <iframe
              src={url.includes("embed") ? url : url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
              title={title || "Vídeo"}
              className="absolute inset-0 h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            controls
            className="w-full rounded-xl bg-black shadow-md"
            src={url}
          >
            Seu navegador não suporta a tag de vídeo.
          </video>
        )
      ) : (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          controls
          className="w-full"
          src={url}
        >
          Seu navegador não suporta a tag de áudio.
        </audio>
      )}

      {ended && lessonId && onCompleteLesson && (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
          <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 size={16} /> Você concluiu esta mídia.
          </span>
          <Button size="sm" onClick={() => onCompleteLesson(lessonId)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8">
            Marcar aula como concluída
          </Button>
        </div>
      )}
    </div>
  );
}
