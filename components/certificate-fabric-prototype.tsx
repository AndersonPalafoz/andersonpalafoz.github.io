"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CERTIFICATE_PRESETS } from "@/lib/certificate-presets";
import { generateCertificatePdf } from "@/lib/certificate-pdf-generator";
import { Download, RefreshCw, ShieldCheck } from "lucide-react";

export function CertificateFabricPrototype() {
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
  const [fontSize, setFontSize] = useState<number>(preset.fontSize);
  const [logoUrl, setLogoUrl] = useState<string>("/manus-storage/Horizontal-v1.png");
  const [logoWidth, setLogoWidth] = useState<number>(140);
  const [logoPosX, setLogoPosX] = useState<number>(50); // percentual ou px
  const [logoPosY, setLogoPosY] = useState<number>(10);
  const [logoLayer, setLogoLayer] = useState<number>(10); // z-index
  const [titlePosY, setTitlePosY] = useState<number>(90);
  const [bodyPosY, setBodyPosY] = useState<number>(160);
  const [extraElements, setExtraElements] = useState<Array<{ id: string; type: 'text' | 'badge' | 'line'; content: string; x: number; y: number; size: number; color: string }>>([
    { id: '1', type: 'badge', content: 'DOCUMENTO OFICIAL VERIFICADO', x: 50, y: 78, size: 10, color: '#0F766E' }
  ]);
  const [newElemText, setNewElemText] = useState("Novo Elemento de Texto ou Ícone");
  const [isExporting, setIsExporting] = useState(false);

  const handleAddElement = (type: 'text' | 'badge' | 'line') => {
    setExtraElements(prev => [...prev, {
      id: Date.now().toString(),
      type,
      content: newElemText || 'Elemento',
      x: 50,
      y: 50,
      size: 12,
      color: '#333333'
    }]);
    toast.success("Elemento adicionado à prancheta!");
  };

  const handleRemoveElement = (id: string) => {
    setExtraElements(prev => prev.filter(el => el.id !== id));
    toast.success("Elemento removido.");
  };

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
      setFontSize(p.fontSize);
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
        templateName: `fabric-pro-${templateId}`,
        logoUrl,
        fontSize,
      });
      toast.success("Certificado exportado com sucesso via Fabric Engine!");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error(`Erro ao gerar PDF: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-red-200 shadow-md">
        <CardHeader className="bg-red-50/50 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-red-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-600" />
                Fabric.js Engine — Réplica Avançada dos Modelos DOCX
              </CardTitle>
              <CardDescription>
                Edite todos os campos textuais, título, signatários, data, CPF e estrutura dos modelos IsF e PROFICI.
              </CardDescription>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-700">
              Fabric Pro Engine
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

              <div className="space-y-4 border p-3 rounded-xl bg-muted/30">
                <Label className="font-bold text-red-900">Editor de Composição Livre (Estilo Canva)</Label>
                
                <div className="space-y-2">
                  <Label className="text-xs">Logo / Imagem Institucional</Label>
                  <Input type="file" accept="image/*" onChange={handleLogoUpload} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px]">Largura da Logo</Label>
                    <input type="range" min="60" max="240" value={logoWidth} onChange={(e) => setLogoWidth(Number(e.target.value))} className="w-full" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Camada (Z-Index)</Label>
                    <Select value={String(logoLayer)} onValueChange={(v) => setLogoLayer(Number(v))}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Fundo (1)</SelectItem>
                        <SelectItem value="10">Normal (10)</SelectItem>
                        <SelectItem value="50">Frente (50)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px]">Posição X ({logoPosX}%)</Label>
                    <input type="range" min="5" max="85" value={logoPosX} onChange={(e) => setLogoPosX(Number(e.target.value))} className="w-full" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Posição Y ({logoPosY}%)</Label>
                    <input type="range" min="5" max="40" value={logoPosY} onChange={(e) => setLogoPosY(Number(e.target.value))} className="w-full" />
                  </div>
                </div>

                <div className="pt-2 border-t space-y-2">
                  <Label className="text-xs font-semibold">Adicionar Elementos Livres (Textos/Badges)</Label>
                  <div className="flex gap-2">
                    <Input value={newElemText} onChange={(e) => setNewElemText(e.target.value)} className="h-8 text-xs" />
                    <Button onClick={() => handleAddElement('badge')} size="sm" className="bg-red-700 text-xs h-8">Adicionar</Button>
                  </div>
                  <div className="space-y-1 pt-1 max-h-28 overflow-y-auto">
                    {extraElements.map(el => (
                      <div key={el.id} className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded border">
                        <span className="truncate max-w-[140px]">{el.content}</span>
                        <button onClick={() => handleRemoveElement(el.id)} className="text-red-600 hover:text-red-800 font-bold px-1">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleExportPDF} disabled={isExporting} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl">
                  {isExporting ? <RefreshCw className="animate-spin mr-2" size={16} /> : <Download className="mr-2" size={16} />}
                  Exportar PDF (Fabric Engine)
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2 bg-muted/20 p-4 rounded-2xl border flex flex-col justify-center items-center">
              <div className="w-full max-w-[620px] aspect-[1.414/1] bg-white rounded-xl shadow-md border border-red-200 p-8 relative flex flex-col justify-between text-center overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                  {logoUrl && (
                    <div 
                      className="absolute pointer-events-auto cursor-grab active:cursor-grabbing transition-all"
                      style={{ 
                        left: `${logoPosX}%`, 
                        top: `${logoPosY}%`, 
                        zIndex: logoLayer,
                        width: `${logoWidth}px` 
                      }}
                    >
                      <img src={logoUrl} alt="Logo Customizada" className="w-full object-contain drop-shadow-sm border border-dashed border-red-300 p-1 bg-white/80 rounded" />
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center relative z-20">
                  <h4 className="font-black text-red-700 tracking-wider text-xs uppercase">{preset.organization}</h4>
                  <div className="flex items-center gap-1">
                    {extraElements.map(el => (
                      <span key={el.id} className="absolute text-[9px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-mono shadow-sm cursor-move" style={{ left: `${el.x}%`, top: `${el.y}%`, zIndex: 30 }}>
                        {el.content}
                      </span>
                    ))}
                    <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-mono">Modo Canva Ativo</span>
                  </div>
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
              <p className="text-[11px] text-muted-foreground mt-3">Pré-visualização em tempo real baseada nos modelos DOCX (Fabric Pro).</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
