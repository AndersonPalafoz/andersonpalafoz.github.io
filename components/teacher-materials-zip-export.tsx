"use client";

import { useMemo, useState } from "react";
import { Archive, Check, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface TeacherMaterial {
  id: number;
  title: string;
  fileUrl: string | null;
  category: string;
  level: string;
}

export function TeacherMaterialsZipExport({ materials }: { materials: TeacherMaterial[] }) {
  const exportableMaterials = useMemo(() => materials.filter((material) => Boolean(material.fileUrl)), [materials]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [archiveName, setArchiveName] = useState("materiais-anderson-palafoz");
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportLink, setLastExportLink] = useState<string | null>(null);

  const allSelected = exportableMaterials.length > 0 && exportableMaterials.every((material) => selectedIds.includes(material.id));

  const toggleMaterial = (id: number) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : exportableMaterials.map((material) => material.id));
  };

  const handleExport = async () => {
    if (selectedIds.length === 0) {
      toast.error("Selecione pelo menos um material para compactar.");
      return;
    }

    setIsExporting(true);
    setLastExportLink(null);
    try {
      const response = await fetch("/api/professor/export-materials-zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialIds: selectedIds, archiveName }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Não foi possível exportar o arquivo ZIP.");
      }

      setLastExportLink(payload.webViewLink || null);
      toast.success(payload.reused ? "O ZIP já existia no seu Google Drive e foi reutilizado." : "Materiais compactados e exportados para o seu Google Drive.");
      if (payload.webViewLink) {
        window.open(payload.webViewLink, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível exportar os materiais.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="surface-card space-y-5 p-6 sm:p-8" aria-labelledby="teacher-zip-export-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-red-700 dark:bg-red-950/30 dark:text-red-300">
            <Archive size={15} aria-hidden="true" />
            Exportação organizada
          </div>
          <h2 id="teacher-zip-export-title" className="text-xl font-bold text-foreground">Compactar materiais em ZIP</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Selecione materiais reais já cadastrados para gerar um único arquivo ZIP no seu Google Drive particular. Os arquivos originais permanecem inalterados na plataforma.
          </p>
        </div>
        <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground">
          Até 50 materiais · 40 MB
        </span>
      </div>

      {exportableMaterials.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground">
          Nenhum material recente com arquivo disponível para compactação.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/25 p-4 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1 text-sm font-semibold text-foreground">
              Nome do arquivo ZIP
              <input
                value={archiveName}
                onChange={(event) => setArchiveName(event.target.value)}
                maxLength={100}
                className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal text-foreground outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                aria-describedby="teacher-zip-name-help"
              />
              <span id="teacher-zip-name-help" className="mt-1 block text-xs font-normal text-muted-foreground">A extensão .zip será adicionada automaticamente.</span>
            </label>
            <Button
              type="button"
              variant="outline"
              onClick={toggleAll}
              className="h-10 shrink-0 gap-2"
              aria-pressed={allSelected}
            >
              <Check size={16} aria-hidden="true" />
              {allSelected ? "Limpar seleção" : "Selecionar todos"}
            </Button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Materiais disponíveis para compactação">
            {exportableMaterials.map((material) => {
              const checked = selectedIds.includes(material.id);
              return (
                <label
                  key={material.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${checked ? "border-red-300 bg-red-50/70 dark:border-red-800 dark:bg-red-950/20" : "border-border/70 bg-background hover:border-red-200"}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleMaterial(material.id)}
                    className="mt-1 h-4 w-4 accent-red-600"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">{material.title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{material.category} · {material.level}</span>
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {selectedIds.length} material(is) selecionado(s). A compactação acontece temporariamente no servidor e não ocupa espaço no Neon.
            </p>
            <Button
              type="button"
              onClick={handleExport}
              disabled={isExporting || selectedIds.length === 0}
              className="h-11 gap-2 bg-red-600 text-white shadow-sm shadow-red-600/20 hover:bg-red-700"
            >
              {isExporting ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <Archive size={17} aria-hidden="true" />}
              {isExporting ? "Compactando e enviando..." : "Compactar e exportar para o Drive"}
            </Button>
          </div>

          {lastExportLink && (
            <a
              href={lastExportLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-700 underline-offset-4 hover:underline dark:text-red-300"
            >
              <ExternalLink size={15} aria-hidden="true" /> Abrir o ZIP no Google Drive
            </a>
          )}
        </>
      )}
    </section>
  );
}
