"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CERTIFICATE_PRESETS } from "@/lib/certificate-presets";
import { generateCertificatePdf } from "@/lib/certificate-pdf-generator";
import { Download, Layers, RefreshCw } from "lucide-react";

export function CertificateKonvaPrototype() {
  const [templateId, setTemplateId] = useState<string>("isf");
  const preset = CERTIFICATE_PRESETS[templateId] || CERTIFICATE_PRESETS.standard;

  const [studentName, setStudentName] = useState("Adna Caroline Vale Oliveira");
  const [studentCpf, setStudentCpf] = useState("123.671.106-89");
  const [courseTitle, setCourseTitle] = useState("Alfabetização e Letramento Étnico-Racial em Inglês");
  const [workload, setWorkload] = useState("40 horas");
  const [period, setPeriod] = useState("02 de maio a 20 de junho de 2026");
  const [customTitle, setCustomTitle] = useState(preset.title);
  const [customSigner, setCustomSigner] = useState(preset.signerName);
  const [customRole, setCustomRole] = useState(preset.signerRole);
  const [customDate, setCustomDate] = useState(preset.locationAndDate);
  const [logoUrl, setLogoUrl] = useState<string>("/manus-storage/Horizontal-v1.png");
  const [logoWidth, setLogoWidth] = useState<number>(140);
  const [isExporting, setIsExporting] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
      toast.success("Logo carregada com sucesso!");
    }
  };

  const handlePresetChange = (v: string) => {
    setTemplateId(v);
    const p = CERTIFICATE_PRESETS[v];
    if (p) {
      setCustomTitle(p.title);
      setCustomSigner(p.signerName);
      setCustomRole(p.signerRole);
      setCustomDate(p.locationAndDate);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await generateCertificatePdf({
        title: customTitle,
        studentName,
        studentCpf,
        courseTitle,
        workload,
        period,
        dateStr: customDate,
        signerName: customSigner,
        signerRole: customRole,
        organization: preset.organization,
        templateName: `konva-pro-${templateId}`,
        logoUrl,
      });
      toast.success("Certificado exportado via Konva Engine!");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error(`Erro ao gerar PDF: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 shadow-md">
        <CardHeader className="bg-blue-50/50 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Konva.js Engine — Camadas Reativas e Réplica DOCX
              </CardTitle>
              <CardDescription>
                Gerenciador em camadas com personalização total de títulos, alunos, signatários e textos institucionais.
              </CardDescription>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-700">
              Konva Pro Engine
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4 lg:col-span-1 border-r pr-0 lg:pr-6 border-border">
              <div className="space-y-2">
                <Label>Preset Base (Réplica DOCX)</Label>
                <Select value={templateId} onValueChange={handlePresetChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CERTIFICATE_PRESETS).map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Título do Certificado</Label>
                <Input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Nome do Aluno</Label>
                <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>CPF do Aluno</Label>
                <Input value={studentCpf} onChange={(e) => setStudentCpf(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Curso / Componente</Label>
                <Input value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Carga Horária</Label>
                  <Input value={workload} onChange={(e) => setWorkload(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Período</Label>
                  <Input value={period} onChange={(e) => setPeriod(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Signatário Principal</Label>
                <Input value={customSigner} onChange={(e) => setCustomSigner(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Cargo / Instituição do Signatário</Label>
                <Input value={customRole} onChange={(e) => setCustomRole(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Local e Data</Label>
                <Input value={customDate} onChange={(e) => setCustomDate(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Logo / Imagem Institucional</Label>
                <Input type="file" accept="image/*" onChange={handleLogoUpload} />
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">Tamanho da Logo:</span>
                  <input type="range" min="80" max="220" value={logoWidth} onChange={(e) => setLogoWidth(Number(e.target.value))} className="w-full" />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleExportPDF} disabled={isExporting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl">
                  {isExporting ? <RefreshCw className="animate-spin mr-2" size={16} /> : <Download className="mr-2" size={16} />}
                  Exportar PDF (Konva Engine)
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2 bg-muted/20 p-4 rounded-2xl border flex flex-col justify-center items-center">
              <div className="w-full max-w-[620px] aspect-[1.414/1] bg-white rounded-xl shadow-md border border-blue-200 p-8 relative flex flex-col justify-between text-center">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-blue-700 tracking-wider text-xs uppercase">{preset.organization}</h4>
                  {logoUrl && (
                    <img src={logoUrl} alt="Logo" style={{ width: `${logoWidth}px` }} className="object-contain max-h-12" />
                  )}
                </div>
                <div className="space-y-4">
                  <h3 className="font-black text-xl text-foreground tracking-wide">{customTitle}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed px-6">
                    {preset.bodyTemplate(studentName, studentCpf, courseTitle, workload, period)}
                  </p>
                  <p className="text-xs font-semibold text-foreground">{customDate}</p>
                </div>
                <div className="border-t pt-2 w-72 mx-auto">
                  <p className="text-xs font-bold text-foreground">{customSigner}</p>
                  <p className="text-[10px] text-muted-foreground">{customRole}</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">Pré-visualização reativa em camadas baseada nos modelos DOCX (Konva Pro).</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
