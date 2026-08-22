"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Download, Code, ShieldCheck } from "lucide-react";

export function CertificateGrapesPrototype() {
  const [studentName, setStudentName] = useState("Adna Caroline Vale Oliveira");
  const [courseTitle, setCourseTitle] = useState("Alfabetização e Letramento Étnico-Racial em Inglês");
  const [workload, setWorkload] = useState("40 Horas");
  const [includeBranding, setIncludeBranding] = useState(true);

  const htmlTemplate = `
    <div style="width: 800px; height: 550px; padding: 40px; background: #fff; border: 4px solid #0f766e; font-family: 'Poppins', sans-serif; text-align: center; box-sizing: border-box; position: relative;">
      <h1 style="color: #111827; font-size: 24px; margin-top: 20px; font-weight: 800; letter-spacing: 2px;">CERTIFICADO DE CONCLUSÃO</h1>
      <p style="color: #4b5563; font-size: 14px; margin-top: 30px;">Certificamos que o(a) aluno(a)</p>
      <h2 style="color: #0d9488; font-size: 28px; margin: 15px 0; font-weight: 800;">${studentName}</h2>
      <p style="color: #374151; font-size: 14px; line-height: 1.6; max-width: 600px; margin: 20px auto;">
        concluiu com êxito o programa acadêmico <strong>${courseTitle}</strong>, com carga horária total de <strong>${workload}</strong>.
      </p>
      <div style="margin-top: 70px;">
        <div style="width: 300px; border-top: 1px solid #9ca3af; margin: 0 auto 10px auto;"></div>
        <p style="color: #1f2937; font-size: 13px; font-weight: 700; margin: 0;">Anderson Palafoz — Professor e Pesquisador</p>
      </div>
      ${includeBranding ? '<div style="position: absolute; bottom: 15px; left: 0; right: 0; font-size: 10px; color: #9ca3af;">Anderson Palafoz Platform — Documento Oficial</div>' : ''}
    </div>
  `;

  const handleExportPDF = async () => {
    try {
      toast.info("Gerando PDF profissional com pdf-lib a partir do template estruturado...");
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([842, 595]);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

      page.drawRectangle({
        x: 30,
        y: 30,
        width: 782,
        height: 535,
        borderColor: rgb(0.05, 0.45, 0.43),
        borderWidth: 3,
      });

      page.drawText("CERTIFICADO DE CONCLUSÃO (HTML Template Engine)", {
        x: 180,
        y: 480,
        size: 22,
        font: fontBold,
        color: rgb(0.05, 0.3, 0.28),
      });

      page.drawText(studentName, {
        x: 421 - (studentName.length * 7),
        y: 390,
        size: 26,
        font: fontBold,
        color: rgb(0.05, 0.58, 0.53),
      });

      page.drawText(`Curso: ${courseTitle}`, {
        x: 100,
        y: 320,
        size: 15,
        font: fontReg,
        color: rgb(0.2, 0.2, 0.2),
      });

      page.drawText(`Carga Horária: ${workload}`, {
        x: 100,
        y: 290,
        size: 15,
        font: fontReg,
        color: rgb(0.2, 0.2, 0.2),
      });

      if (includeBranding) {
        page.drawText("Anderson Palafoz Platform — HTML/CSS Engine", {
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
      link.download = `Certificado_HTML_${studentName.replace(/\s+/g, "_")}.pdf`;
      link.click();

      toast.success("PDF gerado com sucesso via Template HTML!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar PDF.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-teal-100 shadow-md">
        <CardHeader className="bg-teal-50/50 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-teal-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                Protótipo Baseado em Template HTML/CSS (Inspiração GrapesJS)
              </CardTitle>
              <CardDescription>
                Ideal para estruturar certificados via código HTML/CSS responsivo com renderização de alta precisão.
              </CardDescription>
            </div>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF (HTML)
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Code className="w-4 h-4 text-teal-600" /> Propriedades HTML
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
              <p>• Renderiza diretamente a estrutura HTML/CSS.</p>
              <p>• Excelente compatibilidade com exportação.</p>
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col items-center bg-zinc-950/5 p-6 rounded-xl border overflow-auto">
            <div className="border shadow-lg bg-white rounded-md overflow-hidden p-4 flex items-center justify-center">
              <div dangerouslySetInnerHTML={{ __html: htmlTemplate }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
