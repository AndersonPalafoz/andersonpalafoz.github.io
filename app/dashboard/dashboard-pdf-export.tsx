"use client";

import { useState } from "react";
import { Download, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { createTablePdf, downloadPdf } from "@/lib/pdf-export";

interface DashboardPdfExportProps {
  userName: string;
  enrollmentsCount: number;
  certificatesCount: number;
  pendingActivitiesCount: number;
  coursesData: Array<{
    title: string;
    level: string;
    progress: number;
    status: string;
  }>;
}

export function DashboardPdfExport({
  userName,
  enrollmentsCount,
  certificatesCount,
  pendingActivitiesCount,
  coursesData,
}: DashboardPdfExportProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const rows = coursesData.map((c) => [
        c.title,
        c.level,
        c.status === "completed" ? "Concluído" : "Em andamento",
        `${c.progress}%`,
      ]);

      const summaryRows = [
        ["Aluno(a)", userName],
        ["Cursos Ativos / Inscritos", String(enrollmentsCount)],
        ["Certificados Obtidos", String(certificatesCount)],
        ["Atividades Pendentes", String(pendingActivitiesCount)],
        ["Data de Emissão", new Date().toLocaleDateString("pt-BR")],
      ];

      const pdfBytes = await createTablePdf(
        `Relatório de Progresso Acadêmico — ${userName}`,
        ["Indicador / Métrica", "Detalhe / Valor Atual"],
        summaryRows
      );

      downloadPdf(pdfBytes, `relatorio-progresso-${userName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.pdf`);
      toast.success("Relatório de progresso exportado em PDF com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao gerar PDF do relatório.");
    } finally {
      setLoading(false);
    }
  };

  const handleShareLinkedIn = () => {
    const text = encodeURIComponent(
      `Estou evoluindo meus estudos de inglês na Plataforma Anderson Palafoz! Já conclui ${certificatesCount} certificado(s) e mantenho ${enrollmentsCount} curso(s) ativo(s) com acompanhamento acadêmico. 🚀 #EnglishLearning #AndersonPalafoz`
    );
    const url = encodeURIComponent(window.location.origin);
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`;
    window.open(linkedInUrl, "_blank", "width=600,height=600");
    toast.success("Abrindo janela de compartilhamento no LinkedIn!");
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-black text-white shadow-md transition hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
        Exportar Relatório PDF
      </button>

      <button
        type="button"
        onClick={handleShareLinkedIn}
        className="inline-flex items-center gap-2 rounded-2xl bg-[#0A66C2] px-4 py-3 text-xs font-black text-white shadow-md transition hover:bg-[#095196]"
      >
        <Share2 size={15} /> Compartilhar no LinkedIn
      </button>
    </div>
  );
}
