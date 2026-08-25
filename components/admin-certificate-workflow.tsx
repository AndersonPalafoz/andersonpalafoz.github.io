"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileSignature,
  LayoutTemplate,
  ListChecks,
  Settings2,
  Sparkles,
} from "lucide-react";
import { CertificateLaboratoryManager } from "@/components/certificate-laboratory-manager";
import { CertificateTemplateManager } from "@/components/certificate-template-manager";
import { CertificateSignatureManager } from "@/components/certificate-signature-manager";
import { CertificateStandardManager } from "@/components/certificate-standard-manager";

type WorkflowStage = "issue" | "templates" | "signatures" | "laboratory";

const stages: Array<{ id: WorkflowStage; label: string; description: string; icon: typeof Sparkles }> = [
  { id: "issue", label: "Emitir certificados", description: "Dados, prévia e emissão oficial", icon: FileSignature },
  { id: "templates", label: "Gerenciar modelos", description: "Biblioteca e mapeamento de campos", icon: LayoutTemplate },
  { id: "signatures", label: "Revisar assinaturas", description: "Pendências e documentos finais", icon: ListChecks },
  { id: "laboratory", label: "Laboratório experimental", description: "Fabric, Konva e GrapesJS", icon: Sparkles },
];

export function AdminCertificateWorkflow() {
  const [stage, setStage] = useState<WorkflowStage>("issue");
  const activeIndex = stages.findIndex((item) => item.id === stage);

  return (
    <section className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Resumo operacional dos certificados">
        <div className="surface-card rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">Pendências</p>
          <p className="mt-2 text-2xl font-black text-foreground">Revisar</p>
          <p className="mt-1 text-xs text-muted-foreground">Documentos aguardando assinatura</p>
        </div>
        <div className="surface-card rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">Operação</p>
          <p className="mt-2 text-2xl font-black text-foreground">Oficial</p>
          <p className="mt-1 text-xs text-muted-foreground">Fluxo de emissão e prévia</p>
        </div>
        <div className="surface-card rounded-2xl border border-blue-200/70 bg-blue-50/60 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">Modelos</p>
          <p className="mt-2 text-2xl font-black text-foreground">DOCX</p>
          <p className="mt-1 text-xs text-muted-foreground">Campos parametrizados e versões</p>
        </div>
        <div className="surface-card rounded-2xl border border-violet-200/70 bg-violet-50/60 p-4 dark:border-violet-900/50 dark:bg-violet-950/20">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-700 dark:text-violet-300">Laboratório</p>
          <p className="mt-2 text-2xl font-black text-foreground">3 engines</p>
          <p className="mt-1 text-xs text-muted-foreground">Uso experimental, separado da emissão</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap" aria-label="Ações rápidas de certificados">
        <button type="button" onClick={() => setStage("issue")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 active:scale-[0.99]">
          Emitir certificado <ArrowRight size={16} />
        </button>
        <button type="button" onClick={() => setStage("signatures")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold text-foreground transition hover:bg-muted">
          Revisar pendências <ListChecks size={16} />
        </button>
        <button type="button" onClick={() => setStage("templates")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold text-foreground transition hover:bg-muted">
          Gerenciar modelos <Settings2 size={16} />
        </button>
        <Link href="/admin/certificados?export=report" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold text-foreground transition hover:bg-muted">
          Exportar relatório <ArrowRight size={16} />
        </Link>
      </div>

      <div className="surface-card rounded-3xl border border-border/70 p-3 shadow-sm sm:p-4">
        <div className="grid gap-2 md:grid-cols-4">
          {stages.map((item, index) => {
            const Icon = item.icon;
            const active = item.id === stage;
            const complete = index < activeIndex;
            return (
              <button key={item.id} type="button" onClick={() => setStage(item.id)} className={`flex min-h-16 items-center gap-3 rounded-2xl px-3 py-3 text-left transition active:scale-[0.99] ${active ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "bg-muted/55 text-foreground hover:bg-muted"}`} aria-current={active ? "step" : undefined}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? "bg-white/15" : "bg-background"}`}>{complete ? <CheckCircle2 size={18} /> : <Icon size={18} />}</span>
                <span className="min-w-0"><span className="block text-xs font-black">{index + 1}. {item.label}</span><span className={`mt-0.5 block truncate text-[10px] ${active ? "text-white/75" : "text-muted-foreground"}`}>{item.description}</span></span>
              </button>
            );
          })}
        </div>
      </div>

      {stage === "issue" && <CertificateStandardManager />}
      {stage === "templates" && <CertificateTemplateManager />}
      {stage === "signatures" && <CertificateSignatureManager />}
      {stage === "laboratory" && <CertificateLaboratoryManager />}
    </section>
  );
}
