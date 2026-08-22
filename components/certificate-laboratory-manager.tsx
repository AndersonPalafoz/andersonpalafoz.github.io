"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CertificateStandardManager } from "@/components/certificate-standard-manager";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Code, FileText, Layers, Palette, Sliders, Sparkles, CheckCircle2 } from "lucide-react";

function EditorLoading({ tone = "red" }: { tone?: "red" | "blue" | "purple" }) {
  const toneClasses = {
    red: "border-red-500/20 bg-red-500/5",
    blue: "border-blue-500/20 bg-blue-500/5",
    purple: "border-purple-500/20 bg-purple-500/5",
  }[tone];

  return (
    <div className={`flex min-h-[320px] items-center justify-center rounded-2xl border p-6 ${toneClasses}`}>
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <div className="h-9 w-9 animate-pulse rounded-xl bg-muted" aria-hidden="true" />
        <p className="text-sm font-bold text-foreground">Carregando editor visual…</p>
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
    description: "Emissão conectada ao banco, assinatura, QR Code e PDF.",
    badge: "Produção",
    icon: CheckCircle2,
    color: "emerald",
  },
  fabric: {
    label: "Fabric.js",
    shortLabel: "Fabric",
    description: "Canvas de objetos para edição livre, imagens e camadas.",
    badge: "Interativo",
    icon: FileText,
    color: "red",
  },
  konva: {
    label: "Konva.js",
    shortLabel: "Konva",
    description: "Prancheta reativa com transformações e estado sincronizado.",
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

export function CertificateLaboratoryManager() {
  const [activeTab, setActiveTab] = useState<EditorTab>("standard");
  const activeEditor = editorOptions[activeTab];

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden rounded-[1.75rem] border-border/70 bg-card shadow-[0_14px_45px_rgba(15,23,42,0.06)]">
        <CardHeader className="border-b border-border/70 bg-gradient-to-br from-muted/60 via-card to-card px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/20">
                <Palette size={21} />
              </div>
              <div className="min-w-0">
                <CardTitle className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg font-black text-foreground sm:text-xl">
                  Laboratório de composição
                  <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-red-700 dark:text-red-300">
                    4 abordagens
                  </span>
                </CardTitle>
                <CardDescription className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Compare as ferramentas sobre a mesma composição compartilhada. Para emitir certificados, use o gerador oficial; os demais editores servem para criar e testar layouts.
                </CardDescription>
              </div>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <Sparkles size={14} /> Estado sincronizado
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 px-4 py-4 sm:px-7 sm:py-6">
          <Tabs value={activeTab} onValueChange={value => setActiveTab(value as EditorTab)} className="space-y-5">
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-2">
              <TabsList className="grid h-auto grid-cols-2 gap-2 bg-transparent lg:grid-cols-4">
                {(Object.entries(editorOptions) as Array<[EditorTab, (typeof editorOptions)[EditorTab]]>).map(([key, option]) => {
                  const Icon = option.icon;
                  const isActive = activeTab === key;
                  const activeClasses = {
                    emerald: "data-[state=active]:border-emerald-500/40 data-[state=active]:bg-emerald-600 data-[state=active]:text-white",
                    red: "data-[state=active]:border-red-500/40 data-[state=active]:bg-red-600 data-[state=active]:text-white",
                    blue: "data-[state=active]:border-blue-500/40 data-[state=active]:bg-blue-600 data-[state=active]:text-white",
                    purple: "data-[state=active]:border-purple-500/40 data-[state=active]:bg-purple-600 data-[state=active]:text-white",
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
                      className={`min-w-0 justify-start gap-2 rounded-xl border border-transparent bg-card px-3 py-3 text-left transition-colors hover:bg-background sm:px-4 ${activeClasses}`}
                      aria-label={`Abrir ${option.label}`}
                    >
                      <Icon size={17} className={`shrink-0 ${isActive ? "text-white" : iconClasses}`} />
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-black sm:text-sm">{option.shortLabel}</span>
                        <span className="mt-0.5 block truncate text-[10px] font-semibold opacity-70">{option.badge}</span>
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-muted p-2 text-muted-foreground"><Sliders size={15} /></div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-foreground">{activeEditor.label}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{activeEditor.description}</p>
                </div>
              </div>
              <span className="w-fit shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                {activeEditor.badge}
              </span>
            </div>

            <TabsContent value="standard" className="mt-0 space-y-4 focus-visible:outline-none">
              <div className="flex flex-col gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-xs text-foreground sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <span><strong className="text-emerald-700 dark:text-emerald-300">Gerador oficial:</strong> fluxo completo de seleção, prévia, emissão e gestão dos certificados.</span>
                <span className="w-fit rounded-lg bg-emerald-500/15 px-2.5 py-1 font-bold text-emerald-700 dark:text-emerald-300">Pronto para emissão</span>
              </div>
              <CertificateStandardManager />
            </TabsContent>

            <TabsContent value="fabric" className="mt-0 space-y-4 focus-visible:outline-none">
              <div className="flex flex-col gap-2 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-foreground sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <span><strong className="text-red-700 dark:text-red-300">Fabric.js:</strong> canvas orientado a objetos para manipulação visual de elementos.</span>
                <span className="w-fit rounded-lg bg-red-500/15 px-2.5 py-1 font-bold text-red-700 dark:text-red-300">Canvas interativo</span>
              </div>
              <CertificateFabricPrototype />
            </TabsContent>

            <TabsContent value="konva" className="mt-0 space-y-4 focus-visible:outline-none">
              <div className="flex flex-col gap-2 rounded-2xl border border-blue-500/25 bg-blue-500/10 px-4 py-3 text-xs text-foreground sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <span><strong className="text-blue-700 dark:text-blue-300">Konva.js:</strong> prancheta reativa baseada no estado compartilhado da aplicação.</span>
                <span className="w-fit rounded-lg bg-blue-500/15 px-2.5 py-1 font-bold text-blue-700 dark:text-blue-300">Camadas reativas</span>
              </div>
              <CertificateKonvaPrototype />
            </TabsContent>

            <TabsContent value="grapes" className="mt-0 space-y-4 focus-visible:outline-none">
              <div className="flex flex-col gap-2 rounded-2xl border border-purple-500/25 bg-purple-500/10 px-4 py-3 text-xs text-foreground sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <span><strong className="text-purple-700 dark:text-purple-300">GrapesJS / HTML:</strong> blocos estruturados para tipografia, grids e CSS.</span>
                <span className="w-fit rounded-lg bg-purple-500/15 px-2.5 py-1 font-bold text-purple-700 dark:text-purple-300">Layout estruturado</span>
              </div>
              <CertificateGrapesPrototype />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
