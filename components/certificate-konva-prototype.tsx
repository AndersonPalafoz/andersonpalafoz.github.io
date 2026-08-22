"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Layers, Download, RefreshCw } from "lucide-react";
import { CERTIFICATE_PRESETS } from "@/lib/certificate-presets";
import { jsPDF } from "jspdf";

export function CertificateKonvaPrototype() {
  const [templateId, setTemplateId] = useState<string>("isf");
  const [studentName, setStudentName] = useState("Maria José Ferreira Lopes");
  const [studentCpf, setStudentCpf] = useState("065.192.044-20");
  const [courseTitle, setCourseTitle] = useState("Estratégias de Leitura de Textos em Língua Inglesa – Nível de Proficiência A2");
  const [workload, setWorkload] = useState("32 horas");
  const [period, setPeriod] = useState("02 de maio a 20 de junho de 2026");
  const [isExporting, setIsExporting] = useState(false);

  const preset = CERTIFICATE_PRESETS[templateId] || CERTIFICATE_PRESETS.standard;

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      doc.setLineWidth(3);
      doc.setStrokeColor(15, 118, 110);
      doc.rect(30, 30, pageWidth - 60, pageHeight - 60);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(30, 41, 59);
      doc.text(preset.defaultTitle, pageWidth / 2, 100, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      doc.setTextColor(60, 60, 60);

      const description = preset.descriptionTemplate(studentName, studentCpf, courseTitle, workload, period);
      const splitText = doc.splitTextToSize(description, pageWidth - 140);
      doc.text(splitText, 70, 180, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Salvador, 22 de agosto de 2026.", pageWidth / 2, 340, { align: "center" });

      doc.setLineWidth(1);
      doc.setStrokeColor(150, 150, 150);
      doc.line(pageWidth / 2 - 150, 430, pageWidth / 2 + 150, 430);

      doc.text(preset.defaultSigner, pageWidth / 2, 450, { align: "center" });

      doc.save(`certificado-konva-${preset.id}-${studentName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
      toast.success("Certificado Konva gerado com sucesso!");
    } catch (err) {
      toast.error("Erro ao gerar PDF.");
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
                Protótipo Konva.js — Presets Institucionais Normalizados
              </CardTitle>
              <CardDescription>
                Editor reativo com suporte aos presets institucionais compartilhados (Padrão, IsF e PROFICI).
              </CardDescription>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-700">
              <Layers size={14} /> Konva Engine
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4 lg:col-span-1 border-r pr-0 lg:pr-6 border-border">
              <div className="space-y-2">
                <Label>Preset Institucional</Label>
                <Select value={templateId} onValueChange={(v) => setTemplateId(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CERTIFICATE_PRESETS.default || CERTIFICATE_PRESETS).map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              <div className="pt-4">
                <Button onClick={handleExportPDF} disabled={isExporting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl">
                  {isExporting ? <RefreshCw className="animate-spin mr-2" size={16} /> : <Download className="mr-2" size={16} />}
                  Exportar PDF (Konva Pro)
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2 bg-muted/20 p-4 rounded-2xl border flex flex-col justify-center items-center">
              <div className="w-full max-w-[620px] aspect-[1.414/1] bg-white rounded-xl shadow-md border border-blue-200 p-6 relative flex flex-col justify-between text-center">
                <div>
                  <h4 className="font-black text-blue-600 tracking-wider text-xs uppercase">{preset.organization}</h4>
                </div>
                <div className="space-y-3">
                  <h3 className="font-black text-lg text-foreground">{preset.defaultTitle}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed px-4">
                    {preset.descriptionTemplate(studentName, studentCpf, courseTitle, workload, period)}
                  </p>
                </div>
                <div className="border-t pt-2 w-72 mx-auto">
                  <p className="text-xs font-bold text-foreground">{preset.defaultSigner}</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">Pré-visualização reativa baseada no preset {preset.name}.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
