"use client";

import { useEffect, useRef, useState } from "react";
import { FileUp, Loader2, ShieldCheck, UploadCloud } from "lucide-react";
import { BRAND_ASSETS } from "@/lib/brand-assets";
import {
  parseCertificateComposition,
  type CertificateCompositionElement,
  type CertificateFieldKey,
  type CertificateFieldMapping,
  type CertificateVisualVariant,
} from "@/lib/certificate-composition";
import { useCertificateWorkspace } from "@/components/certificate-workspace-context";
import {
  CERTIFICATE_VISUAL_VARIANT_LIST,
  getCertificateVisualVariant,
} from "@/lib/certificate-visual-variants";

type CertificateTemplate = {
  id: number;
  name: string;
  category: "internal" | "external";
  institution: string | null;
  isDefault: boolean;
  templateUrl: string | null;
  includeSiteBranding: boolean;
  fieldMappings: string | null;
  createdAt: string;
};

export function CertificateTemplateManager() {
  const {
    composition,
    sampleData,
    updateComposition,
    setSampleData,
    setIncludeSiteBranding: setWorkspaceBranding,
    visualVariant,
    setVisualVariant,
  } = useCertificateWorkspace();
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [category, setCategory] = useState<"internal" | "external">("internal");
  const [includeSiteBranding, setIncludeSiteBranding] = useState(true);
  const [previewName, setPreviewName] = useState(sampleData.studentName);
  const [previewCourse, setPreviewCourse] = useState(sampleData.courseTitle);
  const [previewCode, setPreviewCode] = useState(sampleData.certificateCode);
  const [previewDate, setPreviewDate] = useState(sampleData.issuedAt);
  const [activePreset, setActivePreset] = useState<CertificateVisualVariant>(visualVariant);

  const [customElements, setCustomElements] = useState<CertificateCompositionElement[]>(composition.elements);

  const [fieldMappings, setFieldMappings] = useState<
    Partial<Record<CertificateFieldKey, CertificateFieldMapping>>
  >(() => parseCertificateComposition(composition).fieldMappings);
  const [fieldMappingsText, setFieldMappingsText] = useState(() =>
    JSON.stringify(parseCertificateComposition(composition).fieldMappings, null, 2)
  );
  const draggingField = useRef<CertificateFieldKey | null>(null);
  const canvasShellRef = useRef<HTMLDivElement | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const CANVAS_WIDTH = 760;
  const CANVAS_HEIGHT = 500;

  useEffect(() => {
    setCustomElements(composition.elements);
    setFieldMappings(composition.fieldMappings);
    setFieldMappingsText(JSON.stringify(composition.fieldMappings, null, 2));
  }, [composition.elements, composition.fieldMappings]);

  useEffect(() => {
    setActivePreset(visualVariant);
  }, [visualVariant]);

  useEffect(() => {
    const shell = canvasShellRef.current;
    if (!shell || typeof ResizeObserver === "undefined") return;

    const updateScale = () => {
      const availableWidth = Math.max(0, shell.clientWidth - 24);
      setCanvasScale(
        Math.max(0.35, Math.min(1, availableWidth / CANVAS_WIDTH))
      );
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(shell);
    return () => observer.disconnect();
  }, []);

  const previewFields: Array<{
    key: CertificateFieldKey;
    label: string;
    value: string;
  }> = [
    { key: "studentName", label: "Nome do aluno", value: previewName },
    { key: "courseTitle", label: "Curso / Componente", value: previewCourse },
    { key: "level", label: "Nível", value: sampleData.level },
    { key: "issuedAt", label: "Data de emissão", value: previewDate },
    { key: "certificateCode", label: "Código de verificação", value: previewCode },
    { key: "workloadHours", label: "Carga horária (CH)", value: sampleData.workloadHours },
    { key: "studentCpf", label: "CPF do aluno", value: sampleData.studentCpf },
    { key: "period", label: "Período / Dias", value: sampleData.period },
    { key: "coordinatorName", label: "Coordenador / Professor", value: sampleData.coordinatorName },
    { key: "institutionName", label: "Instituição parceira", value: sampleData.institutionName },
  ];
  const currentVariant = getCertificateVisualVariant(visualVariant);

  function commitFieldMappings(next: Partial<Record<CertificateFieldKey, CertificateFieldMapping>>) {
    setFieldMappings(next);
    updateComposition(current => ({
      ...current,
      fieldMappings: { ...current.fieldMappings, ...next },
    }));
  }

  function commitElements(next: CertificateCompositionElement[]) {
    setCustomElements(next);
    updateComposition(current => ({ ...current, elements: next }));
  }

  function applyPreset(preset: CertificateVisualVariant) {
    setActivePreset(preset);
    setVisualVariant(preset);
    let next: Partial<Record<CertificateFieldKey, CertificateFieldMapping>> = {};
    if (preset === "profici") {
      next = {
        institutionName: { x: 70, y: 70, size: 11, maxWidth: 350 },
        studentName: { x: 120, y: 210, size: 20, maxWidth: 540 },
        studentCpf: { x: 120, y: 240, size: 12, maxWidth: 220 },
        courseTitle: { x: 120, y: 280, size: 15, maxWidth: 520 },
        level: { x: 500, y: 280, size: 14, maxWidth: 180 },
        workloadHours: { x: 120, y: 320, size: 12, maxWidth: 180 },
        period: { x: 300, y: 320, size: 12, maxWidth: 260 },
        issuedAt: { x: 120, y: 420, size: 11, maxWidth: 180 },
        coordinatorName: { x: 480, y: 420, size: 11, maxWidth: 220 },
        certificateCode: { x: 560, y: 460, size: 10, maxWidth: 180 },
      };
    } else if (preset === "isf") {
      next = {
        institutionName: { x: 60, y: 60, size: 11, maxWidth: 380 },
        studentName: { x: 100, y: 200, size: 21, maxWidth: 560 },
        studentCpf: { x: 100, y: 235, size: 12, maxWidth: 220 },
        courseTitle: { x: 100, y: 275, size: 16, maxWidth: 520 },
        level: { x: 480, y: 275, size: 14, maxWidth: 200 },
        workloadHours: { x: 100, y: 315, size: 12, maxWidth: 180 },
        period: { x: 290, y: 315, size: 12, maxWidth: 260 },
        coordinatorName: { x: 460, y: 410, size: 11, maxWidth: 220 },
        issuedAt: { x: 100, y: 410, size: 11, maxWidth: 180 },
        certificateCode: { x: 540, y: 455, size: 10, maxWidth: 180 },
      };
    } else if (preset === "minimal") {
      next = {
        studentName: { x: 90, y: 315, size: 27, maxWidth: 650, weight: "bold" },
        courseTitle: { x: 90, y: 250, size: 19, maxWidth: 620, weight: "bold" },
        level: { x: 90, y: 215, size: 13, maxWidth: 260 },
        issuedAt: { x: 90, y: 120, size: 11, maxWidth: 180 },
        certificateCode: { x: 90, y: 95, size: 10, maxWidth: 240 },
        workloadHours: { x: 390, y: 215, size: 13, maxWidth: 170 },
        studentCpf: { x: 90, y: 285, size: 11, maxWidth: 260 },
        period: { x: 560, y: 215, size: 13, maxWidth: 190 },
        coordinatorName: { x: 560, y: 120, size: 11, maxWidth: 190 },
        institutionName: { x: 90, y: 505, size: 13, maxWidth: 360 },
      };
    } else {
      next = {
        studentName: { x: 250, y: 190, size: 22, maxWidth: 520 },
        courseTitle: { x: 280, y: 260, size: 16, maxWidth: 480 },
        level: { x: 300, y: 300, size: 13, maxWidth: 300 },
        issuedAt: { x: 70, y: 430, size: 11, maxWidth: 180 },
        certificateCode: { x: 560, y: 430, size: 11, maxWidth: 200 },
        workloadHours: { x: 300, y: 330, size: 12, maxWidth: 180 },
        studentCpf: { x: 250, y: 225, size: 12, maxWidth: 220 },
        period: { x: 300, y: 360, size: 12, maxWidth: 240 },
        coordinatorName: { x: 480, y: 430, size: 11, maxWidth: 200 },
        institutionName: { x: 70, y: 80, size: 12, maxWidth: 300 },
      };
    }
    commitFieldMappings(next);
  }

  function handleFieldDragStart(
    event: React.DragEvent<HTMLDivElement>,
    key: CertificateFieldKey
  ) {
    draggingField.current = key;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", key);
  }

  function handleFieldDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const key = (event.dataTransfer.getData("text/plain") ||
      draggingField.current) as CertificateFieldKey | null;
    if (!key) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const scale = canvasScale || 1;
    const x = Math.max(
      12,
      Math.min(730, (event.clientX - bounds.left) / scale)
    );
    const y = Math.max(
      12,
      Math.min(470, (event.clientY - bounds.top) / scale)
    );
    const nextMappings = {
      ...fieldMappings,
      [key]: {
        ...fieldMappings[key],
        x: Math.round(x),
        // pdf-lib uses a bottom-left origin; convert from the visual top-left canvas.
        y: Math.round(500 - y),
      },
    };
    commitFieldMappings(nextMappings);
    draggingField.current = null;
  }

  async function loadTemplates() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/certificate-templates", {
        cache: "no-store",
      });
      const text = await response.text();
      let payload: any = {};
      try {
        payload = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Resposta inválida do servidor ao carregar modelos.");
      }
      if (!response.ok)
        throw new Error(
          payload.error || "Não foi possível carregar os modelos."
        );
      if (!Array.isArray(payload.templates))
        throw new Error("Resposta inválida do servidor ao carregar modelos.");
      setTemplates(payload.templates);
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os modelos.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTemplates();
  }, []);

  useEffect(() => {
    setFieldMappingsText(JSON.stringify(fieldMappings, null, 2));
  }, [fieldMappings]);

  useEffect(() => {
    setPreviewName(sampleData.studentName);
    setPreviewCourse(sampleData.courseTitle);
    setPreviewCode(sampleData.certificateCode);
    setPreviewDate(sampleData.issuedAt);
  }, [sampleData]);

  useEffect(() => {
    setFieldMappings(parseCertificateComposition(composition).fieldMappings);
    setCustomElements(parseCertificateComposition(composition).elements);
    setFieldMappingsText(JSON.stringify(parseCertificateComposition(composition).fieldMappings, null, 2));
  }, [composition]);

  function handleCategoryChange(value: "internal" | "external") {
    setCategory(value);
    // Internos começam com branding, mas externos não recebem uma regra forçada:
    // o administrador precisa confirmar a escolha no formulário e novamente na emissão.
    const nextBranding = value === "internal";
    setIncludeSiteBranding(nextBranding);
    setWorkspaceBranding(nextBranding);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("category", category);
    formData.set("includeSiteBranding", String(includeSiteBranding));
    formData.set(
      "fieldMappings",
      JSON.stringify({ ...composition, fieldMappings, elements: customElements })
    );

    try {
      const response = await fetch("/api/admin/certificate-templates", {
        method: "POST",
        body: formData,
      });
      const text = await response.text();
      let payload: {
        error?: string;
        message?: string;
      } = {};
      try {
        payload = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Resposta inválida do servidor ao cadastrar o modelo.");
      }
      if (!response.ok)
        throw new Error(
          payload.error || "Não foi possível cadastrar o modelo."
        );
      setFeedback({
        type: "success",
        text: payload.message || "Modelo cadastrado com sucesso.",
      });
      form.reset();
      setCategory("internal");
      setIncludeSiteBranding(true);
      await loadTemplates();
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível cadastrar o modelo.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="surface-card space-y-2 border border-border/70 p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 shrink-0 text-red-600" size={22} />
          <div>
            <h2 className="text-xl font-black text-foreground">
              Modelos e identidade do certificado
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Cadastre um modelo interno ou um documento institucional de
              terceiros. Para cursos externos, a plataforma perguntará
              explicitamente na emissão se a logo do site deve ser incluída;
              esta opção define apenas a preferência do modelo.
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${feedback.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200" : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200"}`}
        >
          {feedback.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="surface-card grid gap-5 border border-border/70 p-6 lg:grid-cols-2"
      >
        <div className="space-y-2">
          <label
            htmlFor="certificate-template-name"
            className="text-sm font-bold text-foreground"
          >
            Nome do modelo
          </label>
          <input
            id="certificate-template-name"
            name="name"
            required
            minLength={2}
            maxLength={180}
            placeholder="Ex.: Modelo IsF 2026"
            className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="certificate-template-category"
            className="text-sm font-bold text-foreground"
          >
            Contexto
          </label>
          <select
            id="certificate-template-category"
            name="category"
            value={category}
            onChange={event =>
              handleCategoryChange(
                event.target.value as "internal" | "external"
              )
            }
            className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
          >
            <option value="internal">Curso interno da plataforma</option>
            <option value="external">Curso/turma externa</option>
          </select>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="certificate-template-institution"
            className="text-sm font-bold text-foreground"
          >
            Instituição associada{" "}
            <span className="font-normal text-muted-foreground">
              (opcional)
            </span>
          </label>
          <input
            id="certificate-template-institution"
            name="institution"
            maxLength={120}
            placeholder="UFBA / IsF, PROFICI, SIMAL..."
            className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="certificate-template-file"
            className="text-sm font-bold text-foreground"
          >
            Arquivo do modelo
          </label>
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-3">
            <FileUp className="shrink-0 text-red-600" size={20} />
            <input
              id="certificate-template-file"
              name="file"
              type="file"
              accept="application/pdf,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
              required
              className="min-w-0 flex-1 text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-red-700"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            PDF, PNG ou DOCX (.docx), até 10 MB.
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-4 lg:col-span-2">
          <h3 className="text-sm font-black text-foreground">
            Mapeamento dinâmico e pré-visualização em tempo real
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Informe abaixo os valores de teste para visualizar em tempo real
            como as variáveis preencherão o certificado.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-xs font-bold text-foreground">
              Nome de teste
              <input
                type="text"
                value={previewName}
                onChange={e => {
                  setPreviewName(e.target.value);
                  setSampleData({ studentName: e.target.value });
                }}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-red-600"
              />
            </label>
            <label className="block text-xs font-bold text-foreground">
              Curso de teste
              <input
                type="text"
                value={previewCourse}
                onChange={e => {
                  setPreviewCourse(e.target.value);
                  setSampleData({ courseTitle: e.target.value });
                }}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-red-600"
              />
            </label>
            <label className="block text-xs font-bold text-foreground">
              Código de autenticidade
              <input
                type="text"
                value={previewCode}
                onChange={e => {
                  setPreviewCode(e.target.value);
                  setSampleData({ certificateCode: e.target.value });
                }}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-red-600"
              />
            </label>
            <label className="block text-xs font-bold text-foreground">
              Data de emissão
              <input
                type="text"
                value={previewDate}
                onChange={e => {
                  setPreviewDate(e.target.value);
                  setSampleData({ issuedAt: e.target.value });
                }}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-red-600"
              />
            </label>
          </div>
          <div className="rounded-xl border border-dashed border-red-600/40 bg-background p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-red-600">
                    Identidade visual do certificado
                  </p>
                  <h4 className="mt-1 text-base font-black text-foreground sm:text-lg">
                    Escolha uma variação antes de editar os campos
                  </h4>
                  <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">
                    A seleção altera a moldura, a hierarquia, os detalhes institucionais e a prévia compartilhada. As posições dos campos continuam editáveis na prancheta.
                  </p>
                </div>
                <div className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                  Ativa: {getCertificateVisualVariant(visualVariant).shortLabel}
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {CERTIFICATE_VISUAL_VARIANT_LIST.map(variant => {
                  const isActive = activePreset === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => applyPreset(variant.id)}
                      className={`group rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${isActive ? "border-red-600 bg-red-50 shadow-sm dark:border-red-500 dark:bg-red-950/30" : "border-border bg-muted/20 hover:border-red-300 hover:bg-muted/40"}`}
                      aria-pressed={isActive}
                    >
                      <span className="mb-2 flex items-center justify-between gap-2">
                        <span className="h-3 w-10 rounded-full" style={{ backgroundColor: variant.accent }} />
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${isActive ? "bg-red-600 text-white" : "bg-background text-muted-foreground"}`}>
                          {isActive ? "Ativa" : variant.shortLabel}
                        </span>
                      </span>
                      <span className="block text-xs font-black text-foreground">{variant.label}</span>
                      <span className="mt-1 block text-[10px] leading-relaxed text-muted-foreground">{variant.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
              <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Variáveis disponíveis
                </p>
                {previewFields.map(field => (
                  <div
                    key={field.key}
                    draggable
                    onDragStart={event =>
                      handleFieldDragStart(event, field.key)
                    }
                    className="cursor-grab rounded-lg border border-border bg-background px-2.5 py-2 text-[11px] font-bold text-foreground shadow-sm transition hover:border-red-600 hover:text-red-600 active:cursor-grabbing"
                    title={`Arrastar ${field.label} para o certificado`}
                  >
                    <span className="block font-mono text-[10px] text-red-600">
                      {`{{${field.key}}}`}
                    </span>
                    <span className="mt-0.5 block truncate">{field.label}</span>
                  </div>
                ))}
              </div>
              <div
                ref={canvasShellRef}
                className="min-w-0 overflow-hidden rounded-xl border border-border bg-slate-100 p-3 dark:bg-slate-900"
              >
                <div
                  className="relative mx-auto overflow-hidden rounded-lg border-2 shadow-inner"
                  style={{
                    width: `${CANVAS_WIDTH * canvasScale}px`,
                    height: `${CANVAS_HEIGHT * canvasScale}px`,
                    borderColor: currentVariant.accent,
                    backgroundColor: currentVariant.paper,
                  }}
                >
                  <div
                    className="relative h-[500px] w-[760px] origin-top-left overflow-hidden"
                    style={{ transform: `scale(${canvasScale})` }}
                    onDragOver={event => event.preventDefault()}
                    onDrop={handleFieldDrop}
                    aria-label={`Canvas de posicionamento do certificado: ${currentVariant.label}`}
                  >
                  <div className="pointer-events-none absolute inset-[18px] rounded-md border" style={{ borderColor: currentVariant.border }} />
                  {currentVariant.motif === "double" && <div className="pointer-events-none absolute inset-[30px] rounded border" style={{ borderColor: `${currentVariant.accent}66` }} />}
                  {currentVariant.motif === "institutional" && <div className="pointer-events-none absolute left-0 top-0 h-full w-4" style={{ backgroundColor: currentVariant.accent }} />}
                  {currentVariant.motif === "editorial" && <div className="pointer-events-none absolute left-0 top-0 h-10 w-full" style={{ backgroundColor: currentVariant.ink }} />}
                  <div className="pointer-events-none absolute left-10 top-7 z-[1] text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: currentVariant.accent }}>{currentVariant.headerLabel}</div>
                  {includeSiteBranding && (
                    <div className="absolute left-1/2 top-5 -translate-x-1/2 rounded-lg bg-white/95 px-3 py-2 shadow-sm ring-1 ring-red-600/10">
                      {/* A marca é exibida como ativo oficial, sem reconstrução textual. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={BRAND_ASSETS.monochrome}
                        alt="Logo monocromática Anderson Palafoz"
                        className="h-12 w-28 object-contain"
                      />
                    </div>
                  )}
                  <p className="absolute left-1/2 top-24 -translate-x-1/2 text-xs" style={{ color: currentVariant.muted }}>
                    Certificamos para os devidos fins que
                  </p>
                  {previewFields.map(field => {
                    const mapping = fieldMappings[field.key] ?? {
                      x: 100,
                      y: 250,
                      size: 12,
                    };
                    const top = Math.max(8, Math.min(480, 500 - mapping.y));
                    return (
                      <div
                        key={field.key}
                        draggable
                        role="button"
                        tabIndex={0}
                        onDragStart={event =>
                          handleFieldDragStart(event, field.key)
                        }
                        onKeyDown={event => {
                          const step = event.shiftKey ? 10 : 2;
                          if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
                          event.preventDefault();
                          const existing = fieldMappings[field.key] ?? mapping;
                          commitFieldMappings({
                            ...fieldMappings,
                            [field.key]: {
                              ...existing,
                              x: Math.max(
                                12,
                                Math.min(
                                  730,
                                  existing.x +
                                    (event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0)
                                )
                              ),
                              y: Math.max(
                                12,
                                Math.min(
                                  488,
                                  existing.y +
                                    (event.key === "ArrowDown" ? -step : event.key === "ArrowUp" ? step : 0)
                                )
                              ),
                            },
                          });
                        }}
                        className="absolute max-w-[240px] cursor-grab rounded-md border px-2 py-1 text-left shadow-sm outline-none transition hover:z-10 hover:scale-[1.02] focus:z-10 focus:ring-2 focus:ring-red-600 active:cursor-grabbing"
                        style={{
                          left: mapping.x,
                          top,
                          fontSize: mapping.size ? `${Math.min(mapping.size, 18)}px` : undefined,
                          borderColor: `${currentVariant.accent}99`,
                          backgroundColor: currentVariant.accentSoft,
                          color: currentVariant.ink,
                        }}
                        aria-label={`Variável ${field.label}. Posição X ${mapping.x}, Y ${mapping.y}. Tamanho ${mapping.size || 12}px.`}
                        title="Arraste para reposicionar; use as setas para ajustes finos"
                      >
                        <span className="block font-mono text-[9px] font-black text-red-600">
                          {`{{${field.key}}} (${mapping.size || 12}px)`}
                        </span>
                        <span className="block truncate text-xs font-bold text-foreground">
                          {field.value}
                        </span>
                      </div>
                    );
                  })}
                  {customElements.map(element => {
                    if (element.visible === false || (!includeSiteBranding && element.isSiteBranding)) return null;
                    const left = (element.x / 842) * CANVAS_WIDTH;
                    const top = ((595 - element.y) / 595) * CANVAS_HEIGHT;
                    const width = element.width ? (element.width / 842) * CANVAS_WIDTH : undefined;
                    const height = element.height ? (element.height / 595) * CANVAS_HEIGHT : undefined;
                    if (element.type === "image") {
                      return (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={element.id}
                          src={element.content}
                          alt="Elemento visual da composição"
                          className="absolute -translate-y-1/2 object-contain"
                          style={{ left, top, width, height, opacity: element.opacity ?? 1, zIndex: element.zIndex || 0 }}
                        />
                      );
                    }
                    if (element.type === "line") {
                      return <div key={element.id} className="absolute h-0.5 -translate-y-1/2 rounded-full" style={{ left, top, width: width || 180, backgroundColor: element.color || "#dc2626", opacity: element.opacity ?? 1, zIndex: element.zIndex || 0 }} />;
                    }
                    return (
                      <div
                        key={element.id}
                        className="absolute -translate-y-1/2 whitespace-pre-wrap break-words rounded-md border border-slate-400/60 bg-white/80 px-1.5 py-1 text-left shadow-sm"
                        style={{ left, top, width, color: element.color || "#24313a", fontSize: Math.min(element.size || 14, 18), fontWeight: element.weight === "bold" || element.type === "badge" ? 800 : 500, zIndex: element.zIndex || 0 }}
                      >
                        {element.content}
                      </div>
                    );
                  })}
                  <div className="absolute bottom-5 left-8 right-8 flex justify-between border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
                    <span>Arraste os campos para definir o posicionamento</span>
                    <span>Tamanho de fonte customizável abaixo</span>
                  </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4 lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <p className="text-xs font-black uppercase tracking-wider text-foreground">
                    Biblioteca de Elementos (Arraste ou Clique para Inserir)
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        commitElements([
                          ...customElements,
                          {
                            id: `text_${Date.now()}`,
                            type: "text",
                            content: "Texto personalizado",
                            x: 350,
                            y: 250,
                            size: 14,
                            color: "#1e293b",
                            align: "center",
                          },
                        ]);
                      }}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition"
                    >
                      + Adicionar Texto Livre
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        commitElements([
                          ...customElements,
                          {
                            id: `image_${Date.now()}`,
                            type: "image",
                            content: BRAND_ASSETS.principal,
                            x: 350,
                            y: 80,
                            size: 12,
                            width: 60,
                            height: 60,
                            zIndex: customElements.length + 1,
                          },
                        ]);
                      }}
                      className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition"
                    >
                      + Adicionar Logo / Imagem
                    </button>
                  </div>
                </div>

                {customElements.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-muted-foreground">Elementos Customizados Adicionados:</p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {customElements.map((el, index) => (
                        <div key={el.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-2 text-xs">
                          <span className="font-bold truncate max-w-[120px]">
                            {el.type === "text" ? `Texto: ${el.content}` : `Imagem ${index + 1}`}
                          </span>
                          <div className="flex items-center gap-1">
                            {el.type === "text" && (
                              <input
                                type="text"
                                value={el.content}
                                onChange={e => {
                                  const val = e.target.value;
                                  commitElements(customElements.map(item => item.id === el.id ? { ...item, content: val } : item));
                                }}
                                className="h-6 w-24 rounded border border-border px-1 text-[11px]"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => commitElements(customElements.filter(item => item.id !== el.id))}
                              className="text-red-600 hover:text-red-700 font-bold px-1"
                              title="Remover elemento"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs font-black uppercase tracking-wider text-foreground pt-2">
                  Ajuste fino de tipografia por variável
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {previewFields.map(field => {
                    const mapping = fieldMappings[field.key] ?? { x: 100, y: 250, size: 12 };
                    return (
                      <div key={field.key} className="rounded-lg border border-border bg-background p-3 space-y-2">
                        <span className="block text-[11px] font-bold text-foreground truncate" title={field.label}>
                          {field.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-muted-foreground">Fonte:</label>
                              <input
                            type="number"
                            min={8}
                            max={48}
                            value={mapping.size || 12}
                            onChange={e => {
                              const size = Number(e.target.value);
                              commitFieldMappings({
                                ...fieldMappings,
                                [field.key]: { ...mapping, size: isNaN(size) ? 12 : size },
                              });
                            }}
                            className="h-7 w-16 rounded border border-border bg-background px-1 text-xs font-mono text-foreground"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              commitFieldMappings({
                                ...fieldMappings,
                                [field.key]: { ...mapping, x: 250 }, // Centralizar horizontalmente
                              });
                            }}
                            className="rounded bg-muted px-1.5 py-1 text-[10px] font-bold text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            title="Alinhar ao centro da página"
                          >
                            Centralizar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <fieldset className="rounded-2xl border border-border/70 bg-muted/20 p-4 lg:col-span-2">
          <legend className="px-1 text-sm font-black text-foreground">
            Pergunta de branding para este modelo
          </legend>
          <p className="mt-1 text-sm text-muted-foreground">
            Ao emitir um certificado externo com este modelo, a logo do site
            deve aparecer?
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${includeSiteBranding ? "border-red-600 bg-red-500/10" : "border-border bg-background"}`}
            >
              <input
                type="radio"
                name="branding-choice"
                checked={includeSiteBranding}
                onChange={() => { setIncludeSiteBranding(true); setWorkspaceBranding(true); }}
                className="mt-1 accent-red-600"
              />
              <span>
                <strong className="block text-sm text-foreground">
                  Incluir logo do site
                </strong>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Adiciona a identificação da plataforma quando autorizado.
                </span>
              </span>
            </label>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${!includeSiteBranding ? "border-red-600 bg-red-500/10" : "border-border bg-background"}`}
            >
              <input
                type="radio"
                name="branding-choice"
                checked={!includeSiteBranding}
                onChange={() => { setIncludeSiteBranding(false); setWorkspaceBranding(false); }}
                className="mt-1 accent-red-600"
              />
              <span>
                <strong className="block text-sm text-foreground">
                  Não incluir logo do site
                </strong>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Preserva somente a identidade do modelo institucional.
                </span>
              </span>
            </label>
          </div>
        </fieldset>

        <div className="space-y-2 lg:col-span-2">
          <label
            htmlFor="certificate-template-field-mappings"
            className="text-sm font-bold text-foreground"
          >
            Mapeamento de campos{" "}
            <span className="font-normal text-muted-foreground">
              (JSON opcional)
            </span>
          </label>
          <textarea
            id="certificate-template-field-mappings"
            name="fieldMappings"
            rows={8}
            value={fieldMappingsText}
                onChange={event => {
              const nextText = event.target.value;
              setFieldMappingsText(nextText);
              try {
                const parsed = JSON.parse(nextText);
                if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                  const normalized = parseCertificateComposition(parsed);
                  commitFieldMappings(normalized.fieldMappings);
                  if (Array.isArray((parsed as { elements?: unknown }).elements)) {
                    commitElements(normalized.elements);
                  }
                }
              } catch {
                // Permite edição manual temporária até que o JSON seja válido.
              }
            }}
            aria-describedby="certificate-template-field-mappings-help"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-xs text-foreground outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
          />
          <p
            id="certificate-template-field-mappings-help"
            className="text-xs text-muted-foreground"
          >
            O JSON é atualizado automaticamente ao arrastar uma variável. Você
            também pode editar coordenadas manualmente; o cadastro só será
            aceito quando o conteúdo for um objeto JSON válido.
          </p>
        </div>

        <label className="flex items-center gap-3 text-sm font-semibold text-foreground lg:col-span-2">
          <input
            type="checkbox"
            name="isDefault"
            className="h-4 w-4 accent-red-600"
          />{" "}
          Definir como modelo padrão desta categoria
        </label>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 lg:col-span-2"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <UploadCloud size={18} />
          )}{" "}
          {saving ? "Salvando modelo..." : "Cadastrar modelo de certificado"}
        </button>
      </form>

      <div className="surface-card border border-border/70 p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-foreground">
              Modelos cadastrados
            </h2>
            <p className="text-sm text-muted-foreground">
              A preferência de branding fica visível antes de qualquer emissão.
            </p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
            {templates.length} modelo(s)
          </span>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={16} className="animate-spin" /> Carregando modelos...
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
            <p className="text-sm font-bold text-foreground">
              Nenhum modelo cadastrado ainda.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecione um PDF, PNG ou DOCX no formulário acima e clique em
              “Cadastrar modelo de certificado”. Os modelos aparecerão aqui após
              o cadastro ser confirmado pelo servidor.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {templates.map(template => (
              <article
                key={template.id}
                className="rounded-2xl border border-border/70 bg-background p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-foreground">
                      {template.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {template.institution || "Sem instituição"} ·{" "}
                      {template.category === "external" ? "Externo" : "Interno"}
                    </p>
                  </div>
                  {template.isDefault && (
                    <span className="rounded-full bg-amber-500/15 px-2 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-200">
                      Padrão
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {template.includeSiteBranding
                    ? "Logo do site: incluída"
                    : "Logo do site: não incluir"}
                </p>
                <p className="mt-1 break-all text-xs text-muted-foreground">
                  Arquivo protegido: {template.templateUrl || "não informado"}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
