import React, { useState } from "react";
import { Download, FileSpreadsheet, Filter, Calendar } from "lucide-react";

interface CsvExportButtonProps {
  data: Record<string, any>[];
  filename?: string;
  label?: string;
}

export function CsvExportButton({ data, filename = "relatorio_filtrado.csv", label = "Exportar CSV" }: CsvExportButtonProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const categories = Array.from(new Set(data.map((item) => item.category || item.tipo || "Geral")));

  const handleExport = () => {
    let filteredData = [...data];

    // Filtro por categoria
    if (selectedCategory !== "all") {
      filteredData = filteredData.filter((item) => (item.category || item.tipo || "Geral") === selectedCategory);
    }

    // Filtro por data (se houver campo createdAt ou data)
    if (startDate) {
      const start = new Date(startDate).getTime();
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.createdAt || item.data || Date.now()).getTime();
        return itemDate >= start;
      });
    }

    if (endDate) {
      const end = new Date(endDate).getTime() + 86400000; // fim do dia
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.createdAt || item.data || Date.now()).getTime();
        return itemDate <= end;
      });
    }

    if (filteredData.length === 0) {
      alert("Nenhum registro encontrado para os filtros selecionados.");
      return;
    }

    const headers = Object.keys(filteredData[0]);
    const csvRows = [
      headers.join(","),
      ...filteredData.map((row) =>
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
    setShowFilters(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all"
        >
          <Filter size={15} /> Filtros de Exportação
        </button>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all transform active:scale-95"
        >
          <FileSpreadsheet size={16} />
          <span>{label}</span>
          <Download size={14} className="opacity-70" />
        </button>
      </div>

      {showFilters && (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-3 animate-in fade-in zoom-in-95">
          <h5 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Calendar size={14} className="text-emerald-500" /> Refinar Dados para CSV
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Data Inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Data Final</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Categoria / Tipo</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs mt-1"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map((cat, i) => (
                  <option key={i} value={String(cat)}>{String(cat)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
