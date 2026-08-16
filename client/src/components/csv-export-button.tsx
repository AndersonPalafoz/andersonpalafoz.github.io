import React from "react";
import { Download, FileSpreadsheet } from "lucide-react";

interface CsvExportButtonProps {
  data: Record<string, any>[];
  filename?: string;
  label?: string;
}

export function CsvExportButton({ data, filename = "relatorio_desempenho.csv", label = "Exportar CSV" }: CsvExportButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("Nenhum dado disponível para exportação.");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => JSON.stringify(row[header] ?? "")).join(",")
      ),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all transform active:scale-95"
    >
      <FileSpreadsheet size={16} />
      <span>{label}</span>
      <Download size={14} className="opacity-70" />
    </button>
  );
}
