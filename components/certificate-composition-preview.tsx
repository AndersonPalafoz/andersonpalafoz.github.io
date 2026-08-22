"use client";

import React, { type CSSProperties } from "react";
import {
  DEFAULT_FIELD_MAPPINGS,
  type CertificateComposition,
  type CertificateFieldKey,
  resolveCertificateText,
} from "@/lib/certificate-composition";
import { getCertificateVisualVariant } from "@/lib/certificate-visual-variants";

export type CertificatePreviewValues = Partial<Record<CertificateFieldKey, string>>;

type CertificateCompositionPreviewProps = {
  composition: CertificateComposition;
  values: CertificatePreviewValues;
  includeSiteBranding?: boolean;
  className?: string;
  interactive?: boolean;
};

const LABELS: Record<CertificateFieldKey, string> = {
  studentName: "Nome do aluno",
  courseTitle: "Curso / Componente",
  level: "Nível",
  issuedAt: "Data de emissão",
  certificateCode: "Código de verificação",
  workloadHours: "Carga horária",
  studentCpf: "CPF do aluno",
  period: "Período / Dias",
  coordinatorName: "Coordenador / Professor",
  institutionName: "Instituição parceira",
};

function fieldStyle(
  key: CertificateFieldKey,
  composition: CertificateComposition,
  variant: ReturnType<typeof getCertificateVisualVariant>
): CSSProperties {
  const mapping = composition.fieldMappings[key] || DEFAULT_FIELD_MAPPINGS[key]!;
  const align = mapping.align || "left";
  const isPrimary = key === "studentName" || key === "courseTitle";
  return {
    left: `${(mapping.x / composition.canvas.width) * 100}%`,
    top: `${((composition.canvas.height - mapping.y) / composition.canvas.height) * 100}%`,
    width: `${Math.min(94, ((mapping.maxWidth || 700) / composition.canvas.width) * 100)}%`,
    fontSize: `${Math.max(1.2, Math.min(16, ((mapping.size || 14) / composition.canvas.height) * 100))}cqh`,
    lineHeight: 1.12,
    color: mapping.color || (isPrimary ? variant.ink : variant.muted),
    fontWeight: mapping.weight === "bold" || isPrimary ? 800 : 500,
    letterSpacing: isPrimary ? "-0.02em" : undefined,
    textAlign: align,
    transform: align === "center" ? "translateX(-50%)" : align === "right" ? "translateX(-100%)" : undefined,
  };
}

function elementStyle(
  element: CertificateComposition["elements"][number],
  composition: CertificateComposition,
  variant: ReturnType<typeof getCertificateVisualVariant>
): CSSProperties {
  return {
    left: `${(element.x / composition.canvas.width) * 100}%`,
    top: `${((composition.canvas.height - element.y) / composition.canvas.height) * 100}%`,
    width: element.width ? `${(element.width / composition.canvas.width) * 100}%` : undefined,
    height: element.height ? `${(element.height / composition.canvas.height) * 100}%` : undefined,
    minWidth: element.type === "text" || element.type === "badge" ? `${Math.min(94, ((element.width || 240) / composition.canvas.width) * 100)}%` : undefined,
    opacity: element.opacity ?? 1,
    zIndex: element.zIndex || 0,
    color: element.color || variant.ink,
    fontSize: `${Math.max(1.2, Math.min(16, ((element.size || 14) / composition.canvas.height) * 100))}cqh`,
    lineHeight: 1.12,
    fontWeight: element.weight === "bold" || element.type === "badge" ? 800 : 500,
    textAlign: element.align || "left",
    transform: element.align === "center" ? "translate(-50%, -50%)" : element.align === "right" ? "translate(-100%, -50%)" : "translateY(-50%)",
  };
}

