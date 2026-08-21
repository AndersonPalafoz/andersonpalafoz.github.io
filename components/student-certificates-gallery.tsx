"use client";

import { useEffect, useState } from "react";
import { Award, Download, ExternalLink, Loader2, Share2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type CertificateItem = {
  id: number;
  courseTitle: string;
  level: string;
  certificateCode: string | null;
  issuedAt: string;
  signatureType: string;
  signedPdfUrl: string | null;
  certificateUrl: string | null;
};

export function StudentCertificatesGallery() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCertificates() {
      try {
        const res = await fetch("/api/user/certificates", { cache: "no-store" });
        const data = await res.json();
        if (res.ok) {
          setCertificates(data.certificates || []);
        }
      } catch (err) {
        console.error("Failed to load user certificates", err);
      } finally {
        setLoading(false);
      }
    }
    void fetchCertificates();
  }, []);

  const handleLinkedInShare = (cert: CertificateItem) => {
    const title = encodeURIComponent(`Conclusão do curso ${cert.courseTitle} - Anderson Palafoz`);
    const summary = encodeURIComponent(`Concluí com êxito o curso ${cert.courseTitle} (${cert.level}) na plataforma acadêmica de Anderson Palafoz.`);
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${title}%20-%20${summary}%20${url}`, "_blank");
    toast.success("Redirecionando para compartilhamento no LinkedIn!");
  };

  if (loading) {
    return (
      <div className="surface-card flex items-center justify-center p-12 text-muted-foreground">
        <Loader2 className="animate-spin text-red-600 mr-2" size={20} /> Carregando seus certificados...
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="surface-card p-12 text-center">
        <Award className="mx-auto text-muted-foreground/40 mb-3" size={48} />
        <h3 className="text-lg font-bold text-foreground">Nenhum certificado emitido ainda</h3>
        <p className="mt-1 text-sm text-muted-foreground">Conclua 100% das aulas de um curso para desbloquear e baixar seu certificado assinado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-black text-foreground">Meus Certificados Acadêmicos</h2>
          <p className="text-sm text-muted-foreground">Baixe seus certificados oficiais assinados e compartilhe suas conquistas.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {certificates.map((cert) => {
          const downloadUrl = cert.signedPdfUrl || cert.certificateUrl || "#";
          return (
            <div key={cert.id} className="surface-card flex flex-col justify-between border border-border/70 p-6 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-black uppercase text-red-700 dark:bg-red-950/50 dark:text-red-300">
                    <ShieldCheck size={14} /> Nível {cert.level}
                  </span>
                  <span className="text-xs text-muted-foreground">Emitido em {new Date(cert.issuedAt).toLocaleDateString("pt-BR")}</span>
                </div>
                <h3 className="text-lg font-black text-foreground">{cert.courseTitle}</h3>
                <p className="text-xs font-mono text-muted-foreground">Código: {cert.certificateCode || "VERIFICADO"}</p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-border/60">
                {downloadUrl !== "#" ? (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-700"
                  >
                    <Download size={14} /> Baixar PDF Assinado
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Disponível em breve</span>
                )}
                <button
                  type="button"
                  onClick={() => handleLinkedInShare(cert)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-foreground transition hover:border-red-300 hover:bg-muted"
                >
                  <Share2 size={14} /> Compartilhar no LinkedIn
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
