"use client";

import { useState } from "react";
import { CheckCircle2, FileSignature, LayoutTemplate, Sparkles } from "lucide-react";
import { CertificateLaboratoryManager } from "@/components/certificate-laboratory-manager";
import { CertificateTemplateManager } from "@/components/certificate-template-manager";
import { CertificateSignatureManager } from "@/components/certificate-signature-manager";

type WorkflowStage = "laboratory" | "templates" | "signatures";

const stages: Array<{ id: WorkflowStage; label: string; description: string; icon: typeof Sparkles }> = [
  { id: "laboratory", label: "Emitir e testar", description: "Gerador oficial e engines", icon: Sparkles },
  { id: "templates", label: "Modelos e composição", description: "Biblioteca e ajustes visuais", icon: LayoutTemplate },
  { id: "signatures", label: "Assinaturas", description: "Envio e revisão final", icon: FileSignature },
];

export function AdminCertificateWorkflow() {
  const [stage, setStage] = useState<WorkflowStage>("laboratory");
  const activeIndex = stages.findIndex(item => item.id === stage);

  return (
    <section className="space-y-5">
      <div className="surface-card rounded-3xl border border-border/70 p-3 shadow-sm sm:p-4">
        <div className="grid gap-2 md:grid-cols-3">
          {stages.map((item, index) => {
            const Icon = item.icon;
            const active = item.id === stage;
            const complete = index < activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setStage(item.id)}
                className={`flex min-h-16 items-center gap-3 rounded-2xl px-3 py-3 text-left transition active:scale-[0.99] ${active ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "bg-muted/55 text-foreground hover:bg-muted"}`}
                aria-current={active ? "step" : undefined}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? "bg-white/15" : "bg-background"}`}>{complete ? <CheckCircle2 size={18} /> : <Icon size={18} />}</span>
                <span className="min-w-0"><span className="block text-xs font-black">{index + 1}. {item.label}</span><span className={`mt-0.5 block truncate text-[10px] ${active ? "text-white/75" : "text-muted-foreground"}`}>{item.description}</span></span>
              </button>
            );
          })}
        </div>
      </div>

      {stage === "laboratory" && <CertificateLaboratoryManager />}
      {stage === "templates" && <CertificateTemplateManager />}
      {stage === "signatures" && <CertificateSignatureManager />}
    </section>
  );
}
