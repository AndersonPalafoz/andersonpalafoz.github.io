"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download, FileText, BookOpen, Zap, Headphones, PenTool, Search, Filter, Loader2, CheckCircle2 } from "lucide-react";

const CATEGORY_ICONS: Record<string, typeof FileText> = {
  Worksheets: FileText,
  Slides: PenTool,
  Áudios: Headphones,
  Exercícios: Zap,
  Artigos: BookOpen,
};

export default function MateriaisPage() {
  const [materiais, setMateriais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [completedMaterialIds, setCompletedMaterialIds] = useState<number[]>([]);

  useEffect(() => {
    async function fetchMaterials() {
      try {
        setLoading(true);
        const res = await fetch("/api/materials");
        const data = await res.json();
        setMateriais(data.materials || []);
      } catch (err) {
        console.error("Erro ao carregar materiais:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMaterials();
  }, []);

  useEffect(() => {
    fetch("/api/materials/progress", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setCompletedMaterialIds(data.completedMaterialIds || []))
      .catch(() => undefined);
  }, []);

  const niveis = Array.from(new Set(materiais.map((m) => m.level))).sort();
  const categorias = Array.from(new Set(materiais.map((m) => m.category))).sort();

  const filteredMaterials = materiais.filter((m) => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLevel = selectedLevel === "all" || m.level === selectedLevel;
    const matchesCategory = selectedCategory === "all" || m.category === selectedCategory;
    return matchesSearch && matchesLevel && matchesCategory;
  });

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto w-full">
          <div className="space-y-8 max-w-3xl">
            <div className="space-y-4">
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                Biblioteca Acadêmica
              </span>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-gray-900">
                Materiais
                <br />
                <span className="text-red-600">Didáticos Exclusivos</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Explore worksheets, guias, recursos interativos e templates autorais para potencializar seu aprendizado de inglês, que podem alcançar os níveis C1 e C2, cobrindo do nível A1-C2.
              </p>
            </div>

            {/* Barra de Busca e Filtros */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar material por título ou tema..."
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-300 outline-none focus:border-red-600 text-sm transition bg-gray-50/50"
                />
              </div>

              <div className="flex flex-wrap gap-4 items-center justify-between pt-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <span className="text-xs font-bold uppercase text-gray-500 flex items-center gap-1">
                    <Filter size={14} /> Nível:
                  </span>
                  <button
                    onClick={() => setSelectedLevel("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedLevel === "all" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Todos
                  </button>
                  {niveis.map((niv) => (
                    <button
                      key={niv}
                      onClick={() => setSelectedLevel(niv)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        selectedLevel === niv ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {niv}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <span className="text-xs font-bold uppercase text-gray-500">Categoria:</span>
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedCategory === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Todas
                  </button>
                  {categorias.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        selectedCategory === cat ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lista de Materiais com Animação e Hover Refinados */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {filteredMaterials.length} Materiais Disponíveis
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-red-600">
              <Loader2 className="animate-spin mr-2" size={32} />
              <span className="text-lg font-medium">Carregando biblioteca de recursos...</span>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
              <FileText size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium text-lg">Nenhum material encontrado para esta busca.</p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedLevel("all"); setSelectedCategory("all"); }}
                className="mt-4 text-xs font-bold uppercase text-red-600 hover:underline"
              >
                Limpar filtros de pesquisa
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMaterials.map((material) => {
                const Icon = CATEGORY_ICONS[material.category] || FileText;
                return (
                  <div
                    key={material.id}
                    className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-red-600 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4 gap-3">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                          <Icon size={24} />
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          {completedMaterialIds.includes(Number(material.id)) && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 size={13} /> Concluído</span>}
                          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
                            {material.level}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{material.category}</span>
                      <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2 group-hover:text-red-600 transition-colors">
                        {material.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                        {material.description || "Recurso didático autoral desenvolvido para prática em sala e estudo autônomo."}
                      </p>
                    </div>

                    <Link href={`/materiais/${material.id}`} className="w-full">
                      <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-sm hover:shadow">
                        <Download size={18} />
                        <span>Visualizar Material</span>
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
