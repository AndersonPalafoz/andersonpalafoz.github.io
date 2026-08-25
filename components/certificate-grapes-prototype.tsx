"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CERTIFICATE_PRESETS } from "@/lib/certificate-presets";
import { CERTIFICATE_ELEMENT_PRESETS, createCertificateElementPreset } from "@/lib/certificate-element-presets";
import { generateCertificatePdf } from "@/lib/certificate-pdf-generator";
import { Code, Download, RefreshCw } from "lucide-react";
import { useCertificateWorkspace } from "@/components/certificate-workspace-context";
import { CertificateCompositionPreview } from "@/components/certificate-composition-preview";

export function CertificateGrapesPrototype() {
  const {
    composition,
    sampleData,
    updateComposition,
    setSampleData,
    setSelectedTemplateId: setWorkspaceTemplate,
  } = useCertificateWorkspace();
  const [templateId, setTemplateId] = useState<string>("profici");
  const preset = CERTIFICATE_PRESETS[templateId] || CERTIFICATE_PRESETS.standard;

  const [studentName, setStudentName] = useState(sampleData.studentName);
  const [studentCpf, setStudentCpf] = useState(sampleData.studentCpf);
  const [courseTitle, setCourseTitle] = useState(sampleData.courseTitle);
  const [workload, setWorkload] = useState(sampleData.workloadHours);
  const [period, setPeriod] = useState(sampleData.period);
  const [customTitle, setCustomTitle] = useState(preset.title);
  const [customSigner, setCustomSigner] = useState(preset.signerName);
  const [customRole, setCustomRole] = useState(preset.signerRole);
  const [customDate, setCustomDate] = useState(preset.locationAndDate);
  const [logoUrl, setLogoUrl] = useState<string>(composition.elements.find(element => element.type === "image")?.content || "/logo-horizontal.png");
  const [logoWidth, setLogoWidth] = useState<number>(140);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setStudentName(sampleData.studentName);
    setStudentCpf(sampleData.studentCpf);
    setCourseTitle(sampleData.courseTitle);
    setWorkload(sampleData.workloadHours);
    setPeriod(sampleData.period);
  }, [sampleData]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      if (!url.startsWith("data:image/")) return;
      setLogoUrl(url);
      updateComposition(current => ({
        ...current,
        elements: [
          ...current.elements.filter(element => element.id !== "grapes-logo"),
          { id: "grapes-logo", type: "image", content: url, x: 70, y: 480, width: logoWidth, height: 64, zIndex: 20 },
        ],
      }));
      toast.success("Imagem sincronizada com a composição compartilhada.");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handlePresetChange = (v: string) => {
    setTemplateId(v);
    setWorkspaceTemplate(v);
    const p = CERTIFICATE_PRESETS[v];
    if (p) {
      setCustomTitle(p.title);
      setCustomSigner(p.signerName);
      setCustomRole(p.signerRole);
      setCustomDate(p.locationAndDate);
    }
  };

  const handleAddBlock = (presetId: string) => {
    const element = createCertificateElementPreset(presetId, composition.elements.length + 1);
    if (!element) return;
    updateComposition(current => ({ ...current, elements: [...current.elements, element] }));
    toast.success("Bloco HTML/CSS estruturado adicionado à composição.");
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
        templateName: `grapes-pro-${templateId}`,
        logoUrl,
        additionalElements: composition.elements.map(element => ({
          ...element,
          size: element.size || 12,
          color: element.color || "#24313a",
          src: element.type === "image" ? element.content : undefined,
        })),
      });
      toast.success("Certificado exportado via Grapes Engine!");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error(`Erro ao gerar PDF: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 shadow-md">
        <CardHeader className="bg-purple-50/50 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-purple-900 flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-600" />
                GrapesJS / HTML Engine — Blocos Avançados e Réplica DOCX
              </CardTitle>
              <CardDescription>
                Editor visual baseado em blocos com total liberdade de customização textual e institucional.
              </CardDescription>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-700">
              Grapes Pro Engine
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
                <Input value={studentName} onChange={(e) => { setStudentName(e.target.value); setSampleData({ studentName: e.target.value }); }} />
              </div>

              <div className="space-y-2">
                <Label>CPF do Aluno</Label>
                <Input value={studentCpf} onChange={(e) => { setStudentCpf(e.target.value); setSampleData({ studentCpf: e.target.value }); }} />
              </div>

              <div className="space-y-2">
                <Label>Curso / Componente</Label>
                <Input value={courseTitle} onChange={(e) => { setCourseTitle(e.target.value); setSampleData({ courseTitle: e.target.value }); }} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Carga Horária</Label>
                  <Input value={workload} onChange={(e) => { setWorkload(e.target.value); setSampleData({ workloadHours: e.target.value }); }} />
                </div>
                <div className="space-y-2">
                  <Label>Período</Label>
                  <Input value={period} onChange={(e) => { setPeriod(e.target.value); setSampleData({ period: e.target.value }); }} />
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

              <div className="space-y-2 rounded-xl border border-purple-200/70 bg-purple-50/50 p-3 dark:border-purple-900/50 dark:bg-purple-950/20">
                <Label className="text-xs font-black text-purple-900 dark:text-purple-100">Blocos HTML/CSS prontos</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CERTIFICATE_ELEMENT_PRESETS.slice(1).map(item => (
                    <Button key={item.id} type="button" variant="outline" size="sm" onClick={() => handleAddBlock(item.id)} className="h-8 justify-start truncate text-[10px]">{item.label}</Button>
                  ))}
                </div>
                <p className="text-[10px] leading-relaxed text-purple-800/70 dark:text-purple-200/70">Cada bloco usa variáveis como <code>{"{{certificateCode}}"}</code> e é reutilizado no PDF oficial.</p>
              </div>

              <div className="pt-4">
                <Button onClick={handleExportPDF} disabled={isExporting} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl">
                  {isExporting ? <RefreshCw className="animate-spin mr-2" size={16} /> : <Download className="mr-2" size={16} />}
                  Exportar PDF (Grapes Engine)
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2 bg-muted/20 p-4 rounded-2xl border flex flex-col justify-center items-center">
                    <CertificateCompositionPreview
                      composition={composition}
                      values={sampleData}
                      includeSiteBranding
                      interactive
                    />
              <p className="text-[11px] text-muted-foreground mt-3">Pré-visualização baseada em blocos HTML/CSS estruturados (Grapes Pro).</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
