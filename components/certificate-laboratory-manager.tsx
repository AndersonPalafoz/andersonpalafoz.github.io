"use client";

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CertificateStandardManager } from "@/components/certificate-standard-manager";
import { CertificateFabricPrototype } from "@/components/certificate-fabric-prototype";
import { CertificateKonvaPrototype } from "@/components/certificate-konva-prototype";
import { CertificateGrapesPrototype } from "@/components/certificate-grapes-prototype";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Sparkles, Sliders, Layers, Code, FileText, CheckCircle2 } from "lucide-react";

export function CertificateLaboratoryManager() {
  const [activeTab, setActiveTab] = useState("standard");

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-md rounded-3xl overflow-hidden">
        <CardHeader className="pb-4 bg-muted/30 border-b border-border">
          <CardTitle className="text-xl font-black flex items-center gap-2.5 text-foreground">
            <Sliders className="text-red-600" size={22} />
            Laboratório Comparativo de Certificados (4 Modelos por Cor)
          </CardTitle>
          <CardDescription className="text-sm">
            Cada arquitetura possui identidade visual e gama de cores exclusivas para facilitar a identificação e os testes práticos na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-muted/60 p-2 rounded-2xl h-auto">
              <TabsTrigger
                value="standard"
                className="rounded-xl font-bold text-xs sm:text-sm py-3 px-4 flex items-center gap-2.5 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md border border-emerald-600/20 bg-card text-emerald-700 dark:text-emerald-300"
              >
                <CheckCircle2 size={16} className="text-emerald-600 data-[state=active]:text-white shrink-0" />
                <div className="text-left">
                  <div className="font-black">1. Gerador Oficial</div>
                  <div className="text-[10px] opacity-80 uppercase tracking-wider">Esmeralda (100% Funcional)</div>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="fabric"
                className="rounded-xl font-bold text-xs sm:text-sm py-3 px-4 flex items-center gap-2.5 transition-all data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md border border-red-600/20 bg-card text-red-700 dark:text-red-300"
              >
                <FileText size={16} className="text-red-600 data-[state=active]:text-white shrink-0" />
                <div className="text-left">
                  <div className="font-black">2. Fabric.js</div>
                  <div className="text-[10px] opacity-80 uppercase tracking-wider">Vermelho (Canvas Objeto)</div>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="konva"
                className="rounded-xl font-bold text-xs sm:text-sm py-3 px-4 flex items-center gap-2.5 transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md border border-blue-600/20 bg-card text-blue-700 dark:text-blue-300"
              >
                <Layers size={16} className="text-blue-600 data-[state=active]:text-white shrink-0" />
                <div className="text-left">
                  <div className="font-black">3. Konva.js</div>
                  <div className="text-[10px] opacity-80 uppercase tracking-wider">Azul (Camadas Reativas)</div>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="grapes"
                className="rounded-xl font-bold text-xs sm:text-sm py-3 px-4 flex items-center gap-2.5 transition-all data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md border border-purple-600/20 bg-card text-purple-700 dark:text-purple-300"
              >
                <Code size={16} className="text-purple-600 data-[state=active]:text-white shrink-0" />
                <div className="text-left">
                  <div className="font-black">4. GrapesJS / HTML</div>
                  <div className="text-[10px] opacity-80 uppercase tracking-wider">Roxo (Blocos CSS)</div>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="standard" className="space-y-4">
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-600/30 rounded-2xl text-xs text-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>⭐ <strong>Modelo Esmeralda (Gerador Oficial):</strong> Totalmente conectado ao banco de dados, S3, QR Code e fluxo de emissão.</span>
                <span className="font-bold text-emerald-600 bg-emerald-500/20 px-2.5 py-1 rounded-lg">Pronto para Produção</span>
              </div>
              <CertificateStandardManager />
            </TabsContent>

            <TabsContent value="fabric" className="space-y-4">
              <div className="p-3.5 bg-red-500/10 border border-red-600/30 rounded-2xl text-xs text-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>🔴 <strong>Modelo Vermelho (Fabric.js):</strong> Prancheta A4 orientada a objetos para testes de manipulação livre e serialização JSON.</span>
                <span className="font-bold text-red-600 bg-red-500/20 px-2.5 py-1 rounded-lg">Canvas Interativo</span>
              </div>
              <CertificateFabricPrototype />
            </TabsContent>

            <TabsContent value="konva" className="space-y-4">
              <div className="p-3.5 bg-blue-500/10 border border-blue-600/30 rounded-2xl text-xs text-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>🔵 <strong>Modelo Azul (Konva.js):</strong> Prancheta reativa baseada em React State com suporte a arrastar e soltar em camadas.</span>
                <span className="font-bold text-blue-600 bg-blue-500/20 px-2.5 py-1 rounded-lg">React State</span>
              </div>
              <CertificateKonvaPrototype />
            </TabsContent>

            <TabsContent value="grapes" className="space-y-4">
              <div className="p-3.5 bg-purple-500/10 border border-purple-600/30 rounded-2xl text-xs text-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>🟣 <strong>Modelo Roxo (GrapesJS / HTML):</strong> Editor de blocos HTML/CSS estruturados para layouts tipográficos avançados.</span>
                <span className="font-bold text-purple-600 bg-purple-500/20 px-2.5 py-1 rounded-lg">Componentes CSS</span>
              </div>
              <CertificateGrapesPrototype />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
