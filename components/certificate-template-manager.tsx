"use client";

import { useEffect, useRef, useState } from "react";
import { FileUp, Loader2, ShieldCheck, UploadCloud } from "lucide-react";

type CertificateFieldKey =
  | "studentName"
  | "courseTitle"
  | "level"
  | "issuedAt"
  | "certificateCode"
  | "workloadHours"
  | "studentCpf"
  | "period"
  | "coordinatorName"
  | "institutionName";

type CertificateFieldMapping = {
  x: number;
  y: number;
  size?: number;
  maxWidth?: number;
};

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
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [category, setCategory] = useState<"internal" | "external">("internal");
  const [includeSiteBranding, setIncludeSiteBranding] = useState(true);
  const [previewName, setPreviewName] = useState("Estudante Exemplo da Silva");
  const [previewCourse, setPreviewCourse] = useState("English Mastery B2");
  const [previewCode, setPreviewCode] = useState("AP-2026-9876");
  const [previewDate, setPreviewDate] = useState(
    new Date().toLocaleDateString("pt-BR")
  );
  const [activePreset, setActivePreset] = useState<"default" | "profici" | "isf">("default");

  const [fieldMappings, setFieldMappings] = useState<
    Partial<Record<CertificateFieldKey, CertificateFieldMapping>>
  >({
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
  });
  const [fieldMappingsText, setFieldMappingsText] = useState(() =>
    JSON.stringify(
      {
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
      },
      null,
      2
    )
  );
  const draggingField = useRef<CertificateFieldKey | null>(null);

  const previewFields: Array<{
    key: CertificateFieldKey;
    label: string;
    value: string;
  }> = [
    { key: "studentName", label: "Nome do aluno", value: previewName },
    { key: "courseTitle", label: "Curso / Componente", value: previewCourse },
    { key: "level", label: "Nível", value: "Intermediário (B1)" },
    { key: "issuedAt", label: "Data de emissão", value: previewDate },
    { key: "certificateCode", label: "Código de verificação", value: previewCode },
    { key: "workloadHours", label: "Carga horária (CH)", value: "32 horas" },
    { key: "studentCpf", label: "CPF do aluno", value: "123.456.789-00" },
    { key: "period", label: "Período / Dias", value: "Julho a Agosto de 2026" },
    { key: "coordinatorName", label: "Coordenador / Professor", value: "Anderson Palafoz" },
    { key: "institutionName", label: "Instituição parceira", value: "UFBA / IsF" },
  ];

  function applyPreset(preset: "default" | "profici" | "isf") {
    setActivePreset(preset);
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
    setFieldMappings(next);
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
    const x = Math.max(12, Math.min(730, event.clientX - bounds.left));
    const y = Math.max(12, Math.min(470, event.clientY - bounds.top));
    setFieldMappings(current => ({
      ...current,
      [key]: {
        ...current[key],
        x: Math.round(x),
        // pdf-lib uses a bottom-left origin; convert from the visual top-left canvas.
        y: Math.round(500 - y),
      },
    }));
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

  function handleCategoryChange(value: "internal" | "external") {
    setCategory(value);
    // Internos começam com branding, mas externos não recebem uma regra forçada:
    // o administrador precisa confirmar a escolha no formulário e novamente na emissão.
    setIncludeSiteBranding(value === "internal");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("category", category);
    formData.set("includeSiteBranding", String(includeSiteBranding));
    formData.set("fieldMappings", JSON.stringify(fieldMappings));

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
                onChange={e => setPreviewName(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-red-600"
              />
            </label>
            <label className="block text-xs font-bold text-foreground">
              Curso de teste
              <input
                type="text"
                value={previewCourse}
                onChange={e => setPreviewCourse(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-red-600"
              />
            </label>
            <label className="block text-xs font-bold text-foreground">
              Código de autenticidade
              <input
                type="text"
                value={previewCode}
                onChange={e => setPreviewCode(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-red-600"
              />
            </label>
            <label className="block text-xs font-bold text-foreground">
              Data de emissão
              <input
                type="text"
                value={previewDate}
                onChange={e => setPreviewDate(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-red-600"
              />
            </label>
          </div>
          <div className="rounded-xl border border-dashed border-red-600/40 bg-background p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-red-600">
                  Editor visual do modelo & Presets Institucionais
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Escolha um preset oficial (Padrão, PROFICI ou IsF) ou arraste as variáveis livremente.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset("default")}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${activePreset === "default" ? "bg-red-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  Padrão
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("profici")}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${activePreset === "profici" ? "bg-red-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  Preset PROFICI
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("isf")}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${activePreset === "isf" ? "bg-red-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  Preset IsF
                </button>
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
              <div className="min-w-0 overflow-x-auto rounded-xl border border-border bg-slate-100 p-3 dark:bg-slate-900">
                <div
                  className="relative mx-auto h-[500px] w-[760px] overflow-hidden rounded-lg border-2 border-red-600/30 bg-background shadow-inner"
                  onDragOver={event => event.preventDefault()}
                  onDrop={handleFieldDrop}
                  aria-label="Canvas de posicionamento do certificado"
                >
                  {includeSiteBranding && (
                    <div className="absolute left-1/2 top-8 -translate-x-1/2 rounded-full bg-red-600 px-4 py-1 text-[10px] font-black text-white">
                      Anderson Palafoz — Plataforma Acadêmica
                    </div>
                  )}
                  <p className="absolute left-1/2 top-24 -translate-x-1/2 text-xs text-muted-foreground">
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
                          if (
                            ![
                              "ArrowUp",
                              "ArrowDown",
                              "ArrowLeft",
                              "ArrowRight",
                            ].includes(event.key)
                          )
                            return;
                          event.preventDefault();
                          setFieldMappings(current => {
                            const existing = current[field.key] ?? mapping;
                            return {
                              ...current,
                              [field.key]: {
                                ...existing,
                                x: Math.max(
                                  12,
                                  Math.min(
                                    730,
                                    existing.x +
                                      (event.key === "ArrowLeft"
                                        ? -step
                                        : event.key === "ArrowRight"
                                          ? step
                                          : 0)
                                  )
                                ),
                                y: Math.max(
                                  12,
                                  Math.min(
                                    488,
                                    existing.y +
                                      (event.key === "ArrowDown"
                                        ? -step
                                        : event.key === "ArrowUp"
                                          ? step
                                          : 0)
                                  )
                                ),
                              },
                            };
                          });
                        }}
                        className="absolute max-w-[240px] cursor-grab rounded-md border border-red-600/50 bg-red-50/90 px-2 py-1 text-left shadow-sm outline-none transition hover:z-10 hover:scale-[1.02] focus:z-10 focus:ring-2 focus:ring-red-600 active:cursor-grabbing dark:bg-red-950/70"
                        style={{ left: mapping.x, top }}
                        aria-label={`Variável ${field.label}. Posição X ${mapping.x}, Y ${mapping.y}. Arraste para reposicionar.`}
                        title="Arraste para reposicionar; use as setas para ajustes finos"
                      >
                        <span className="block font-mono text-[9px] font-black text-red-600">
                          {`{{${field.key}}}`}
                        </span>
                        <span className="block truncate text-xs font-bold text-foreground">
                          {field.value}
                        </span>
                      </div>
                    );
                  })}
                  <div className="absolute bottom-5 left-8 right-8 flex justify-between border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
                    <span>Arraste os campos para definir o posicionamento</span>
                    <span>PDF: origem inferior esquerda</span>
                  </div>
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
                onChange={() => setIncludeSiteBranding(true)}
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
                onChange={() => setIncludeSiteBranding(false)}
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
                if (
                  parsed &&
                  typeof parsed === "object" &&
                  !Array.isArray(parsed)
                ) {
                  setFieldMappings(parsed);
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
