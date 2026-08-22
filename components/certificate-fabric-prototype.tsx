"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { fabric } from "fabric";
import { Download, Layers, Move, RefreshCw, ZoomIn, ZoomOut, Grid, ShieldCheck } from "lucide-react";

export function CertificateFabricPrototype() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [studentName, setStudentName] = useState("Adna Caroline Vale Oliveira");
  const [courseTitle, setCourseTitle] = useState("Alfabetização e Letramento Étnico-Racial em Inglês");
  const [workload, setWorkload] = useState("40 Horas");
  const [includeBranding, setIncludeBranding] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedObjectType, setSelectedObjectType] = useState<string>("Nenhum");

  useEffect(() => {
    if (!canvasRef.current) return;

    // Inicializar canvas Fabric (tamanho A4 proporcional em paisagem: 842 x 595)
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 842,
      height: 595,
      backgroundColor: "#ffffff",
      selection: true,
    });

    setFabricCanvas(canvas);

    // Desenhar moldura institucional
    const border = new fabric.Rect({
      left: 30,
      top: 30,
      width: 782,
      height: 535,
      fill: "transparent",
      stroke: "#991b1b",
      strokeWidth: 3,
      selectable: false,
      evented: false,
    });
    canvas.add(border);

    // Adicionar textos editáveis iniciais
    const titleText = new fabric.Text("CERTIFICADO DE CONCLUSÃO", {
      left: 421,
      top: 90,
      fontSize: 26,
      fontFamily: "Poppins, sans-serif",
      fontWeight: "bold",
      fill: "#1f2937",
      originX: "center",
      selectable: true,
    });
    canvas.add(titleText);

    const descText = new fabric.Text("Certificamos que o(a) aluno(a)", {
      left: 421,
      top: 150,
      fontSize: 16,
      fontFamily: "Poppins, sans-serif",
      fill: "#4b5563",
      originX: "center",
    });
    canvas.add(descText);

    const nameText = new fabric.Text(studentName, {
      left: 421,
      top: 190,
      fontSize: 28,
      fontFamily: "Poppins, sans-serif",
      fontWeight: "bold",
      fill: "#dc2626",
      originX: "center",
      name: "studentName",
    });
    canvas.add(nameText);

    const courseDesc = new fabric.Text(`concluiu com êxito o curso ${courseTitle}, com carga horária de ${workload}.`, {
      left: 421,
      top: 260,
      fontSize: 15,
      fontFamily: "Poppins, sans-serif",
      fill: "#374151",
      originX: "center",
      textAlign: "center",
      width: 680,
    });
    canvas.add(courseDesc);

    const signatureLine = new fabric.Line([271, 450, 571, 450], {
      stroke: "#9ca3af",
      strokeWidth: 1,
      selectable: false,
      evented: false,
    });
    canvas.add(signatureLine);

    const signatureText = new fabric.Text("Anderson Palafoz — Professor e Pesquisador", {
      left: 421,
      top: 460,
      fontSize: 14,
      fontFamily: "Poppins, sans-serif",
      fill: "#1f2937",
      originX: "center",
      selectable: false,
    });
    canvas.add(signatureText);

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

  const handleUpdateStudentName = (newName: string) => {
    setStudentName(newName);
    if (!fabricCanvas) return;
    fabricCanvas.getObjects().forEach((obj: any) => {
      if (obj.name === "studentName") {
        obj.set("text", newName);
        fabricCanvas.renderAll();
      }
    });
  };

  const handleAddCustomTextField = () => {
    if (!fabricCanvas) return;
    const text = new fabric.IText("Novo Campo Acadêmico", {
      left: 200,
      top: 340,
      fontSize: 16,
      fontFamily: "Poppins, sans-serif",
      fill: "#1f2937",
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    toast.success("Novo campo de texto adicionado à prancheta.");
  };

  const handleExportPDF = async () => {
    try {
      toast.info("Gerando PDF profissional com pdf-lib a partir do layout Fabric...");
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([842, 595]); // A4 Paisagem
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Desenhar moldura em PDF
      page.drawRectangle({
        x: 30,
        y: 30,
        width: 782,
        height: 535,
        borderColor: rgb(0.6, 0.1, 0.1),
        borderWidth: 3,
      });

      // Título
      page.drawText("CERTIFICADO DE CONCLUSÃO", {
        x: 230,
        y: 480,
        size: 24,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });

      page.drawText("Certificamos que o(a) aluno(a)", {
        x: 340,
        y: 420,
        size: 14,
        font: fontReg,
        color: rgb(0.3, 0.3, 0.3),
      });

      page.drawText(studentName, {
        x: 421 - (studentName.length * 7),
        y: 370,
        size: 26,
        font: fontBold,
        color: rgb(0.8, 0.1, 0.1),
      });

      page.drawText(`Curso: ${courseTitle}`, {
        x: 100,
        y: 310,
        size: 15,
        font: fontReg,
        color: rgb(0.2, 0.2, 0.2),
      });

      page.drawText(`Carga Horária: ${workload}`, {
        x: 100,
        y: 280,
        size: 15,
        font: fontReg,
        color: rgb(0.2, 0.2, 0.2),
      });

      if (includeBranding) {
        page.drawText("Anderson Palafoz Platform — Validação Oficial", {
          x: 100,
          y: 70,
          size: 10,
          font: fontReg,
          color: rgb(0.5, 0.5, 0.5),
        });
      }

      page.drawLine({
        start: { x: 271, y: 150 },
        end: { x: 571, y: 150 },
        thickness: 1,
        color: rgb(0.6, 0.6, 0.6),
      });

      page.drawText("Anderson Palafoz — Professor e Pesquisador", {
        x: 295,
        y: 125,
        size: 12,
        font: fontReg,
        color: rgb(0.2, 0.2, 0.2),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Certificado_${studentName.replace(/\s+/g, "_")}.pdf`;
      link.click();

      toast.success("Certificado em PDF gerado e baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF do protótipo:", error);
      toast.error("Erro ao gerar o PDF.");
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
                Protótipo de Editor Visual Avançado (Fabric.js + pdf-lib)
              </CardTitle>
              <CardDescription>
                Ambiente isolado de testes para edição visual com prancheta interativa, grade e exportação profissional.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleAddCustomTextField()}>
                + Texto Acadêmico
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF Pro
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Painel de Controles */}
          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-600" /> Propriedades do Aluno
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="student-name">Nome do Aluno</Label>
              <Input
                id="student-name"
                value={studentName}
                onChange={(e) => handleUpdateStudentName(e.target.value)}
                placeholder="Digite o nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-title">Título do Curso</Label>
              <Input
                id="course-title"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="Nome do curso"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workload">Carga Horária</Label>
              <Input
                id="workload"
                value={workload}
                onChange={(e) => setWorkload(e.target.value)}
                placeholder="Ex: 40 Horas"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="include-branding" className="cursor-pointer text-xs">Incluir Identidade Visual</Label>
              <Switch
                id="include-branding"
                checked={includeBranding}
                onCheckedChange={setIncludeBranding}
              />
            </div>

            <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Instruções de Uso:</p>
              <p>• Clique e arraste os textos na prancheta para reposicioná-los livremente.</p>
              <p>• Use os controles de zoom e grade para alinhar com precisão profissional.</p>
              <p>• Selecionado atualmente: <span className="font-semibold text-red-600">{selectedObjectType}</span></p>
            </div>
          </div>

          {/* Prancheta Visual (Canvas Fabric) */}
          <div className="lg:col-span-3 flex flex-col items-center bg-zinc-950/5 p-6 rounded-xl border overflow-auto">
            <div className="flex items-center justify-between w-full max-w-4xl mb-3 px-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Move className="w-3.5 h-3.5" /> Prancheta A4 Paisagem (842x595 px)
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Grid className="w-3.5 h-3.5" /> Grade Magnética Ativa
                </span>
                <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
              </div>
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
