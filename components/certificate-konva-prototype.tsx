"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Layers, Download, RefreshCw } from "lucide-react";
import { jsPDF } from "jspdf";

export function CertificateKonvaPrototype() {
  const [templateType, setTemplateType] = useState<"standard" | "isf" | "profici">("isf");
  const [studentName, setStudentName] = useState("Maria José Ferreira Lopes");
  const [studentCpf, setStudentCpf] = useState("065.192.044-20");
  const [courseTitle, setCourseTitle] = useState("Estratégias de Leitura de Textos em Língua Inglesa – Nível de Proficiência A2");
  const [workloadHours, setWorkloadHours] = useState("32 horas");
  const [period, setPeriod] = useState("02 de maio a 20 de junho de 2026");
  const [includeBranding, setIncludeBranding] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      const strokeColor = templateType === "isf" ? [15, 118, 110] : templateType === "profici" ? [30, 64, 175] : [37, 99, 235];
      doc.setLineWidth(3);
      doc.setStrokeColor(strokeColor[0], strokeColor[1], strokeColor[2]);
      doc.rect(30, 30, pageWidth - 60, pageHeight - 60);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(30, 41, 59);
      doc.text("CERTIFICADO DE CONCLUSÃO", pageWidth / 2, 100, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      doc.setTextColor(60, 60, 60);

      let textDesc = "";
      if (templateType === "isf") {
        textDesc = `Certificamos que ${studentName} (CPF nº ${studentCpf}) concluiu o curso de Língua Inglesa intitulado ${courseTitle}, ofertado pela Rede Andifes Idiomas sem Fronteiras em parceria com a UFBA, no período de ${period}, com carga horária total de ${workloadHours}.`;
      } else if (templateType === "profici") {
        textDesc = `Certifico que ${studentName} concluiu o Curso de Inglês para Fins de Internacionalização do PROFICI (UFBA), realizado no período de ${period} com carga horária de ${workloadHours}.`;
      } else {
        textDesc = `Certificamos que ${studentName} concluiu com êxito o programa acadêmico ${courseTitle}, com carga horária de ${workloadHours}.`;
      }

      const splitText = doc.splitTextToSize(textDesc, pageWidth - 140);
      doc.text(splitText, 70, 180, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Salvador, 22 de agosto de 2026.", pageWidth / 2, 340, { align: "center" });

      doc.setLineWidth(1);
      doc.setStrokeColor(150, 150, 150);
      doc.line(pageWidth / 2 - 150, 430, pageWidth / 2 + 150, 430);

      const signLabel = templateType === "isf" ? "Coordenador(a) Administrativo(a) da Rede IsF na UFBA" : templateType === "profici" ? "Fernanda Mota Pereira — Coordenadora Geral do PROFICI" : "Anderson Bacelar Palafoz";
      doc.text(signLabel, pageWidth / 2, 450, { align: "center" });

      doc.save(`certificado-konva-${templateType}-${studentName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
      toast.success("Certificado Konva gerado com sucesso em PDF!");
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
                Protótipo Konva.js — Compatível com Modelos DOCX (IsF & PROFICI)
              </CardTitle>
              <CardDescription>
                Visualização reativa em camadas com suporte aos textos e estruturas oficiais dos arquivos DOCX anexados.
              </CardDescription>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-700">
              <Layers size={14} /> DOCX Engine
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4 lg:col-span-1 border-r pr-0 lg:pr-6 border-border">
              <div className="space-y-2">
                <Label>Modelo de Certificado</Label>
                <Select value={templateType} onValueChange={(v: any) => setTemplateType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Padrão Anderson Palafoz</SelectItem>
                    <SelectItem value="isf">Modelo IsF / Andifes (DOCX)</SelectItem>
                    <SelectItem value="profici">Modelo PROFICI / UFBA (DOCX)</SelectItem>
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
                <Label>Título do Curso / Componente</Label>
                <Input value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Carga Horária</Label>
                  <Input value={workloadHours} onChange={(e) => setWorkloadHours(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Período</Label>
                  <Input value={period} onChange={(e) => setPeriod(e.target.value)} />
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
              <div className="w-full max-w-[620px] aspect-[1.414/1] bg-white rounded-xl shadow-md border border-blue-200 p-6 relative flex flex-col justify-between text-center">
                <div className="space-y-1">
                  <h4 className="font-black text-blue-600 tracking-wider text-xs uppercase">
                    {templateType === "isf" ? "Rede Andifes Idiomas sem Fronteiras — UFBA" : templateType === "profici" ? "PROFICI — UFBA" : "Anderson Palafoz Platform"}
                  </h4>
                </div>
                <div className="space-y-3">
                  <h3 className="font-black text-lg text-foreground">CERTIFICADO DE CONCLUSÃO</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed px-4">
                    {templateType === "isf"
                      ? `Certificamos que ${studentName} (CPF nº ${studentCpf}) concluiu o curso ${courseTitle}, ofertado pela Rede Andifes IsF em parceria com a UFBA, no período de ${period}, com carga horária de ${workloadHours}.`
                      : templateType === "profici"
                      ? `Certifico que ${studentName} concluiu o Curso de Inglês para Fins de Internacionalização do PROFICI (UFBA), no período de ${period} com carga horária de ${workloadHours}.`
                      : `Certificamos que ${studentName} concluiu com êxito o curso ${courseTitle} (${workloadHours}).`}
                  </p>
                </div>
                <div className="border-t pt-2 w-64 mx-auto">
                  <p className="text-xs font-bold text-foreground">
                    {templateType === "isf" ? "Coordenador(a) Administrativo(a) da Rede IsF na UFBA" : templateType === "profici" ? "Fernanda Mota Pereira — Coordenadora Geral do PROFICI" : "Anderson Bacelar Palafoz"}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">Pré-visualização compatível com a estrutura dos documentos DOCX.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