export function CertificateCompositionPreview({
  composition,
  values,
  includeSiteBranding = true,
  className,
  interactive = false,
}: CertificateCompositionPreviewProps) {
  const variant = getCertificateVisualVariant(composition.visualVariant);
  const fields = (Object.keys(DEFAULT_FIELD_MAPPINGS) as CertificateFieldKey[]).filter(
    key => Boolean(composition.fieldMappings[key])
  );
  const baseStyle: CSSProperties = {
    backgroundColor: variant.paper,
    borderColor: variant.accent,
    boxShadow: `0 16px 40px ${variant.accent}18`,
  };

  return (
    <div
      className={`relative isolate aspect-[842/595] w-full overflow-hidden rounded-2xl border-2 shadow-[0_20px_50px_rgba(15,23,42,0.14)] ring-1 ring-black/5 ${className || ""}`}
      style={{ ...baseStyle, containerType: "size" }}
      data-certificate-preview="shared"
      data-certificate-variant={variant.id}
      aria-label={`Pré-visualização compartilhada do certificado: ${variant.label}`}
    >
      <div
        className="pointer-events-none absolute inset-[2.5%] rounded-lg border"
        style={{ borderColor: variant.border, backgroundColor: variant.panel }}
      />

      {variant.motif === "double" && (
        <>
          <div className="pointer-events-none absolute inset-[4.3%] rounded-md border" style={{ borderColor: `${variant.accent}66` }} />
          <div className="pointer-events-none absolute left-0 top-0 h-full w-[1.2%]" style={{ backgroundColor: variant.accent }} />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-[1.2%]" style={{ backgroundColor: variant.accent }} />
        </>
      )}

      {variant.motif === "institutional" && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 h-full w-[2.3%]" style={{ backgroundColor: variant.accent }} />
          <div className="pointer-events-none absolute left-[5%] right-[5%] top-[7%] h-px" style={{ backgroundColor: variant.accent }} />
          <div className="pointer-events-none absolute bottom-[7%] left-[5%] right-[5%] h-px" style={{ backgroundColor: variant.border }} />
          <div className="pointer-events-none absolute right-[7%] top-[7%] flex h-[11%] w-[11%] items-center justify-center rounded-full border text-[7px] font-black uppercase tracking-[0.15em]" style={{ borderColor: variant.accent, color: variant.accent }}>IsF</div>
        </>
      )}

      {variant.motif === "editorial" && (
        <>
          <div className="pointer-events-none absolute left-0 right-0 top-0 h-[8%]" style={{ backgroundColor: variant.ink }} />
          <div className="pointer-events-none absolute left-[5%] top-[13%] h-[2px] w-[19%]" style={{ backgroundColor: variant.accent }} />
          <div className="pointer-events-none absolute bottom-[7%] left-[5%] h-[10%] w-[10%] border" style={{ borderColor: variant.accent }} />
          <div className="pointer-events-none absolute bottom-[7%] right-[5%] h-[10%] w-[10%] border" style={{ borderColor: variant.border }} />
        </>
      )}

      {variant.motif === "minimal" && (
        <>
          <div className="pointer-events-none absolute inset-[4%] rounded-md border" style={{ borderColor: variant.border }} />
          <div className="pointer-events-none absolute left-[5%] top-[8%] h-1 w-[18%] rounded-full" style={{ backgroundColor: variant.accent }} />
          <div className="pointer-events-none absolute right-[5%] top-[8%] h-1 w-[5%] rounded-full" style={{ backgroundColor: variant.accentSoft }} />
        </>
      )}

      {variant.motif === "laureate" && (
        <>
          <div className="pointer-events-none absolute inset-[4%] z-[1] rounded-lg border-2" style={{ borderColor: variant.border }} />
          <div className="pointer-events-none absolute left-[7%] top-[8%] z-[1] h-[5%] w-[5%] border-l-2 border-t-2" style={{ borderColor: variant.accent }} />
          <div className="pointer-events-none absolute right-[7%] top-[8%] z-[1] h-[5%] w-[5%] border-r-2 border-t-2" style={{ borderColor: variant.accent }} />
          <div className="pointer-events-none absolute bottom-[8%] left-[7%] z-[1] h-[5%] w-[5%] border-b-2 border-l-2" style={{ borderColor: variant.accent }} />
          <div className="pointer-events-none absolute bottom-[8%] right-[7%] z-[1] h-[5%] w-[5%] border-b-2 border-r-2" style={{ borderColor: variant.accent }} />
          <div className="pointer-events-none absolute left-1/2 top-[28%] z-[1] h-[10%] w-[7%] -translate-x-1/2 rounded-full border" style={{ borderColor: variant.accent, backgroundColor: variant.accentSoft }} />
        </>
      )}

      {variant.motif === "botanical" && (
        <>
          <div className="pointer-events-none absolute -left-[2%] top-[5%] z-[1] h-[35%] w-[18%] -rotate-12 rounded-[55%] border-2" style={{ borderColor: variant.accent, opacity: 0.45 }} />
          <div className="pointer-events-none absolute -right-[2%] bottom-[5%] z-[1] h-[35%] w-[18%] rotate-12 rounded-[55%] border-2" style={{ borderColor: variant.accent, opacity: 0.45 }} />
          <div className="pointer-events-none absolute left-[6%] top-[15%] z-[1] h-[12%] w-[8%] rotate-45 rounded-full" style={{ backgroundColor: variant.accentSoft, opacity: 0.9 }} />
          <div className="pointer-events-none absolute right-[6%] bottom-[15%] z-[1] h-[12%] w-[8%] -rotate-45 rounded-full" style={{ backgroundColor: variant.accentSoft, opacity: 0.9 }} />
        </>
      )}

      {variant.motif === "geometric" && (
        <>
          <div className="pointer-events-none absolute right-0 top-0 z-[1] h-[31%] w-[24%] [clip-path:polygon(100%_0,100%_100%,0_0)]" style={{ backgroundColor: variant.accentSoft, opacity: 0.9 }} />
          <div className="pointer-events-none absolute bottom-0 left-0 z-[1] h-[24%] w-[20%] [clip-path:polygon(0_100%,0_0,100%_100%)]" style={{ backgroundColor: variant.accent, opacity: 0.12 }} />
          <div className="pointer-events-none absolute right-[8%] top-[14%] z-[1] h-[7%] w-[7%] rotate-45 border-2" style={{ borderColor: variant.accent }} />
          <div className="pointer-events-none absolute bottom-[13%] left-[8%] z-[1] h-[5%] w-[13%] rounded-full" style={{ backgroundColor: variant.accent }} />
        </>
      )}

      {variant.motif === "midnight" && (
        <>
          <div className="pointer-events-none absolute inset-[4%] z-[1] rounded-xl border" style={{ borderColor: variant.border }} />
          <div className="pointer-events-none absolute left-0 right-0 top-0 z-[1] h-[7%]" style={{ backgroundColor: variant.accent, opacity: 0.16 }} />
          <div className="pointer-events-none absolute bottom-[9%] left-[8%] z-[1] h-px w-[28%]" style={{ backgroundColor: variant.accent }} />
          <div className="pointer-events-none absolute bottom-[9%] right-[8%] z-[1] h-px w-[12%]" style={{ backgroundColor: variant.accent }} />
          <div className="pointer-events-none absolute right-[8%] top-[13%] z-[1] h-[7%] w-[7%] rounded-full border" style={{ borderColor: variant.accent }} />
        </>
      )}

      <div
        className="pointer-events-none absolute bottom-[14%] left-[8%] right-[8%] top-[15%] z-[0] rounded-[1.25rem] border shadow-inner"
        style={{ borderColor: variant.border, backgroundColor: variant.panel, opacity: 0.58 }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-[8%] top-[15%] z-[1] h-[2px] w-[18%] rounded-full"
        style={{ backgroundColor: variant.accent }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[16.5%] z-[2] -translate-x-1/2 text-center text-[5px] font-black uppercase tracking-[0.24em]"
        style={{ color: variant.muted }}
      >
        Reconhecimento acadêmico
      </div>

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 select-none text-[7rem] font-black leading-none tracking-[-0.12em] opacity-[0.035] sm:text-[10rem]"
        style={{ color: variant.accent }}
        aria-hidden="true"
      >
        {variant.watermarkLabel}
      </div>

      <div className="pointer-events-none absolute left-[5%] top-[6%] z-[2] max-w-[60%] text-[6px] font-black uppercase tracking-[0.18em]" style={{ color: variant.accent }}>
        {variant.headerLabel}
      </div>
      <div className="pointer-events-none absolute right-[5%] top-[6%] z-[2] rounded-full px-2 py-1 text-[5px] font-black uppercase tracking-[0.14em]" style={{ backgroundColor: variant.accentSoft, color: variant.accentDark }}>
        {variant.shortLabel}
      </div>

      {fields.map(key => {
        const value = values[key] || `{{${key}}}`;
        return (
          <div
            key={key}
            className={`absolute z-[3] overflow-hidden whitespace-pre-wrap break-words ${interactive ? "cursor-move rounded-lg px-1.5 py-0.5 transition hover:bg-white/70 hover:shadow-sm" : ""}`}
            style={fieldStyle(key, composition, variant)}
            title={interactive ? `Arraste ${LABELS[key]} no editor visual` : LABELS[key]}
          >
            {value}
          </div>
        );
      })}

      {composition.elements.map(element => {
        if (element.visible === false || (!includeSiteBranding && element.isSiteBranding)) return null;
        const style = elementStyle(element, composition, variant);
        if (element.type === "image") {
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={element.id}
              src={element.content}
              alt="Elemento visual do certificado"
              className="absolute z-[5] object-contain"
              style={style}
            />
          );
        }
        if (element.type === "line") {
          return <div key={element.id} className="absolute z-[2] h-0.5 -translate-y-1/2 rounded-full" style={{ ...style, backgroundColor: element.color || variant.accent }} />;
        }
        return (
          <div key={element.id} className="absolute z-[4] overflow-hidden whitespace-pre-wrap break-words" style={style}>
            {resolveCertificateText(element.content, values)}
          </div>
        );
      })}

      <div className="pointer-events-none absolute bottom-[4%] left-[5%] right-[5%] z-[6] flex justify-between gap-3 border-t pt-1 text-[6px] font-semibold uppercase tracking-wider" style={{ borderColor: variant.border, color: variant.muted }}>
        <span>{variant.footerLabel}</span>
        <span>Prévia antes da emissão</span>
      </div>
    </div>
  );
}
