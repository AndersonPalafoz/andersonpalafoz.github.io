"use client";

import { Headphones, Video } from "lucide-react";

interface MediaPlayerProps {
  type: "audio" | "video";
  url: string;
  title?: string;
}

export function MediaPlayer({ type, url, title }: MediaPlayerProps) {
  if (!url) return null;

  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");

  return (
    <div className="surface-card my-6 overflow-hidden p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-600">
        {type === "video" ? <Video size={16} /> : <Headphones size={16} />}
        {title || (type === "video" ? "Vídeo Complementar / Aula" : "Áudio / Listening")}
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
          <video controls className="w-full rounded-xl bg-black shadow-md" src={url}>
            Seu navegador não suporta a tag de vídeo.
          </video>
        )
      ) : (
        <audio controls className="w-full" src={url}>
          Seu navegador não suporta a tag de áudio.
        </audio>
      )}
    </div>
  );
}
