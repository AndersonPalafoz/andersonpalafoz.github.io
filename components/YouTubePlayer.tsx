"use client";

import { useState, useMemo } from "react";
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnail } from "@/lib/youtube";
import { AlertCircle } from "lucide-react";

interface YouTubePlayerProps {
  url: string;
  title?: string;
  width?: string | number;
  height?: string | number;
  aspectRatio?: "16:9" | "4:3" | "1:1";
  allowFullscreen?: boolean;
  showThumbnail?: boolean;
  autoplay?: boolean;
  className?: string;
}

export function YouTubePlayer({
  url,
  title = "YouTube Video",
  width = "100%",
  height = "auto",
  aspectRatio = "16:9",
  allowFullscreen = true,
  showThumbnail = false,
  autoplay = false,
  className = "",
}: YouTubePlayerProps) {
  const [error, setError] = useState<string | null>(null);

  const videoId = useMemo(() => extractYouTubeId(url), [url]);
  const embedUrl = useMemo(() => (videoId ? getYouTubeEmbedUrl(videoId) : null), [videoId]);
  const thumbnailUrl = useMemo(() => (videoId ? getYouTubeThumbnail(videoId, "high") : null), [videoId]);

  if (!videoId || !embedUrl) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <p className="text-sm">URL de vídeo inválida. Verifique o link do YouTube.</p>
        </div>
      </div>
    );
  }

  const aspectRatioMap = {
    "16:9": "56.25%",
    "4:3": "75%",
    "1:1": "100%",
  };

  const containerStyle = {
    position: "relative" as const,
    width,
    paddingBottom: aspectRatioMap[aspectRatio],
    height: height === "auto" ? "auto" : height,
  };

  const iframeStyle = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    border: "none",
    borderRadius: "0.5rem",
  };

  return (
    <div className={className}>
      {showThumbnail && (
        <div className="mb-4 rounded-lg overflow-hidden bg-gray-900">
          <img
            src={thumbnailUrl || ""}
            alt={title}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      <div style={containerStyle} className="rounded-lg overflow-hidden bg-black">
        <iframe
          style={iframeStyle}
          src={embedUrl + (autoplay ? "?autoplay=1" : "")}
          title={title}
          allowFullScreen={allowFullscreen}
          allow={`accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture${autoplay ? "; autoplay" : ""}`}
          onLoad={() => {}}
          onError={() => {
            setError("Erro ao carregar o vídeo");
          }}
        />
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

/**
 * YouTubePlayerResponsive - Versão responsiva com breakpoints
 */
export function YouTubePlayerResponsive({
  url,
  title = "YouTube Video",
  className = "",
  ...props
}: Omit<YouTubePlayerProps, "width" | "height">) {
  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <YouTubePlayer
        url={url}
        title={title}
        width="100%"
        height="auto"
        {...props}
      />
    </div>
  );
}

/**
 * YouTubePlayerGrid - Componente para exibir múltiplos vídeos em grid
 */
interface YouTubePlayerGridProps {
  videos: Array<{
    id: string;
    url: string;
    title: string;
  }>;
  columns?: 1 | 2 | 3 | 4;
  gap?: "small" | "medium" | "large";
  className?: string;
}

export function YouTubePlayerGrid({
  videos,
  columns = 2,
  gap = "medium",
  className = "",
}: YouTubePlayerGridProps) {
  const gapMap = {
    small: "gap-2 md:gap-3",
    medium: "gap-4 md:gap-6",
    large: "gap-6 md:gap-8",
  };

  const columnsMap = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${columnsMap[columns]} ${gapMap[gap]} ${className}`}>
      {videos.map((video) => (
        <div key={video.id}>
          <YouTubePlayer
            url={video.url}
            title={video.title}
            width="100%"
            height="auto"
            aspectRatio="16:9"
          />
          <p className="mt-2 text-sm font-medium text-gray-900">{video.title}</p>
        </div>
      ))}
    </div>
  );
}
