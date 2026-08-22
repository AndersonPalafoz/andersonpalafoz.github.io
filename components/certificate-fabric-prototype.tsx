"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { fabric } from "fabric";
import { Download, Layers, Move, RefreshCw, Grid, ShieldCheck } from "lucide-react";

export function CertificateFabricPrototype() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [templateType, setTemplateType] = useState<"standard" | "isf" | "profici">("standard");
  const [studentName, setStudentName] = useState("Adna Caroline Vale Oliveira");
  const [studentCpf, setStudentCpf] = useState("123.671.106-89");
  const [courseTitle, setCourseTitle] = useState("Alfabetização e Letramento Étnico-Racial em Inglês");
  const [workload, setWorkload] = useState("40 Horas");
  const [period, setPeriod] = useState("02 de maio a 20 de junho de 2026");
  const [includeBranding, setIncludeBranding] = useState(true);
  const [selectedObjectType, setSelectedObjectType] = useState<string>("Nenhum");

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 842,
      height: 595,
      backgroundColor: "#ffffff",
      selection: true,
    });

    setFabricCanvas(canvas);
    redrawCanvas(canvas, templateType, studentName, studentCpf, courseTitle, workload, period, includeBranding);

    canvas.on("selection:created", (e) => {
      const activeObj = e.selected?.[0];
      setSelectedObjectType(activeObj?.type || "Objeto");
    });
    canvas.on("selection:cleared", () => {
      setSelectedObjectType("Nenhum");
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  const redrawCanvas = (
    canvas: fabric.Canvas,
    tType: string,
    name: string,
    cpf: string,
    course: string,
    hours: string,
    per: string,
    branding: boolean
  ) => {
    canvas.clear();
    canvas.backgroundColor = "#ffffff";

    let strokeColor = "#991b1b";
    let orgTitle = "ANDERSON PALAFOZ PLATFORM";

    if (tType === "isf") {
      strokeColor = "#0f766e"; // Teal Andifes/IsF
      orgTitle = "REDE ANDIFES IDIOMAS SEM FRONTEIRAS — UFBA";
    } else if (tType === "profici") {
      strokeColor = "#1e40af"; // Azul Profici UFBA
      orgTitle = "PROFICI — UFBA (PROGRAMA DE PROFICIÊNCIA)";
    }

    // Moldura
    const border = new fabric.Rect({
      left: 30,
      top: 30,
      width: 782,
      height: 535,
      fill: "transparent",
      stroke: strokeColor,
      strokeWidth: 3,
      selectable: false,
      evented: false,
    });
    canvas.add(border);

    if (branding) {
      const orgText = new fabric.Text(orgTitle, {
        left: 421,
        top: 55,
        fontSize: 12,
        fontFamily: "Poppins, sans-serif",
        fontWeight: "bold",
        fill: strokeColor,
        originX: "center",
        selectable: false,
      });
      canvas.add(orgText);
    }

    const titleText = new fabric.Text("CERTIFICADO DE CONCLUSÃO", {
      left: 421,
      top: 90,
      fontSize: 24,
      fontFamily: "Poppins, sans-serif",
      fontWeight: "bold",
      fill: "#1f2937",
      originX: "center",
      selectable: true,
    });
    canvas.add(titleText);

    let descString = "";
    if (tType === "isf") {
      descString = `Certificamos que ${name} (CPF nº ${cpf}) concluiu o curso de Língua Inglesa intitulado ${course}, ofertado pela Rede Andifes Idiomas sem Fronteiras em parceria com a Universidade Federal da Bahia, realizado no período de ${per}, com carga horária total de ${hours}.`;
    } else if (tType === "profici") {
      descString = `Certifico que ${name} concluiu o Curso de Inglês para Fins de Internacionalização do PROFICI (Programa de Proficiência em Língua Estrangeira para Estudantes e Servidores da UFBA), realizado no período de ${per} com carga horária de ${hours}.`;
    } else {
      descString = `Certificamos para os devidos fins que ${name} concluiu com êxito o programa acadêmico ${course}, no período de ${per}, com carga horária total de ${hours}.`;
    }

    const descBox = new fabric.Textbox(descString, {
      left: 80,
      top: 170,
      width: 682,
      fontSize: 15,
      fontFamily: "Poppins, sans-serif",
      fill: "#374151",
      textAlign: "center",
      selectable: true,
      name: "mainDescription",
    });
    canvas.add(descBox);

    const dateText = new fabric.Text(`Salvador, 22 de agosto de 2026.`, {
      left: 421,
      top: 360,
      fontSize: 14,
      fontFamily: "Poppins, sans-serif",
      fill: "#4b5563",
      originX: "center",
      selectable: true,
    });
    canvas.add(dateText);

    const signatureLine = new fabric.Line([271, 450, 571, 450], {
      stroke: "#9ca3af",
      strokeWidth: 1,
      selectable: false,
      evented: false,
    });
    canvas.add(signatureLine);

    let signLabel = "Anderson Palafoz — Professor e Pesquisador";
    if (tType === "isf") signLabel = "Coordenador(a) Administrativo(a) da Rede IsF na UFBA";
    if (tType === "profici") signLabel = "Fernanda Mota Pereira — Coordenadora Geral do PROFICI";

    const signatureText = new fabric.Text(signLabel, {
      left: 421,
      top: 460,
      fontSize: 13,
      fontFamily: "Poppins, sans-serif",
      fontWeight: "bold",
      fill: "#1f2937",
      originX: "center",
      selectable: false,
    });
    canvas.add(signatureText);

    canvas.renderAll();
  };

  const handleTemplateChange = (val: "standard" | "isf" | "profici") => {
    setTemplateType(val);
    if (!fabricCanvas) return;
    redrawCanvas(fabricCanvas, val, studentName, studentCpf, courseTitle, workload, period, includeBranding);
    toast.success(`Modelo alternado para: ${val.toUpperCase()}`);
  };

  const handleFieldChange = (field: string, val: string) => {
    if (field === "name") setStudentName(val);
    if (field === "cpf") setStudentCpf(val);
    if (field === "course") setCourseTitle(val);
    if (field === "workload") setWorkload(val);
    if (field === "period") setPeriod(val);

    if (!fabricCanvas) return;
    redrawCanvas(
      fabricCanvas,
      templateType,
      field === "name" ? val : studentName,
      field === "cpf" ? val : studentCpf,
      field === "course" ? val : courseTitle,
      field === "workload" ? val : workload,
      field === "period" ? val : period,
      includeBranding
    );
  };

  const handleExportPDF = async () => {
    try {
      toast.info("Gerando PDF com pdf-lib a partir do modelo selecionado...");
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([842, 595]);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

      page.drawRectangle({
        x: 30,
        y: 30,
        width: 782,
        height: 535,
        borderColor: templateType === "isf" ? rgb(0.05, 0.45, 0.43) : templateType === "profici" ? rgb(0.1, 0.25, 0.7) : rgb(0.6, 0.1, 0.1),
        borderWidth: 3,
      });

      page.drawText("CERTIFICADO DE CONCLUSÃO", {
        x: 230,
        y: 480,
        size: 24,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });

      page.drawText(`Aluno: ${studentName} (CPF: ${studentCpf})`, {
        x: 100,
        y: 410,
        size: 16,
        font: fontBold,
        color: rgb(0.2, 0.2, 0.2),
      });

      page.drawText(`Curso: ${courseTitle}`, {
        x: 100,
        y: 360,
        size: 14,
        font: fontReg,
        color: rgb(0.3, 0.3, 0.3),
      });

      page.drawText(`Carga Horária: ${workload} | Período: ${period}`, {
        x: 100,
        y: 320,
        size: 13,
        font: fontReg,
        color: rgb(0.3, 0.3, 0.3),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Certificado_${templateType}_${studentName.replace(/\s+/g, "_")}.pdf`;
      link.click();

      toast.success("PDF do modelo exportado com sucesso!");
    } catch (err) {
      toast.error("Erro ao gerar PDF.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-red-100 shadow-md">
        <CardHeader className="bg-red-50/50 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-red-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-600" />
                Protótipo Fabric.js — Compatível com Modelos DOCX (Padrão, IsF, PROFICI)
              </CardTitle>
              <CardDescription>
                Selecione o modelo oficial extraído dos arquivos DOCX para testar a renderização exata das variáveis acadêmicas e institucionais.
              </CardDescription>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF (DOCX Engine)
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-600" /> Seletor de Modelo DOCX
            </h3>

            <div className="space-y-2">
              <Label>Modelo de Certificado</Label>
              <Select value={templateType} onValueChange={(v: any) => handleTemplateChange(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o modelo" />
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
              <Input
                value={studentName}
                onChange={(e) => handleFieldChange("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>CPF do Aluno</Label>
              <Input
                value={studentCpf}
                onChange={(e) => handleFieldChange("cpf", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Título / Componente</Label>
              <Input
                value={courseTitle}
                onChange={(e) => handleFieldChange("course", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Carga Horária</Label>
                <Input
                  value={workload}
                  onChange={(e) => handleFieldChange("workload", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Período</Label>
                <Input
                  value={period}
                  onChange={(e) => handleFieldChange("period", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label className="text-xs">Identidade Visual</Label>
              <Switch
                checked={includeBranding}
                onCheckedChange={setIncludeBranding}
              />
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col items-center bg-zinc-950/5 p-6 rounded-xl border overflow-auto">
            <div className="flex items-center justify-between w-full max-w-4xl mb-3 px-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Move className="w-3.5 h-3.5" /> Prancheta A4 Paisagem (842x595 px) - Modelo: {templateType.toUpperCase()}
              </span>
            </div>

            <div className="border shadow-lg bg-white rounded-md overflow-hidden">
              <canvas ref={canvasRef} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
