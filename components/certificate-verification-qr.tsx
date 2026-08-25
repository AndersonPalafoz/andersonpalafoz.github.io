"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { getCertificateVerificationUrl } from "@/lib/certificate-qr";

type CertificateVerificationQrProps = {
  code: string | null | undefined;
  compact?: boolean;
};

export function CertificateVerificationQr({ code, compact = false }: CertificateVerificationQrProps) {
  const [src, setSrc] = useState<string | null>(null);
  const verificationUrl = code ? getCertificateVerificationUrl(code, typeof window !== "undefined" ? window.location.origin + "/verificar" : undefined) : null;

  useEffect(() => {
    let active = true;
    if (!code) {
      setSrc(null);
      return () => { active = false; };
    }
    void QRCode.toDataURL(getCertificateVerificationUrl(code), {
      errorCorrectionLevel: "M",
      margin: 1,
      width: compact ? 112 : 148,
      color: { dark: "#111827", light: "#ffffff" },
    }).then(value => {
      if (active) setSrc(value);
    }).catch(() => {
      if (active) setSrc(null);
    });
    return () => { active = false; };
  }, [code, compact]);

  if (!code || !verificationUrl) return null;

  return (
    <div className={`flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/20 ${compact ? "p-2.5" : "p-3"}`}>
      {src ? <img src={src} alt="QR Code para validar este certificado" className={`${compact ? "h-16 w-16" : "h-20 w-20"} shrink-0 rounded-lg bg-white p-1`} /> : <div className={`${compact ? "h-16 w-16" : "h-20 w-20"} shrink-0 animate-pulse rounded-lg bg-muted`} aria-label="Gerando QR Code" />}
      <div className="min-w-0 space-y-1">
        <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300"><ShieldCheck size={13} /> Validação pública</p>
        <p className="truncate font-mono text-[11px] font-bold text-foreground">{code}</p>
        <a href={verificationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:underline">
          Verificar certificado <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
