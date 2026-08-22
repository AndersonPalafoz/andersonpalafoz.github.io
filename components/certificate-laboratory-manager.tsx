"use client";

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CertificateFabricPrototype } from "@/components/certificate-fabric-prototype";
import { CertificateKonvaPrototype } from "@/components/certificate-konva-prototype";
import { CertificateGrapesPrototype } from "@/components/certificate-grapes-prototype";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Sparkles, Sliders, Layers, Code, FileText } from "lucide-react";

export function CertificateLaboratoryManager() {
  const [activeTab, setActiveTab] = useState("fabric");

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3 bg-muted/20">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Sliders className="text-red-600" size={18} />
            Escolha a Tecnologia de Editor para Teste
          </CardTitle>
          <CardDescription>
            Alternar entre as 4 possibilidades permite avaliar diretamente a usabilidade, o comportamento da prancheta e a exportação em PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-muted/50 p-1.5 rounded-2xl">
              <TabsTrigger value="fabric" className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white flex items-center gap-2">
                <FileText size={15} /> 1. Fabric.js (Canvas)
              </TabsTrigger>
              <TabsTrigger value="konva" className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white flex items-center gap-2">
                <Layers size={15} /> 2. Konva.js (React)
              </TabsTrigger>
              <TabsTrigger value="grapes" className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white flex items-center gap-2">
                <Code size={15} /> 3. GrapesJS / HTML
              </TabsTrigger>
              <TabsTrigger value="standard" className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white flex items-center gap-2">
                <Sparkles size={15} /> 4. Gerador Padrão
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fabric" className="space-y-4">
              <div className="p-3 bg-red-500/10 border border-red-600/30 rounded-xl text-xs text-foreground flex items-center justify-between">
                <span>💡 <strong>Abordagem 1 (Fabric.js):</strong> Editor orientado a objetos com prancheta interativa A4, grade magnética e serialização JSON.</span>
                <span className="font-bold text-red-600">Recomendado</span>
              </div>
              <CertificateFabricPrototype />
            </TabsContent>

            <TabsContent value="konva" className="space-y-4">
              <div className="p-3 bg-blue-500/10 border border-blue-600/30 rounded-xl text-xs text-foreground flex items-center justify-between">
                <span>💡 <strong>Abordagem 2 (Konva.js):</strong> Prancheta declarativa baseada em React State e camadas otimizadas para interações touch/mouse.</span>
                <span className="font-bold text-blue-600">Reativo</span>
              </div>
              <CertificateKonvaPrototype />
            </TabsContent>

            <TabsContent value="grapes" className="space-y-4">
              <div className="p-3 bg-teal-500/10 border border-teal-600/30 rounded-xl text-xs text-foreground flex items-center justify-between">
                <span>💡 <strong>Abordagem 3 (GrapesJS / HTML):</strong> Templates estruturados em blocos HTML/CSS com tipografia avançada e grids flexíveis.</span>
                <span className="font-bold text-teal-600">Flexível</span>
              </div>
              <CertificateGrapesPrototype />
            </TabsContent>

            <TabsContent value="standard" className="space-y-4">
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="text-red-600" size={18} /> 4. Gerador Oficial Padrão (Plataforma)
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  O gerador oficial nativo da plataforma utiliza templates parametrizados em pdf-lib com suporte a modelos institucionais (IsF, PROFICI, SIMAL), QR Code de verificação, QR link para o LinkedIn, controle de marca e exportação em lote (ZIP e PDF consolidado).
                </p>
                <div className="p-3 bg-muted/30 rounded-lg text-xs font-mono text-muted-foreground">
                  Status: Ativo e integrado ao fluxo de emissão em /admin/certificados.
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
