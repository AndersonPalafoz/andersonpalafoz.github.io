'use client';

import { Linkedin } from "lucide-react";
import { toast } from "sonner";

interface CertificateShareButtonProps {
  certificateUrl: string | null | undefined;
  courseTitle?: string | null;
  compact?: boolean;
}

export function CertificateShareButton({ certificateUrl, courseTitle, compact = false }: CertificateShareButtonProps) {
  if (!certificateUrl) {
    return (
      <span
        aria-disabled="true"
        className={`${compact ? "" : "w-full"} inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-400`}
      >
        <Linkedin size={compact ? 14 : 16} /> Compartilhamento indisponível
      </span>
    );
  }

  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`;

  return (
    <a
      href={shareUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Compartilhar ${courseTitle ? `o certificado de ${courseTitle}` : "este certificado"} no LinkedIn`}
      onClick={() => toast.success("Abrindo o LinkedIn para compartilhar sua conquista.")}
      className={`${compact ? "" : "w-full"} inline-flex items-center justify-center gap-2 rounded-lg border border-[#0A66C2] px-4 py-2.5 text-xs font-bold text-[#0A66C2] transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66C2] focus-visible:ring-offset-2`}
    >
      <Linkedin size={compact ? 14 : 16} /> Compartilhar no LinkedIn
    </a>
  );
}
