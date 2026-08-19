"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, FileArchive, Loader2, Search, SquareCheck, SquareMousePointer, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export type TeacherMaterialZipOption = {
  id: number;
  title: string;
  category: string;
  level: string;
  fileUrl: string | null;
};

const ZIP_LIMIT_BYTES = 40 * 1024 * 1024;
type DifficultyFilter = "all" | "basic" | "intermediate" | "advanced";

function matchesDifficulty(level: string, filter: DifficultyFilter) {
  if (filter === "all") return true;
  const normalized = level.toLocaleLowerCase();
  if (filter === "basic") return normalized.includes("básic") || /\ba[12]\b/.test(normalized);
  if (filter === "intermediate") return normalized.includes("inter") || /\bb[12]\b/.test(normalized);
  return normalized.includes("avanç") || /\bc[12]\b/.test(normalized);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function TeacherMaterialsZipExport({ materials }: { materials: TeacherMaterialZipOption[] }) {
  const selectableMaterials = useMemo(() => materials.filter((material) => Boolean(material.fileUrl)), [materials]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [sizeEstimate, setSizeEstimate] = useState({ totalBytes: 0, unknownCount: 0, exceedsLimit: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const selectAllRef = useRef<HTMLInputElement>(null);

  const selectedCount = selectedIds.size;
  const selectedIdList = useMemo(() => Array.from(selectedIds).sort((a, b) => a - b), [selectedIds]);
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase();
  const filteredMaterials = useMemo(
    () => selectableMaterials.filter((material) => {
      const matchesName = normalizedSearchQuery.length === 0 || material.title.toLocaleLowerCase().includes(normalizedSearchQuery);
      return matchesName && matchesDifficulty(material.level, difficultyFilter);
    }),
    [difficultyFilter, normalizedSearchQuery, selectableMaterials],
  );
  const allVisibleSelected = filteredMaterials.length > 0 && filteredMaterials.every((material) => selectedIds.has(material.id));
  const someVisibleSelected = filteredMaterials.some((material) => selectedIds.has(material.id)) && !allVisibleSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someVisibleSelected;
  }, [someVisibleSelected]);

  useEffect(() => {
    if (selectedIdList.length === 0) {
      setSizeEstimate({ totalBytes: 0, unknownCount: 0, exceedsLimit: false });
      setEstimating(false);
      return;
    }

    const controller = new AbortController();
    setEstimating(true);
    fetch("/api/professor/materials-size", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materialIds: selectedIdList }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || "Não foi possível estimar o tamanho.");
        return payload;
      })
      .then((payload) => setSizeEstimate({
        totalBytes: Number(payload.totalBytes) || 0,
        unknownCount: Number(payload.unknownCount) || 0,
        exceedsLimit: Boolean(payload.exceedsLimit),
      }))
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSizeEstimate({ totalBytes: 0, unknownCount: selectedIdList.length, exceedsLimit: false });
      })
      .finally(() => {
        if (!controller.signal.aborted) setEstimating(false);
      });

    return () => controller.abort();
  }, [selectedIdList]);

  function toggleMaterial(materialId: number) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(materialId)) next.delete(materialId);
      else next.add(materialId);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) filteredMaterials.forEach((material) => next.delete(material.id));
      else filteredMaterials.forEach((material) => next.add(material.id));
      return next;
    });
  }

  async function generateZip() {
    if (selectedIds.size === 0) {
      toast.error("Selecione pelo menos um material antes de gerar o ZIP.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/professor/export-materials-zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialIds: selectedIdList }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!response.ok) {
        const payload = contentType.includes("application/json") ? await response.json() : null;
        throw new Error(payload?.error || "Não foi possível gerar o arquivo ZIP.");
      }

      const blob = await response.blob();
      const filename = response.headers.get("content-disposition")?.match(/filename="([^"]+)"/)?.[1] || "materiais-anderson-palafoz.zip";
      downloadBlob(blob, filename);
      toast.success(`${selectedIdList.length} material(is) compactado(s) com sucesso.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível gerar o arquivo ZIP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="surface-card space-y-5 p-6 sm:p-8" aria-labelledby="teacher-materials-zip-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-red-700 dark:bg-red-950/40 dark:text-red-300">
            <FileArchive size={15} aria-hidden="true" /> Exportação organizada
          </div>
          <h2 id="teacher-materials-zip-title" className="text-xl font-black text-foreground sm:text-2xl">Compactar materiais em ZIP</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Selecione exatamente os materiais que deseja reunir em um único arquivo. Os arquivos originais permanecem no armazenamento da plataforma.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-2 text-sm font-bold text-foreground" aria-live="polite">
          <Check size={16} className="text-green-600" aria-hidden="true" /> {selectedCount} selecionado(s)
        </span>
      </div>

      {materials.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-5 py-8 text-center" role="status">
          <p className="font-semibold text-foreground">Nenhum material cadastrado.</p>
          <p className="mt-1 text-sm text-muted-foreground">Cadastre materiais reais antes de iniciar uma exportação.</p>
        </div>
      ) : selectableMaterials.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-5 py-8 text-center" role="status">
          <p className="font-semibold text-foreground">Nenhum material possui arquivo disponível.</p>
          <p className="mt-1 text-sm text-muted-foreground">Materiais sem arquivo não podem ser incluídos no ZIP.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm font-bold text-foreground">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleAll}
                aria-label={normalizedSearchQuery ? "Selecionar todos os materiais encontrados" : "Selecionar todos os materiais com arquivo"}
                className="h-5 w-5 accent-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
              />
                <span className="inline-flex items-center gap-2"><SquareCheck size={17} aria-hidden="true" /> {normalizedSearchQuery ? "Selecionar resultados" : "Selecionar todos"}</span>
              </label>
              <span className="text-xs text-muted-foreground">{filteredMaterials.length} de {selectableMaterials.length} material(is) visível(is)</span>
            </div>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(12rem,auto)]">
              <div className="relative">
                <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <label htmlFor="teacher-materials-zip-search" className="sr-only">Pesquisar material pelo nome</label>
                <input
                  id="teacher-materials-zip-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Pesquisar material pelo nome…"
                  autoComplete="off"
                  className="min-h-11 w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-red-500 focus:ring-2 focus:ring-red-600/25"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery("")} aria-label="Limpar pesquisa de materiais" className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600">
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
              <div>
                <label htmlFor="teacher-materials-zip-level" className="sr-only">Filtrar materiais por nível de dificuldade</label>
                <select
                  id="teacher-materials-zip-level"
                  value={difficultyFilter}
                  onChange={(event) => setDifficultyFilter(event.target.value as DifficultyFilter)}
                  className="min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-semibold text-foreground outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-600/25"
                >
                  <option value="all">Todos os níveis</option>
                  <option value="basic">Básico</option>
                  <option value="intermediate">Intermediário</option>
                  <option value="advanced">Avançado</option>
                </select>
              </div>
            </div>
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-5 py-8 text-center" role="status">
              <p className="font-semibold text-foreground">Nenhum material encontrado.</p>
              <p className="mt-1 text-sm text-muted-foreground">Ajuste o nome ou o nível de dificuldade para ver outros materiais.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Materiais disponíveis para seleção">
            {filteredMaterials.map((material) => {
              const checked = selectedIds.has(material.id);
              return (
                <label
                  key={material.id}
                  className={`flex min-h-20 cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-[border-color,background-color,box-shadow] duration-200 focus-within:ring-2 focus-within:ring-red-600 focus-within:ring-offset-2 ${checked ? "border-red-500 bg-red-50 shadow-sm dark:border-red-800 dark:bg-red-950/30" : "border-border bg-card hover:border-red-300 hover:bg-muted/50"}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleMaterial(material.id)}
                    aria-label={`Selecionar material ${material.title}`}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-foreground">{material.title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{material.category} · {material.level}</span>
                  </span>
                  <SquareMousePointer size={16} className={checked ? "text-red-600" : "text-muted-foreground/60"} aria-hidden="true" />
                </label>
              );
            })}
            </div>
          )}

          <div className="flex flex-col gap-4 border-t border-border pt-5">
            <div
              className={`rounded-2xl border p-4 ${sizeEstimate.exceedsLimit ? "border-red-500 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200" : "border-border bg-muted/30 text-foreground"}`}
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold">Tamanho total estimado</span>
                <span className="text-sm font-black tabular-nums">
                  {estimating ? "Calculando…" : `${formatBytes(sizeEstimate.totalBytes)} / ${formatBytes(ZIP_LIMIT_BYTES)}`}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10" aria-hidden="true">
                <div className={`h-full rounded-full transition-[width] duration-200 ${sizeEstimate.exceedsLimit ? "bg-red-600" : "bg-green-600"}`} style={{ width: `${Math.min((sizeEstimate.totalBytes / ZIP_LIMIT_BYTES) * 100, 100)}%` }} />
              </div>
              <p className="mt-2 text-xs leading-5 opacity-80">
                {sizeEstimate.exceedsLimit
                  ? "A seleção ultrapassa o limite de 40 MB. Remova materiais antes de gerar o ZIP."
                  : sizeEstimate.unknownCount > 0
                    ? `${sizeEstimate.unknownCount} arquivo(s) não permitiram estimativa; o servidor validará o tamanho real antes de compactar.`
                    : "Estimativa baseada no tamanho dos arquivos de origem; o ZIP pode variar alguns bytes após a compactação."}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-muted-foreground">Limite de segurança: até 50 materiais e 40 MB por ZIP.</p>
              <Button type="button" onClick={generateZip} disabled={loading || estimating || selectedCount === 0 || sizeEstimate.exceedsLimit} className="min-h-11 gap-2 bg-red-600 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <Download size={17} aria-hidden="true" />}
                {loading ? "Gerando ZIP…" : "Gerar ZIP selecionado"}
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
