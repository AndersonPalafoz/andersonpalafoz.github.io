"use client";

import React, { type CSSProperties } from "react";
import {
  DEFAULT_FIELD_MAPPINGS,
  type CertificateComposition,
  type CertificateFieldKey,
  resolveCertificateText,
} from "@/lib/certificate-composition";

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

function fieldStyle(key: CertificateFieldKey, composition: CertificateComposition): CSSProperties {
  const mapping = composition.fieldMappings[key] || DEFAULT_FIELD_MAPPINGS[key]!;
  const align = mapping.align || "left";
  return {
    left: `${(mapping.x / composition.canvas.width) * 100}%`,
    top: `${((composition.canvas.height - mapping.y) / composition.canvas.height) * 100}%`,
    maxWidth: `${Math.min(94, ((mapping.maxWidth || 700) / composition.canvas.width) * 100)}%`,
    fontSize: `${Math.max(7, Math.min(34, (mapping.size || 14) * 0.9))}px`,
    color: mapping.color || "#24313a",
    fontWeight: mapping.weight === "bold" ? 800 : 500,
    textAlign: align,
    transform: align === "center" ? "translateX(-50%)" : align === "right" ? "translateX(-100%)" : undefined,
  };
}

function elementStyle(element: CertificateComposition["elements"][number]): CSSProperties {
  return {
    left: `${(element.x / 842) * 100}%`,
    top: `${((595 - element.y) / 595) * 100}%`,
    width: element.width ? `${(element.width / 842) * 100}%` : undefined,
    height: element.height ? `${(element.height / 595) * 100}%` : undefined,
    opacity: element.opacity ?? 1,
    zIndex: element.zIndex || 0,
    color: element.color || "#24313a",
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
  const fields = (Object.keys(DEFAULT_FIELD_MAPPINGS) as CertificateFieldKey[]).filter(
    key => Boolean(composition.fieldMappings[key])
  );

  return (
    <div
      className={`relative aspect-[842/595] w-full overflow-hidden rounded-xl border-2 border-red-600/30 bg-white shadow-inner ${className || ""}`}
      data-certificate-preview="shared"
      aria-label="Pré-visualização compartilhada do certificado"
    >
      <div className="absolute inset-[2.5%] rounded-lg border border-slate-200 bg-[linear-gradient(135deg,#ffffff,#f8fafc)]" />
      {fields.map(key => {
        const value = values[key] || `{{${key}}}`;
        return (
          <div
            key={key}
            className={`absolute z-[1] whitespace-pre-wrap break-words leading-tight ${interactive ? "cursor-move" : ""}`}
            style={fieldStyle(key, composition)}
            title={interactive ? `Arraste ${LABELS[key]} no editor visual` : LABELS[key]}
          >
            {value}
          </div>
        );
      })}
      {composition.elements.map(element => {
        if (element.visible === false || (!includeSiteBranding && element.isSiteBranding)) return null;
        const style = elementStyle(element);
        if (element.type === "image") {
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={element.id}
              src={element.content}
              alt="Elemento visual do certificado"
              className="absolute object-contain"
              style={style}
            />
          );
        }
        if (element.type === "line") {
          return <div key={element.id} className="absolute h-0.5 -translate-y-1/2 rounded-full" style={{ ...style, backgroundColor: element.color || "#dc2626" }} />;
        }
        return (
          <div key={element.id} className="absolute whitespace-pre-wrap break-words leading-tight" style={style}>
            {resolveCertificateText(element.content, values)}
          </div>
        );
      })}
      <div className="absolute bottom-[4%] left-[5%] right-[5%] flex justify-between border-t border-slate-200 pt-1 text-[6px] font-semibold uppercase tracking-wider text-slate-400">
        <span>Composição compartilhada</span>
        <span>Prévia antes da emissão</span>
      </div>
    </div>
  );
}
