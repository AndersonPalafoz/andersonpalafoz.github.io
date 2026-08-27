"use client";

import { CheckCircle2, Download, FilePlus2, ShieldCheck } from "lucide-react";
import {
  CERTIFICATE_FLOW,
  type CertificateFlowRole,
  type CertificateFlowStep,
  getCertificateFlowCopy,
} from "@/lib/certificate-flow";

type CertificateFlowStepsProps = {
  role: CertificateFlowRole;
  activeStep?: CertificateFlowStep;
  compact?: boolean;
};

const STEP_ICONS = {
  create: FilePlus2,
  validate: ShieldCheck,
  download: Download,
};

export function CertificateFlowSteps({
  role,
  activeStep = "create",
  compact = false,
}: CertificateFlowStepsProps) {
  const activeIndex = CERTIFICATE_FLOW.findIndex(step => step.id === activeStep);

  return (
    <section className={`rounded-2xl border border-border/70 bg-background/75 ${compact ? "p-3" : "p-4"}`} aria-label="Etapas do certificado">
      {!compact && <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{getCertificateFlowCopy(role)}</p>}
      <ol className="grid grid-cols-3 gap-2">
        {CERTIFICATE_FLOW.map((step, index) => {
          const Icon = STEP_ICONS[step.id];
          const complete = index < activeIndex;
          const active = index === activeIndex;
          return (
            <li key={step.id} className={`min-w-0 rounded-xl px-2 py-2.5 ${active ? "bg-red-600 text-white shadow-sm shadow-red-600/20" : complete ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200" : "bg-muted/60 text-muted-foreground"}`}>
              <span className="flex items-center gap-1.5">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${active ? "bg-white/15" : "bg-background/80"}`}>
                  {complete ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                </span>
                <strong className="truncate text-[11px] font-black">{index + 1}. {step.title}</strong>
              </span>
              {!compact && <span className={`mt-1 block truncate text-[10px] ${active ? "text-white/75" : "opacity-80"}`}>{step.description}</span>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
