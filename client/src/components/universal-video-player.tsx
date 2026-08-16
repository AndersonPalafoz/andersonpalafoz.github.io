import React from "react";

interface UniversalVideoPlayerProps {
  url: string;
  title?: string;
}

export function UniversalVideoPlayer({ url, title = "Videoaula" }: UniversalVideoPlayerProps) {
  const getEmbedUrl = (rawUrl: string) => {
    if (!rawUrl) return "";
    // YouTube
    const ytMatch = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    // Vimeo
    const vimeoMatch = rawUrl.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:\w+\/)?videos\/|video\/|)(\d+)(?:|\/\?))/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    // Direct or generic iframe src
    return rawUrl;
  };

  const embedUrl = getEmbedUrl(url);

  return (
    <div className="w-full aspect-video rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black shadow-xl relative">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
          URL de vídeo inválida ou não suportada.
        </div>
      )}
    </div>
  );
}
