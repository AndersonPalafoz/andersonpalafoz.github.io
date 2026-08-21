"use client";

import { useEffect, useState } from "react";
import { FileUp, Loader2, ShieldCheck, UploadCloud } from "lucide-react";

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

  async function loadTemplates() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/certificate-templates", {
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          payload.error || "Não foi possível carregar os modelos."
        );
      setTemplates(payload.templates || []);
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

    try {
      const response = await fetch("/api/admin/certificate-templates", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
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
          <div className="rounded-xl border border-dashed border-red-600/40 bg-background p-6 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-wider text-red-600">
              Pré-visualização do Modelo (Variáveis Ativas)
            </p>
            <div className="mt-4 space-y-3 rounded-lg bg-muted/30 p-5 text-center">
              {includeSiteBranding && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-0.5 text-[10px] font-bold text-white">
                  Anderson Palafoz — Plataforma Acadêmica
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Certificamos para os devidos fins que
              </p>
              <h4 className="text-xl font-black text-foreground">
                {previewName}
              </h4>
              <p className="text-xs text-muted-foreground">
                concluiu com êxito o programa acadêmico
              </p>
              <p className="text-sm font-bold text-foreground">
                {previewCourse}
              </p>
              <div className="flex items-center justify-between pt-3 text-[11px] text-muted-foreground border-t border-border/40">
                <span>Emitido em: {previewDate}</span>
                <span className="font-mono">Ref: {previewCode}</span>
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
            rows={4}
            placeholder={
              '{"studentName":{"x":120,"y":300,"fontSize":24},"courseTitle":{"x":120,"y":240}}'
            }
            className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-xs text-foreground outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
          />
          <p className="text-xs text-muted-foreground">
            O JSON será validado e armazenado para a etapa de preenchimento
            coordenado do template.
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
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhum modelo cadastrado.
          </p>
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
