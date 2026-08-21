"use client";

import { useEffect, useState, useMemo } from "react";
import { Award, Download, Search, Filter, ShieldCheck, FileText } from "lucide-react";
import { CertificateShareButton } from "@/components/certificate-share-button";
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
  certificateTemplateId?: number | null;
  includeSiteBranding?: boolean;
};

export function StudentCertificatesGallery() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [modelFilter, setModelFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

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

  const filteredCertificates = useMemo(() => {
    const filtered = certificates.filter((cert) => {
      const normalizedSearch = searchQuery.trim().toLowerCase();
      const matchSearch =
        cert.courseTitle.toLowerCase().includes(normalizedSearch) ||
        Boolean(cert.certificateCode?.toLowerCase().includes(normalizedSearch));
      const matchLevel = levelFilter === "all" || cert.level === levelFilter;
      const matchModel =
        modelFilter === "all" ||
        (modelFilter === "platform" && !cert.certificateTemplateId) ||
        (modelFilter === "institutional" && Boolean(cert.certificateTemplateId)) ||
        (modelFilter === "branded" && cert.includeSiteBranding === true) ||
        (modelFilter === "unbranded" && cert.includeSiteBranding === false);
      return matchSearch && matchLevel && matchModel;
    });

    return filtered.sort((a, b) => {
      const difference = new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime();
      return sortOrder === "newest" ? -difference : difference;
    });
  }, [certificates, searchQuery, levelFilter, modelFilter, sortOrder]);

  const handleExportHistoryPdf = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Permita pop-ups no navegador para exportar o relatório em PDF.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Certificados - Anderson Palafoz</title>
        <style>
          body { font-family: Helvetica, Arial, sans-serif; color: #111; padding: 40px; margin: 0; }
          .header { border-bottom: 3px solid #dc2626; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
          .brand { font-size: 22px; font-weight: bold; color: #dc2626; }
          .subtitle { font-size: 12px; color: #666; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; font-size: 13px; }
          th { background-color: #f9fafb; font-weight: bold; color: #374151; }
          .footer { margin-top: 40px; font-size: 11px; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; pt: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">ANDERSON PALAFOZ — PLATAFORMA ACADÊMICA</div>
            <div class="subtitle">Histórico Oficial de Certificados Conquistados</div>
          </div>
          <div style="font-size: 12px; text-align: right; color: #4b5563;">
            Data de Emissão: ${new Date().toLocaleDateString("pt-BR")}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Curso</th>
              <th>Nível</th>
              <th>Código de Autenticidade</th>
              <th>Data de Conclusão</th>
              <th>Tipo de Assinatura</th>
            </tr>
          </thead>
          <tbody>
            ${filteredCertificates.map(c => `
              <tr>
                <td><b>${c.courseTitle}</b></td>
                <td>${c.level}</td>
                <td>${c.certificateCode || "VERIFICADO"}</td>
                <td>${new Date(c.issuedAt).toLocaleDateString("pt-BR")}</td>
                <td>${c.signatureType === "govbr" ? "Assinado via gov.br" : "Assinado manualmente"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="footer">
          Documento digital gerado pela plataforma acadêmica Anderson Palafoz. Verificação oficial online.
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
    toast.success("Gerando PDF estilizado do histórico...");
  };

  if (loading) {
    return (
      <div className="surface-card flex items-center justify-center p-12 text-muted-foreground">
        <Award className="animate-spin text-red-600 mr-2" size={20} /> Carregando certificados e histórico...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-black text-foreground">Histórico de Conquistas & Certificados</h2>
          <p className="text-sm text-muted-foreground">Pesquise, filtre e exporte seus certificados oficiais e históricos de conclusão.</p>
        </div>
        <button
          type="button"
          onClick={handleExportHistoryPdf}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 shadow-sm"
        >
          <FileText size={15} /> Exportar Histórico em PDF
        </button>
      </div>

      <div className="grid gap-4 surface-card p-4 border border-border/70 rounded-2xl sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3.5 top-3.5 text-muted-foreground" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome do curso ou código..."
            className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
        <div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            aria-label="Filtrar certificados por nível"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">Todos os Níveis</option>
            <option value="Básico">Básico</option>
            <option value="Intermediário">Intermediário</option>
            <option value="Avançado">Avançado</option>
          </select>
        </div>
        <div>
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            aria-label="Filtrar certificados por tipo de modelo"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">Todos os modelos</option>
            <option value="platform">Modelo da plataforma</option>
            <option value="institutional">Modelo institucional</option>
            <option value="branded">Com logo do site</option>
            <option value="unbranded">Sem logo do site</option>
          </select>
        </div>
        <div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
            aria-label="Ordenar certificados por data de emissão"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="newest">Mais recentes primeiro</option>
            <option value="oldest">Mais antigos primeiro</option>
          </select>
        </div>
      </div>

      {filteredCertificates.length === 0 ? (
        <div className="surface-card p-12 text-center">
          <Award className="mx-auto text-muted-foreground/40 mb-3" size={48} />
          <h3 className="text-lg font-bold text-foreground">Nenhum certificado encontrado</h3>
          <p className="mt-1 text-sm text-muted-foreground">Tente ajustar sua busca ou filtros para localizar o certificado desejado.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredCertificates.map((cert) => {
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

                <div className="mt-6 space-y-4 pt-4 border-t border-border/60">
                  <div className="flex flex-wrap items-center gap-3">
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
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Compartilhar Conquista</p>
                    <CertificateShareButton certificateUrl={downloadUrl} courseTitle={cert.courseTitle} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
