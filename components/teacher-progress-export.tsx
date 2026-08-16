"use client";

import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface StudentProgressExportItem {
  name: string | null;
  email: string | null;
  enrollmentsCount: number;
  approvalStatus: string;
}

export function TeacherProgressExport({ students }: { students: StudentProgressExportItem[] }) {
  const exportCSV = () => {
    const csvRows = [
      ["Nome", "E-mail", "Status de Acesso", "Cursos Matriculados"].join(";"),
      ...students.map((s) => [
        `"${s.name || ""}"`,
        `"${s.email}"`,
        `"${s.approvalStatus}"`,
        s.enrollmentsCount,
      ].join(";")),
    ].join("\n");

    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_progresso_alunos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório de progresso exportado em CSV!");
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Permita popups para baixar o PDF.");
      return;
    }
    const rows = students.map((s) => `<tr><td>${s.name || "Sem nome"}</td><td>${s.email}</td><td>${s.approvalStatus}</td><td>${s.enrollmentsCount}</td></tr>`).join("");
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Relatório de Progresso dos Alunos - Anderson Palafoz</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #333; }
            h1 { color: #DC2626; border-bottom: 2px solid #DC2626; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px; }
            th { background: #f3f4f6; color: #111; }
            .footer { margin-top: 32px; font-size: 11px; color: #666; border-top: 1px solid #eee; padding-top: 12px; }
          </style>
        </head>
        <body>
          <h1>Relatório Oficial de Progresso dos Alunos</h1>
          <p>Anderson Palafoz Platform · Emitido em ${new Date().toLocaleString("pt-BR")}</p>
          <table>
            <thead>
              <tr><th>Aluno</th><th>E-mail</th><th>Status</th><th>Cursos Matriculados</th></tr>
            </thead>
            <tbody>
              ${rows || "<tr><td colspan='4'>Nenhum aluno encontrado.</td></tr>"}
            </tbody>
          </table>
          <div class="footer">Documento oficial gerado para acompanhamento acadêmico.</div>
          <script>window.print()</script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success("Relatório preparado para impressão ou salvamento em PDF.");
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={exportCSV} variant="outline" className="h-10 gap-2">
        <Download size={16} className="text-red-600" /> Exportar CSV
      </Button>
      <Button onClick={exportPDF} className="h-10 gap-2 bg-red-600 text-white hover:bg-red-700">
        <FileText size={16} /> Exportar PDF
      </Button>
    </div>
  );
}
