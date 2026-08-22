"use client";

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CertificateStandardManager } from "@/components/certificate-standard-manager";
import { CertificateFabricPrototype } from "@/components/certificate-fabric-prototype";
import { CertificateKonvaPrototype } from "@/components/certificate-konva-prototype";
import { CertificateGrapesPrototype } from "@/components/certificate-grapes-prototype";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Sparkles, Sliders, Layers, Code, FileText } from "lucide-react";

export function CertificateLaboratoryManager() {
  const [activeTab, setActiveTab] = useState("standard");

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3 bg-muted/20">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Sliders className="text-red-600" size={18} />
            Laboratório e Emissão de Certificados (4 Possibilidades)
          </CardTitle>
          <CardDescription>
            A Abordagem 1 é o gerador oficial 100% funcional. As demais abordagens são protótipos avançados de editores visuais interativos.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-muted/50 p-1.5 rounded-2xl">
              <TabsTrigger value="standard" className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white flex items-center gap-2">
                <Sparkles size={15} /> 1. Gerador Oficial (100% Funcional)
              </TabsTrigger>
              <TabsTrigger value="fabric" className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white flex items-center gap-2">
                <FileText size={15} /> 2. Fabric.js (Canvas)
              </TabsTrigger>
              <TabsTrigger value="konva" className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white flex items-center gap-2">
                <Layers size={15} /> 3. Konva.js (React)
              </TabsTrigger>
              <TabsTrigger value="grapes" className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white flex items-center gap-2">
                <Code size={15} /> 4. GrapesJS / HTML
              </TabsTrigger>
            </TabsList>

            <TabsContent value="standard" className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-600/30 rounded-xl text-xs text-foreground flex items-center justify-between">
                <span>⭐ <strong>Referência Oficial:</strong> 100% funcional com emissão real, persistência em banco de dados e upload S3.</span>
                <span className="font-bold text-emerald-600">Recomendado para Produção</span>
              </div>
              <CertificateStandardManager />
            </TabsContent>

            <TabsContent value="fabric" className="space-y-4">
              <div className="p-3 bg-red-500/10 border border-red-600/30 rounded-xl text-xs text-foreground flex items-center justify-between">
                <span>💡 <strong>Protótipo Fabric.js:</strong> Editor orientado a objetos com prancheta interativa A4, grade magnética e serialización JSON.</span>
                <span className="font-bold text-red-600">Em Evolução</span>
              </div>
              <CertificateFabricPrototype />
            </TabsContent>

            <TabsContent value="konva" className="space-y-4">
              <div className="p-3 bg-blue-500/10 border border-blue-600/30 rounded-xl text-xs text-foreground flex items-center justify-between">
                <span>💡 <strong>Protótipo Konva.js:</strong> Prancheta declarativa baseada em React State e camadas otimizadas para interações touch/mouse.</span>
                <span className="font-bold text-blue-600">Reativo</span>
              </div>
              <CertificateKonvaPrototype />
            </TabsContent>

            <TabsContent value="grapes" className="space-y-4">
              <div className="p-3 bg-teal-500/10 border border-teal-600/30 rounded-xl text-xs text-foreground flex items-center justify-between">
                <span>💡 <strong>Protótipo GrapesJS / HTML:</strong> Templates estruturados em blocos HTML/CSS com tipografia avançada e grids flexíveis.</span>
                <span className="font-bold text-teal-600">Flexível</span>
              </div>
              <CertificateGrapesPrototype />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
