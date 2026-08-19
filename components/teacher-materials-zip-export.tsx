"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, FileArchive, Loader2, SquareCheck, SquareMousePointer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export type TeacherMaterialZipOption = {
  id: number;
  title: string;
  category: string;
  level: string;
  fileUrl: string | null;
};

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
  const selectAllRef = useRef<HTMLInputElement>(null);

  const selectedCount = selectedIds.size;
  const allSelected = selectableMaterials.length > 0 && selectedCount === selectableMaterials.length;
  const someSelected = selectedCount > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected;
  }, [someSelected]);

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
      if (selectableMaterials.length > 0 && current.size === selectableMaterials.length) return new Set();
      return new Set(selectableMaterials.map((material) => material.id));
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
        body: JSON.stringify({ materialIds: Array.from(selectedIds) }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!response.ok) {
        const payload = contentType.includes("application/json") ? await response.json() : null;
        throw new Error(payload?.error || "Não foi possível gerar o arquivo ZIP.");
      }

      const blob = await response.blob();
      const filename = response.headers.get("content-disposition")?.match(/filename="([^"]+)"/)?.[1] || "materiais-anderson-palafoz.zip";
      downloadBlob(blob, filename);
      toast.success(`${selectedIds.size} material(is) compactado(s) com sucesso.`);
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
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm font-bold text-foreground">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                aria-label="Selecionar todos os materiais com arquivo"
                className="h-5 w-5 accent-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
              />
              <span className="inline-flex items-center gap-2"><SquareCheck size={17} aria-hidden="true" /> Selecionar todos</span>
            </label>
            <span className="text-xs text-muted-foreground">{selectableMaterials.length} material(is) disponível(is)</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Materiais disponíveis para seleção">
            {selectableMaterials.map((material) => {
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

          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-muted-foreground">Limite de segurança: até 50 materiais e 40 MB por ZIP.</p>
            <Button type="button" onClick={generateZip} disabled={loading || selectedCount === 0} className="min-h-11 gap-2 bg-red-600 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <Download size={17} aria-hidden="true" />}
              {loading ? "Gerando ZIP…" : "Gerar ZIP selecionado"}
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
