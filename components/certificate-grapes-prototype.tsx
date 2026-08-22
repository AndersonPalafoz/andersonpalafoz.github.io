"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CERTIFICATE_PRESETS } from "@/lib/certificate-presets";
import { Code, Download, RefreshCw } from "lucide-react";
import { jsPDF } from "jspdf";

export function CertificateGrapesPrototype() {
  const [templateId, setTemplateId] = useState<string>("profici");
  const preset = CERTIFICATE_PRESETS[templateId] || CERTIFICATE_PRESETS.standard;

  const [studentName, setStudentName] = useState("Maria José Ferreira Lopes");
  const [studentCpf, setStudentCpf] = useState("065.192.044-20");
  const [courseTitle, setCourseTitle] = useState("Curso de Inglês para Fins de Internacionalização");
  const [workload, setWorkload] = useState("16 horas");
  const [period, setPeriod] = useState("14 de julho a 14 de agosto de 2026");
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
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      doc.setLineWidth(3);
      doc.setStrokeColor(147, 51, 234);
      doc.rect(30, 30, pageWidth - 60, pageHeight - 60);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59);
      doc.text(customTitle, pageWidth / 2, 90, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      doc.setTextColor(60, 60, 60);

      const bodyText = preset.bodyTemplate(studentName, studentCpf, courseTitle, workload, period);
      const splitText = doc.splitTextToSize(bodyText, pageWidth - 140);
      doc.text(splitText, 70, 160, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(customDate, pageWidth / 2, 320, { align: "center" });

      doc.setLineWidth(1);
      doc.setStrokeColor(150, 150, 150);
      doc.line(pageWidth / 2 - 160, 420, pageWidth / 2 + 160, 420);

      doc.text(customSigner, pageWidth / 2, 440, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(customRole, pageWidth / 2, 458, { align: "center" });

      doc.save(`certificado-grapes-pro-${templateId}-${studentName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
      toast.success("Certificado exportado via Grapes Engine!");
    } catch (err) {
      toast.error("Erro ao gerar PDF.");
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
                <Button onClick={handleExportPDF} disabled={isExporting} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl">
                  {isExporting ? <RefreshCw className="animate-spin mr-2" size={16} /> : <Download className="mr-2" size={16} />}
                  Exportar PDF (Grapes Engine)
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2 bg-muted/20 p-4 rounded-2xl border flex flex-col justify-center items-center">
              <div className="w-full max-w-[620px] aspect-[1.414/1] bg-white rounded-xl shadow-md border border-purple-200 p-8 relative flex flex-col justify-between text-center">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-purple-700 tracking-wider text-xs uppercase">{preset.organization}</h4>
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
              <p className="text-[11px] text-muted-foreground mt-3">Pré-visualização baseada em blocos HTML/CSS estruturados (Grapes Pro).</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
