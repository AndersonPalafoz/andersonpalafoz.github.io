"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Download, FileText, BookOpen, Zap, Headphones, PenTool, Search, Filter, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { GrammarGuidesSection } from "./guias-gramatica";
import { MaterialLoginLock } from "@/components/material-login-lock";

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, pageSize: 24, total: 0, hasMore: false });
  const [facets, setFacets] = useState({ levels: [] as string[], categories: [] as string[] });
  const [completedMaterialIds, setCompletedMaterialIds] = useState<number[]>([]);
  const requestIdRef = useRef(0);
  const { status: sessionStatus } = useSession();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setSearchQuery(searchInput.trim());
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    const requestId = ++requestIdRef.current;
    const params = new URLSearchParams({ page: String(page), pageSize: "24" });
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedLevel !== "all") params.set("level", selectedLevel);
    if (selectedCategory !== "all") params.set("category", selectedCategory);

    async function fetchMaterials() {
      page === 1 ? setLoading(true) : setLoadingMore(true);
      setError(null);
      try {
        const res = await fetch(`/api/materials?${params.toString()}`, { cache: "no-store", signal: controller.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Não foi possível carregar os materiais.");
        if (requestId !== requestIdRef.current) return;
        setMateriais((current) => page === 1 ? data.materials || [] : [...current, ...(data.materials || [])]);
        setMeta(data.meta || { page, pageSize: 24, total: 0, hasMore: false });
        setFacets({ levels: data.facets?.levels || [], categories: data.facets?.categories || [] });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Erro ao carregar materiais.";
        setError(message);
        if (page > 1) toast.error(message);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    }

    void fetchMaterials();
    return () => controller.abort();
  }, [page, searchQuery, selectedLevel, selectedCategory]);

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      setCompletedMaterialIds([]);
      return;
    }

    fetch("/api/materials/progress", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setCompletedMaterialIds(data.completedMaterialIds || []))
      .catch(() => undefined);
  }, [sessionStatus]);

  const filteredMaterials = materiais;
  const niveis = facets.levels;
  const categorias = facets.categories;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-950 px-4 py-20 md:px-8 lg:px-16 border-b border-slate-200 dark:border-slate-800">
        <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-red-100/60 dark:bg-red-950/20 blur-3xl" />
        <div className="max-w-7xl mx-auto w-full">
          <div className="space-y-8 max-w-3xl">
            <div className="space-y-4">
              <span className="bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-sm font-semibold">
                Biblioteca Acadêmica
              </span>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-gray-900 dark:text-white">
                Materiais
                <br />
                <span className="text-red-600">Didáticos Exclusivos</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Explore worksheets, guias, recursos interativos e templates autorais para potencializar seu aprendizado de inglês, que podem alcançar os níveis C1 e C2, cobrindo do nível A1-C2.
              </p>
            </div>

            {/* Barra de Busca e Filtros */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Pesquisar material por título ou tema..."
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-300 dark:border-slate-700 outline-none focus:border-red-600 text-sm transition bg-gray-50/50 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap gap-4 items-center justify-between pt-2">
                <div className="flex flex-wrap items-center gap-2 pb-2 min-w-0">
                  <span className="text-xs font-bold uppercase text-gray-500 flex items-center gap-1">
                    <Filter size={14} /> Nível:
                  </span>
                  <button
                    onClick={() => { setSelectedLevel("all"); setPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedLevel === "all" ? "bg-red-600 text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    Todos
                  </button>
                  {niveis.map((niv) => (
                    <button
                      key={niv}
                      onClick={() => { setSelectedLevel(niv); setPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        selectedLevel === niv ? "bg-red-600 text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {niv}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 pb-2 min-w-0">
                  <span className="text-xs font-bold uppercase text-gray-500">Categoria:</span>
                  <button
                    onClick={() => { setSelectedCategory("all"); setPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedCategory === "all" ? "bg-gray-900 dark:bg-slate-700 text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    Todas
                  </button>
                  {categorias.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        selectedCategory === cat ? "bg-gray-900 dark:bg-slate-700 text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
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

      {/* Lista de Materiais */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-gray-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {meta.total} materiais disponíveis
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-busy="true" aria-label="Carregando materiais...">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm animate-pulse">
                  <div>
                    <div className="flex items-start justify-between mb-4 gap-3">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-slate-800 rounded-xl" />
                      <div className="w-16 h-6 bg-gray-200 dark:bg-slate-800 rounded-full" />
                    </div>
                    <div className="w-24 h-4 bg-gray-200 dark:bg-slate-800 rounded mb-3" />
                    <div className="w-3/4 h-6 bg-gray-200 dark:bg-slate-800 rounded mb-3" />
                    <div className="space-y-2 mb-6">
                      <div className="w-full h-4 bg-gray-200 dark:bg-slate-800 rounded" />
                      <div className="w-5/6 h-4 bg-gray-200 dark:bg-slate-800 rounded" />
                    </div>
                  </div>
                  <div className="w-full h-12 bg-gray-200 dark:bg-slate-800 rounded-xl" />
                </div>
              ))}
            </div>
          ) : error && filteredMaterials.length === 0 ? (
            <div role="alert" className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/60">
              <AlertCircle size={48} className="mx-auto text-red-600 mb-3" />
              <p className="text-gray-900 dark:text-white font-bold text-lg">Não foi possível carregar a biblioteca.</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{error}</p>
              <button type="button" onClick={() => setPage(1)} className="mt-4 text-xs font-bold uppercase text-red-600 hover:underline">Tentar novamente</button>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
              <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">Nenhum material encontrado para esta busca.</p>
              <button
                onClick={() => { setSearchInput(""); setSearchQuery(""); setSelectedLevel("all"); setSelectedCategory("all"); setPage(1); }}
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
                    className="interactive-card flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm group"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4 gap-3">
                        <div className="w-12 h-12 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                          <Icon size={24} />
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          {completedMaterialIds.includes(Number(material.id)) && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={13} /> Concluído</span>}
                          <span className="bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold">
                            {material.level}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{material.category}</span>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1 mb-2 group-hover:text-red-600 transition-colors">
                        {material.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3">
                        {material.description || "Recurso didático autoral desenvolvido para prática em sala e estudo autônomo."}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      {sessionStatus === "unauthenticated" && <MaterialLoginLock materialId={Number(material.id)} />}
                      <Link href={`/materiais/${material.id}`} className="w-full">
                        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-sm hover:shadow">
                          <Download size={18} />
                          <span>Visualizar Material</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
              {loadingMore && (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={`skeleton-more-${i}`} className="flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm animate-pulse opacity-70">
                      <div>
                        <div className="flex items-start justify-between mb-4 gap-3">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-slate-800 rounded-xl" />
                          <div className="w-16 h-6 bg-gray-200 dark:bg-slate-800 rounded-full" />
                        </div>
                        <div className="w-24 h-4 bg-gray-200 dark:bg-slate-800 rounded mb-3" />
                        <div className="w-3/4 h-6 bg-gray-200 dark:bg-slate-800 rounded mb-3" />
                        <div className="space-y-2 mb-6">
                          <div className="w-full h-4 bg-gray-200 dark:bg-slate-800 rounded" />
                          <div className="w-5/6 h-4 bg-gray-200 dark:bg-slate-800 rounded" />
                        </div>
                      </div>
                      <div className="w-full h-12 bg-gray-200 dark:bg-slate-800 rounded-xl" />
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {!loading && filteredMaterials.length > 0 && (
            <div className="mt-10 flex flex-col items-center gap-3" aria-live="polite">
              {meta.hasMore ? (
                <button type="button" onClick={() => setPage((current) => current + 1)} disabled={loadingMore} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-600 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-red-950/30">
                  {loadingMore && <Loader2 size={17} className="animate-spin" />}
                  {loadingMore ? "Carregando materiais…" : "Carregar mais materiais"}
                </button>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Todos os {meta.total} materiais disponíveis foram carregados.</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">Exibindo {filteredMaterials.length} de {meta.total} materiais</p>
            </div>
          )}
        </div>
      </section>

      {/* Seção de Guias de Gramática em PDF */}
      <GrammarGuidesSection />
    </div>
  );
}
