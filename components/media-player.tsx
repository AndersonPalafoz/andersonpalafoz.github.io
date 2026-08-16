"use client";

import { useRef, useEffect, useState } from "react";
import { Headphones, Video, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

interface MediaPlayerProps {
  type: "audio" | "video";
  url: string;
  title?: string;
  mediaKey?: string;
}

export function MediaPlayer({ type, url, title, mediaKey = url }: MediaPlayerProps) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const [resumed, setResumed] = useState(false);

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

  if (!url) return null;

  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");

  return (
    <div className="surface-card my-6 overflow-hidden p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-600">
          {type === "video" ? <Video size={16} /> : <Headphones size={16} />}
          {title || (type === "video" ? "Vídeo Complementar / Aula" : "Áudio / Listening")}
        </div>
        {resumed && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            <BookmarkCheck size={13} /> Posição restaurada
          </span>
        )}
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
          controls
          className="w-full"
          src={url}
        >
          Seu navegador não suporta a tag de áudio.
        </audio>
      )}
    </div>
  );
}
