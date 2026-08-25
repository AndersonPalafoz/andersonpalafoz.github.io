"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CertificateStandardManager } from "@/components/certificate-standard-manager";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Code, FileText, Layers, Palette, Sliders, Sparkles, CheckCircle2, MousePointer2, WandSparkles } from "lucide-react";

function EditorLoading({ tone = "red" }: { tone?: "red" | "blue" | "purple" }) {
  const toneClasses = {
    red: "border-red-500/20 bg-red-500/5",
    blue: "border-blue-500/20 bg-blue-500/5",
    purple: "border-purple-500/20 bg-purple-500/5",
  }[tone];

  return (
    <div className={`flex min-h-[320px] items-center justify-center rounded-2xl border p-6 ${toneClasses}`}>
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5" aria-hidden="true">
          <WandSparkles className="animate-pulse text-red-600" size={20} />
        </div>
        <p className="text-sm font-black text-foreground">Preparando o editor visual</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Este módulo é carregado somente quando selecionado para preservar o desempenho do painel.
        </p>
      </div>
    </div>
  );
}

const CertificateFabricPrototype = dynamic(
  () => import("@/components/certificate-fabric-prototype").then(module => module.CertificateFabricPrototype),
  { ssr: false, loading: () => <EditorLoading tone="red" /> }
);

const CertificateKonvaPrototype = dynamic(
  () => import("@/components/certificate-konva-prototype").then(module => module.CertificateKonvaPrototype),
  { ssr: false, loading: () => <EditorLoading tone="blue" /> }
);

const CertificateGrapesPrototype = dynamic(
  () => import("@/components/certificate-grapes-prototype").then(module => module.CertificateGrapesPrototype),
  { ssr: false, loading: () => <EditorLoading tone="purple" /> }
);

const editorOptions = {
  standard: {
    label: "Gerador oficial",
    shortLabel: "Oficial",
    description: "Emissão conectada ao banco, assinatura, código de verificação e PDF.",
    badge: "Recomendado",
    icon: CheckCircle2,
    color: "emerald",
  },
  fabric: {
    label: "Fabric.js",
    shortLabel: "Fabric",
    description: "Edição livre com objetos, imagens e camadas posicionáveis.",
    badge: "Livre",
    icon: FileText,
    color: "red",
  },
  konva: {
    label: "Konva.js",
    shortLabel: "Konva",
    description: "Prancheta reativa para testar transformações e composição.",
    badge: "Reativo",
    icon: Layers,
    color: "blue",
  },
  grapes: {
    label: "GrapesJS / HTML",
    shortLabel: "GrapesJS",
    description: "Blocos estruturados para layouts tipográficos e CSS.",
    badge: "Estruturado",
    icon: Code,
    color: "purple",
  },
} as const;

type EditorTab = keyof typeof editorOptions;

type WorkflowStepProps = {
  number: string;
  title: string;
  description: string;
  active?: boolean;
};

