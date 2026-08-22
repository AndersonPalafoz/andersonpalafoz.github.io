"use client";

import React, { useState } from "react";
import { Stage, Layer, Rect, Text, Line } from "react-konva";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Download, Layers, ShieldCheck } from "lucide-react";

export function CertificateKonvaPrototype() {
  const [studentName, setStudentName] = useState("Adna Caroline Vale Oliveira");
  const [courseTitle, setCourseTitle] = useState("Alfabetização e Letramento Étnico-Racial em Inglês");
  const [workload, setWorkload] = useState("40 Horas");
  const [includeBranding, setIncludeBranding] = useState(true);

  // Posições arrastáveis em React state (Konva declarativo)
  const [namePos, setNamePos] = useState({ x: 421, y: 190 });
  const [titlePos, setTitlePos] = useState({ x: 421, y: 90 });
  const [descPos, setDescPos] = useState({ x: 421, y: 150 });

  const handleExportPDF = async () => {
    try {
      toast.info("Gerando PDF profissional com pdf-lib a partir do layout Konva...");
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([842, 595]);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

      page.drawRectangle({
        x: 30,
        y: 30,
        width: 782,
        height: 535,
        borderColor: rgb(0.1, 0.4, 0.7),
        borderWidth: 3,
      });

      page.drawText("CERTIFICADO DE CONCLUSÃO (Konva Engine)", {
        x: 200,
        y: 595 - titlePos.y,
        size: 24,
        font: fontBold,
        color: rgb(0.1, 0.2, 0.4),
      });

      page.drawText(studentName, {
        x: 421 - (studentName.length * 7),
        y: 595 - namePos.y,
        size: 26,
        font: fontBold,
        color: rgb(0.1, 0.5, 0.7),
      });

      page.drawText(`Curso: ${courseTitle} (${workload})`, {
        x: 100,
        y: 300,
        size: 15,
        font: fontReg,
        color: rgb(0.2, 0.2, 0.2),
      });

      if (includeBranding) {
        page.drawText("Anderson Palafoz Platform — Konva Edition", {
          x: 100,
          y: 70,
          size: 10,
          font: fontReg,
          color: rgb(0.5, 0.5, 0.5),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Certificado_Konva_${studentName.replace(/\s+/g, "_")}.pdf`;
      link.click();

      toast.success("PDF gerado com sucesso via Konva + pdf-lib!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar PDF.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-100 shadow-md">
        <CardHeader className="bg-blue-50/50 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Protótipo Konva.js + react-konva (Camadas React Declarativas)
              </CardTitle>
              <CardDescription>
                Editor visual baseado em React state com movimentação fluida em tempo real e renderização em camadas.
              </CardDescription>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF (Konva)
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Propriedades
            </h3>
            <div className="space-y-2">
              <Label>Nome do Aluno</Label>
              <Input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Título do Curso</Label>
              <Input
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Carga Horária</Label>
              <Input
                value={workload}
                onChange={(e) => setWorkload(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Label className="text-xs">Identidade Visual</Label>
              <Switch
                checked={includeBranding}
                onCheckedChange={setIncludeBranding}
              />
            </div>
            <div className="pt-4 border-t text-xs text-muted-foreground">
              <p>• Arraste os textos diretamente no canvas.</p>
              <p>• Gerenciado 100% via React State e Konva.</p>
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col items-center bg-zinc-950/5 p-6 rounded-xl border overflow-auto">
            <div className="border shadow-lg bg-white rounded-md overflow-hidden">
              <Stage width={842} height={595}>
                <Layer>
                  {/* Fundo e Moldura */}
                  <Rect x={0} y={0} width={842} height={595} fill="#ffffff" />
                  <Rect x={30} y={30} width={782} height={535} stroke="#1d4ed8" strokeWidth={3} />

                  {/* Título */}
                  <Text
                    text="CERTIFICADO DE CONCLUSÃO"
                    x={titlePos.x}
                    y={titlePos.y}
                    fontSize={26}
                    fontFamily="Poppins"
                    fontStyle="bold"
                    fill="#1e293b"
                    offsetX={180}
                    draggable
                    onDragEnd={(e) => setTitlePos({ x: e.target.x(), y: e.target.y() })}
                  />

                  {/* Nome do Aluno */}
                  <Text
                    text={studentName}
                    x={namePos.x}
                    y={namePos.y}
                    fontSize={28}
                    fontFamily="Poppins"
                    fontStyle="bold"
                    fill="#2563eb"
                    offsetX={studentName.length * 7}
                    draggable
                    onDragEnd={(e) => setNamePos({ x: e.target.x(), y: e.target.y() })}
                  />

                  {/* Descrição */}
                  <Text
                    text={`Curso: ${courseTitle} (${workload})`}
                    x={421}
                    y={300}
                    fontSize={15}
                    fontFamily="Poppins"
                    fill="#475569"
                    align="center"
                    offsetX={250}
                  />

                  {/* Linha de assinatura */}
                  <Line points={[271, 450, 571, 450]} stroke="#94a3b8" strokeWidth={1} />
                  <Text
                    text="Anderson Palafoz — Professor e Pesquisador"
                    x={421}
                    y={460}
                    fontSize={14}
                    fontFamily="Poppins"
                    fill="#1e293b"
                    align="center"
                    offsetX={150}
                  />
                </Layer>
              </Stage>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
