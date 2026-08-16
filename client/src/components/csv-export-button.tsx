import React, { useState } from "react";
import { Download, FileSpreadsheet, Filter, Calendar, BarChart3, HelpCircle } from "lucide-react";

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
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const categories = Array.from(new Set(data.map((item) => item.category || item.tipo || "Geral")));

  const getFilteredData = () => {
    let filteredData = [...data];
    if (selectedCategory !== "all") {
      filteredData = filteredData.filter((item) => (item.category || item.tipo || "Geral") === selectedCategory);
    }
    if (startDate) {
      const start = new Date(startDate).getTime();
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.createdAt || item.data || Date.now()).getTime();
        return itemDate >= start;
      });
    }
    if (endDate) {
      const end = new Date(endDate).getTime() + 86400000;
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.createdAt || item.data || Date.now()).getTime();
        return itemDate <= end;
      });
    }
    return filteredData;
  };

  const filteredData = getFilteredData();

  const categoryCounts = filteredData.reduce((acc: Record<string, number>, item) => {
    const cat = String(item.category || item.tipo || "Geral");
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const chartEntries = Object.entries(categoryCounts);
  const maxCount = Math.max(...Object.values(categoryCounts), 1);

  const handleExport = () => {
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
          <Filter size={15} /> Filtros & Prévia ({filteredData.length} itens)
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
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-4 animate-in fade-in zoom-in-95 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h5 className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar size={15} className="text-emerald-500" /> Filtros de Data e Categoria
            </h5>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
              {filteredData.length} registros correspondentes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Data Inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs mt-1 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Data Final</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs mt-1 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Categoria / Tipo</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs mt-1 text-slate-900 dark:text-white"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map((cat, i) => (
                  <option key={i} value={String(cat)}>{String(cat)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Gráfico de Barras com Tooltips Interativos de Valores Exatos */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5"><BarChart3 size={15} className="text-red-500" /> Distribuição por Categoria</span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1"><HelpCircle size={12} /> Passe o mouse para ver o valor exato</span>
            </div>

            <div className="space-y-2.5 bg-white dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
              {chartEntries.map(([cat, count], idx) => {
                const percentage = Math.round((count / maxCount) * 100);
                const isHovered = activeTooltip === cat;
                return (
                  <div
                    key={idx}
                    className="space-y-1 relative cursor-pointer"
                    onMouseEnter={() => setActiveTooltip(cat)}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      <span>{cat}</span>
                      <span className="font-mono text-red-600 dark:text-red-400 font-bold">{count} itens ({percentage}%)</span>
                    </div>

                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(percentage, 8)}%` }}
                      />
                    </div>

                    {isHovered && (
                      <div className="absolute right-0 -top-8 bg-slate-900 dark:bg-slate-950 text-white text-[10px] font-bold px-3 py-1 rounded-lg shadow-xl z-20 flex items-center gap-1.5 animate-in fade-in zoom-in-95">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        <span>Categoria: <b>{cat}</b> | Total Exato: <b>{count} registros</b></span>
                      </div>
                    )}
                  </div>
                );
              })}
              {chartEntries.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-2">Nenhum dado para exibir no gráfico.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