function WorkflowStep({ number, title, description, active = false }: WorkflowStepProps) {
  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-3.5 transition sm:p-4 ${active ? "border-red-200 bg-red-50/80 shadow-sm dark:border-red-900/60 dark:bg-red-950/20" : "border-border/70 bg-background/70"}`}>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black ${active ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "bg-muted text-muted-foreground"}`}>
        {number}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-black text-foreground sm:text-sm">{title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function CertificateLaboratoryManager() {
  const [activeTab, setActiveTab] = useState<EditorTab>("standard");
  const activeEditor = editorOptions[activeTab];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-[2rem] border-border/70 bg-card shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <CardHeader className="border-b border-border/70 bg-[radial-gradient(circle_at_top_right,rgba(214,40,40,0.12),transparent_38%),linear-gradient(135deg,hsl(var(--muted)/0.72),hsl(var(--card))_55%)] px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-xl shadow-red-600/25">
                <Palette size={22} />
              </div>
              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-red-200/80 bg-red-50/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300">
                  <Sparkles size={13} /> Central de composição
                </div>
                <CardTitle className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xl font-black tracking-tight text-foreground sm:text-2xl">
                  Crie um certificado com intenção
                </CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                  Escolha o caminho mais adequado, ajuste a composição e confira a prévia antes de emitir. O gerador oficial é o único que grava o certificado no banco.
                </CardDescription>
              </div>
            </div>
            <div className="flex w-fit flex-wrap items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 size={15} /> Estado sincronizado
              <span className="hidden h-4 w-px bg-emerald-500/20 sm:block" />
              <span className="text-[10px] font-black uppercase tracking-[0.12em] opacity-80">Prévia → Ajustes → Emissão</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-4 py-5 sm:px-7 sm:py-7">
          <div className="grid gap-2 sm:grid-cols-3">
            <WorkflowStep number="01" title="Escolha uma abordagem" description="Comece pelo gerador oficial ou explore um editor." active={activeTab === "standard"} />
            <WorkflowStep number="02" title="Organize a composição" description="Use a prévia, os campos e as camadas como guia." active={activeTab !== "standard"} />
            <WorkflowStep number="03" title="Confira e emita" description="A emissão oficial usa a mesma composição revisada." />
          </div>

          <Tabs value={activeTab} onValueChange={value => setActiveTab(value as EditorTab)} className="space-y-5">
            <div className="rounded-2xl border border-border/70 bg-muted/35 p-2 shadow-inner">
              <TabsList className="grid h-auto grid-cols-2 gap-2 bg-transparent lg:grid-cols-4">
                {(Object.entries(editorOptions) as Array<[EditorTab, (typeof editorOptions)[EditorTab]]>).map(([key, option]) => {
                  const Icon = option.icon;
                  const isActive = activeTab === key;
                  const activeClasses = {
                    emerald: "data-[state=active]:border-emerald-500/40 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-600/20",
                    red: "data-[state=active]:border-red-500/40 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-red-600/20",
                    blue: "data-[state=active]:border-blue-500/40 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-600/20",
                    purple: "data-[state=active]:border-purple-500/40 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-600/20",
                  }[option.color];
                  const iconClasses = {
                    emerald: "text-emerald-600 dark:text-emerald-300",
                    red: "text-red-600 dark:text-red-300",
                    blue: "text-blue-600 dark:text-blue-300",
                    purple: "text-purple-600 dark:text-purple-300",
                  }[option.color];

                  return (
                    <TabsTrigger
                      key={key}
                      value={key}
                      className={`group min-h-[68px] min-w-0 justify-start gap-2.5 rounded-xl border border-transparent bg-card px-3 py-3 text-left transition-all hover:-translate-y-0.5 hover:bg-background sm:px-4 ${activeClasses}`}
                      aria-label={`Abrir ${option.label}`}
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/80 transition-colors group-data-[state=active]:bg-white/15 ${isActive ? "text-white" : iconClasses}`}>
                        <Icon size={17} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-black sm:text-sm">{option.shortLabel}</span>
                        <span className="mt-0.5 block truncate text-[10px] font-semibold opacity-70">{option.badge}</span>
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-gradient-to-r from-background to-muted/30 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"><Sliders size={15} /></div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-foreground">{activeEditor.label}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{activeEditor.description}</p>
                </div>
              </div>
              <span className="w-fit shrink-0 rounded-full border border-border/70 bg-card px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                {activeEditor.badge}
              </span>
            </div>

            <TabsContent value="standard" className="mt-0 space-y-4 focus-visible:outline-none">
              <div className="flex flex-col gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3.5 text-xs text-foreground sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-300" size={15} /><span><strong className="text-emerald-700 dark:text-emerald-300">Gerador oficial:</strong> fluxo completo de seleção, prévia, emissão e gestão dos certificados.</span></div>
                <span className="w-fit rounded-lg bg-emerald-500/10 px-2.5 py-1 font-bold text-emerald-700 dark:text-emerald-300">Pronto para emissão</span>
              </div>
              <CertificateStandardManager />
            </TabsContent>

            <TabsContent value="fabric" className="mt-0 space-y-4 focus-visible:outline-none">
              <div className="flex flex-col gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3.5 text-xs text-foreground sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex items-start gap-2"><MousePointer2 className="mt-0.5 shrink-0 text-red-600 dark:text-red-300" size={15} /><span><strong className="text-red-700 dark:text-red-300">Fabric.js:</strong> arraste elementos, organize camadas e experimente uma composição livre.</span></div>
                <span className="w-fit rounded-lg bg-red-500/10 px-2.5 py-1 font-bold text-red-700 dark:text-red-300">Canvas interativo</span>
              </div>
              <CertificateFabricPrototype />
            </TabsContent>

            <TabsContent value="konva" className="mt-0 space-y-4 focus-visible:outline-none">
              <div className="flex flex-col gap-3 rounded-2xl border border-blue-500/25 bg-blue-500/10 px-4 py-3.5 text-xs text-foreground sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex items-start gap-2"><Layers className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-300" size={15} /><span><strong className="text-blue-700 dark:text-blue-300">Konva.js:</strong> teste uma prancheta reativa com foco em transformação e precisão.</span></div>
                <span className="w-fit rounded-lg bg-blue-500/10 px-2.5 py-1 font-bold text-blue-700 dark:text-blue-300">Camadas reativas</span>
              </div>
              <CertificateKonvaPrototype />
            </TabsContent>

            <TabsContent value="grapes" className="mt-0 space-y-4 focus-visible:outline-none">
              <div className="flex flex-col gap-3 rounded-2xl border border-purple-500/25 bg-purple-500/10 px-4 py-3.5 text-xs text-foreground sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex items-start gap-2"><Code className="mt-0.5 shrink-0 text-purple-600 dark:text-purple-300" size={15} /><span><strong className="text-purple-700 dark:text-purple-300">GrapesJS / HTML:</strong> explore uma estrutura de blocos para tipografia, grids e CSS.</span></div>
                <span className="w-fit rounded-lg bg-purple-500/10 px-2.5 py-1 font-bold text-purple-700 dark:text-purple-300">Layout estruturado</span>
              </div>
              <CertificateGrapesPrototype />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
