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
    maxWidth: `${Math.min(94, ((mapping.maxWidth || 700) / composition.canvas.width) * 100)}%`,
    fontSize: `${Math.max(7, Math.min(34, (mapping.size || 14) * 0.9))}px`,
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
    opacity: element.opacity ?? 1,
    zIndex: element.zIndex || 0,
    color: element.color || variant.ink,
    fontSize: `${Math.max(7, Math.min(34, (element.size || 14) * 0.9))}px`,
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
      className={`relative aspect-[842/595] w-full overflow-hidden rounded-xl border-2 shadow-inner ${className || ""}`}
      style={baseStyle}
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
            className={`absolute z-[3] whitespace-pre-wrap break-words leading-tight ${interactive ? "cursor-move" : ""}`}
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
          <div key={element.id} className="absolute z-[4] whitespace-pre-wrap break-words leading-tight" style={style}>
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
