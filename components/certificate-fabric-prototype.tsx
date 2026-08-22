"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CERTIFICATE_PRESETS } from "@/lib/certificate-presets";
import { generateCertificatePdf, type CertificatePdfElement } from "@/lib/certificate-pdf-generator";
import { Download, RefreshCw, ShieldCheck } from "lucide-react";
import { useCertificateWorkspace } from "@/components/certificate-workspace-context";
import { type CertificateCompositionElement } from "@/lib/certificate-composition";

export function CertificateFabricPrototype() {
  const {
    composition,
    sampleData,
    updateComposition,
    setSampleData,
    setSelectedTemplateId: setWorkspaceTemplate,
  } = useCertificateWorkspace();
  const [templateId, setTemplateId] = useState<string>("isf");
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
  const [fontSize, setFontSize] = useState<number>(preset.fontSize);
  const [logoUrl, setLogoUrl] = useState<string>(
    composition.elements.find(element => element.id === "primary-logo" && element.type === "image")?.content || "/logo-horizontal.png"
  );
  const [logoWidth, setLogoWidth] = useState<number>(140);
  const [logoPosX, setLogoPosX] = useState<number>(50); // percentual ou px
  const [logoPosY, setLogoPosY] = useState<number>(10);
  const [logoLayer, setLogoLayer] = useState<number>(10); // z-index
  const [titlePosY, setTitlePosY] = useState<number>(90);
  const [bodyPosY, setBodyPosY] = useState<number>(160);
  const [extraElements, setExtraElements] = useState<CertificatePdfElement[]>(
    composition.elements.map(element => ({
      ...element,
      size: element.size || 12,
      color: element.color || "#333333",
      src: element.type === "image" ? element.content : undefined,
    }))
  );
  const artboardRef = useRef<HTMLDivElement>(null);
  const [newElemText, setNewElemText] = useState("Novo Elemento de Texto ou Ícone");
  
  // Histórico Undo/Redo e Grade Magnética
  const [history, setHistory] = useState<Array<any>>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [savedTemplates, setSavedTemplates] = useState<Array<{ id: string; name: string; state: any }>>([
    { id: 't1', name: 'Modelo Padrão Executivo', state: { title: 'Certificado de Excelência' } }
  ]);
  const [modelNameInput, setModelNameInput] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const nextElements = composition.elements.map(element => ({
      ...element,
      size: element.size || 12,
      color: element.color || "#333333",
      src: element.type === "image" ? element.content : undefined,
    }));
    setExtraElements(nextElements);
    const primaryLogo = composition.elements.find(element => element.id === "primary-logo" && element.type === "image");
    if (primaryLogo) setLogoUrl(primaryLogo.content);
  }, [composition.elements]);

  useEffect(() => {
    setStudentName(sampleData.studentName);
    setStudentCpf(sampleData.studentCpf);
    setCourseTitle(sampleData.courseTitle);
    setWorkload(sampleData.workloadHours);
    setPeriod(sampleData.period);
  }, [sampleData]);

  const commitElements = (next: CertificatePdfElement[]) => {
    setExtraElements(next);
    updateComposition(current => ({
      ...current,
      elements: next.map(element => ({
        ...element,
        content: element.type === "image" ? element.src || element.content : element.content,
        size: element.size || 12,
        color: element.color || "#333333",
      })) as CertificateCompositionElement[],
    }));
  };

  const saveStateToHistory = () => {
    const currentState = { customTitle, customSigner, customRole, logoPosX, logoPosY, logoWidth, extraElements };
    const newHist = history.slice(0, historyIndex + 1);
    setHistory([...newHist, currentState]);
    setHistoryIndex(newHist.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCustomTitle(prev.customTitle);
      setCustomSigner(prev.customSigner);
      setCustomRole(prev.customRole);
      setLogoPosX(prev.logoPosX);
      setLogoPosY(prev.logoPosY);
      setLogoWidth(prev.logoWidth);
      setExtraElements(prev.extraElements);
      toast.info("Ação desfeita (Undo)");
    } else {
      toast.message("Início do histórico alcançado.");
    }
  };

  const handleSaveAsTemplate = () => {
    if (!modelNameInput.trim()) {
      toast.error("Informe um nome para o modelo.");
      return;
    }
    const newTemplate = {
      id: Date.now().toString(),
      name: modelNameInput,
      state: { customTitle, customSigner, customRole, logoUrl, logoWidth, logoPosX, logoPosY, extraElements }
    };
    setSavedTemplates(prev => [...prev, newTemplate]);
    setModelNameInput('');
    toast.success(`Modelo "${newTemplate.name}" salvo com sucesso!`);
  };

  const handleLoadTemplate = (tmpl: any) => {
    setCustomTitle(tmpl.state.customTitle || customTitle);
    setCustomSigner(tmpl.state.customSigner || customSigner);
    setCustomRole(tmpl.state.customRole || customRole);
    setLogoWidth(tmpl.state.logoWidth || logoWidth);
    setLogoPosX(tmpl.state.logoPosX || logoPosX);
    setLogoPosY(tmpl.state.logoPosY || logoPosY);
    if (tmpl.state.extraElements) setExtraElements(tmpl.state.extraElements);
    toast.success(`Modelo "${tmpl.name}" carregado!`);
  };

  const handleAddElement = (type: 'text' | 'badge' | 'line') => {
    commitElements([...extraElements, {
      id: `${type}-${Date.now()}`,
      type,
      content: newElemText || (type === 'line' ? 'Linha divisória' : 'Elemento'),
      x: 50,
      y: 50,
      size: type === 'badge' ? 10 : 12,
      color: type === 'badge' ? '#0F766E' : '#333333',
      align: 'center'
    }]);
    toast.success("Elemento adicionado à prancheta e conectado à emissão.");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error("Selecione um arquivo de imagem válido.");
      return;
    }
    if (file.size > 2_000_000) {
      toast.error("A imagem deve ter no máximo 2 MB para permanecer no modelo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || "");
      if (!src.startsWith("data:image/")) return;
      commitElements([...extraElements, {
        id: `image-${Date.now()}`,
        type: 'image',
        content: src,
        src,
        x: 50,
        y: 50,
        size: 12,
        color: '#333333',
        width: 140,
        height: 90
      }]);
      toast.success("Imagem adicionada à prancheta e será incluída na composição final.");
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleUpdateElement = (id: string, patch: Partial<CertificatePdfElement>) => {
    commitElements(extraElements.map(element => element.id === id ? { ...element, ...patch } : element));
  };

  const handleElementDragEnd = (id: string, e: React.DragEvent<HTMLElement>) => {
    const rect = artboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(4, Math.min(96, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(4, Math.min(96, ((e.clientY - rect.top) / rect.height) * 100));
    handleUpdateElement(id, { x: Math.round(x), y: Math.round(y) });
  };

  const handleNewElementDragStart = (e: React.DragEvent<HTMLButtonElement>, type: 'text' | 'badge' | 'line') => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/x-certificate-element', type);
  };

  const handleNewElementDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/x-certificate-element') as 'text' | 'badge' | 'line';
    if (!['text', 'badge', 'line'].includes(type)) return;
    const rect = artboardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(4, Math.min(96, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(4, Math.min(96, ((e.clientY - rect.top) / rect.height) * 100));
    commitElements([...extraElements, {
      id: `${type}-${Date.now()}`,
      type,
      content: newElemText || (type === 'line' ? 'Linha divisória' : 'Elemento'),
      x: Math.round(x),
      y: Math.round(y),
      size: type === 'badge' ? 10 : 12,
      color: type === 'badge' ? '#0F766E' : '#333333',
      align: 'center'
    }]);
    toast.success('Elemento posicionado na prancheta.');
  };

  const handleRemoveElement = (id: string) => {
    const element = extraElements.find(item => item.id === id);
    if (element?.src?.startsWith('blob:')) URL.revokeObjectURL(element.src);
    commitElements(extraElements.filter(el => el.id !== id));
    toast.success("Elemento removido da composição e da futura emissão.");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      if (!url.startsWith("data:image/")) return;
      setLogoUrl(url);
      commitElements([
        ...extraElements.filter(element => element.id !== "primary-logo"),
        {
          id: "primary-logo",
          type: "image",
          content: url,
          src: url,
          x: logoPosX,
          y: logoPosY,
          size: 12,
          color: "#333333",
          width: logoWidth,
          height: Math.max(32, Math.round(logoWidth * 0.45)),
          zIndex: logoLayer,
        },
      ]);
      toast.success("Logo carregada e vinculada à composição final.");
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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
        additionalElements: extraElements,
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

              <div className="space-y-4 border p-3 rounded-xl bg-muted/30 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b">
                  <Label className="font-bold text-red-900 text-sm">Editor Avançado (Undo/Redo & Snap)</Label>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={handleUndo} className="h-7 text-xs px-2">↶ Desfazer</Button>
                    <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)} className={`h-7 text-xs px-2 ${showGrid ? 'bg-red-50 text-red-700' : ''}`}>Grid</Button>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <Label className="text-xs font-semibold">Salvar & Reutilizar Modelos</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Nome do modelo..." value={modelNameInput} onChange={(e) => setModelNameInput(e.target.value)} className="h-8 text-xs" />
                    <Button onClick={handleSaveAsTemplate} size="sm" className="bg-red-700 text-xs h-8">Salvar</Button>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {savedTemplates.map(t => (
                      <button key={t.id} onClick={() => handleLoadTemplate(t)} className="text-[10px] bg-white border border-red-200 text-red-800 px-2 py-1 rounded hover:bg-red-50 transition-colors">
                        📁 {t.name}
                      </button>
                    ))}
                  </div>
                </div>
                
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
                  <Label className="text-xs font-semibold">Adicionar elementos à prancheta</Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
                    <Input value={newElemText} onChange={(e) => setNewElemText(e.target.value)} className="h-8 text-xs" placeholder="Texto ou etiqueta..." />
                    <Button draggable onDragStart={(e) => handleNewElementDragStart(e, 'text')} onClick={() => handleAddElement('text')} size="sm" variant="outline" className="h-8 text-xs">Texto</Button>
                    <Button draggable onDragStart={(e) => handleNewElementDragStart(e, 'badge')} onClick={() => handleAddElement('badge')} size="sm" className="bg-red-700 text-xs h-8">Badge</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button draggable onDragStart={(e) => handleNewElementDragStart(e, 'line')} onClick={() => handleAddElement('line')} size="sm" variant="outline" className="h-8 text-xs">Linha</Button>
                    <label className="inline-flex h-8 cursor-pointer items-center rounded-md border border-border bg-background px-3 text-xs font-bold text-foreground hover:bg-muted">
                      Imagem / logo
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
                    </label>
                  </div>
                  <div className="space-y-1 pt-1 max-h-28 overflow-y-auto">
                    {extraElements.map(el => (
                      <div key={el.id} className="grid grid-cols-1 gap-1.5 rounded border bg-white p-1.5 text-[11px] sm:grid-cols-[auto_minmax(0,1fr)_64px_36px_72px_auto] sm:items-center">
                        <select
                          value={el.type}
                          onChange={(e) => handleUpdateElement(el.id, { type: e.target.value as CertificatePdfElement['type'] })}
                          className="h-7 max-w-[76px] rounded border border-border bg-white px-1 text-[10px]"
                          aria-label={`Tipo do elemento ${el.content}`}
                        >
                          <option value="text">Texto</option>
                          <option value="badge">Badge</option>
                          <option value="line">Linha</option>
                          <option value="image">Imagem</option>
                        </select>
                        <input
                          value={el.content}
                          disabled={el.type === 'image'}
                          onChange={(e) => handleUpdateElement(el.id, { content: e.target.value })}
                          className="min-w-0 flex-1 rounded border border-border px-1.5 py-1 text-[11px] disabled:bg-muted"
                          aria-label={`Conteúdo do elemento ${el.content}`}
                        />
                        <input
                          type="number"
                          min="7"
                          max="72"
                          value={el.size}
                          onChange={(e) => handleUpdateElement(el.id, { size: Number(e.target.value) || 12 })}
                          className="h-7 w-full rounded border border-border px-1 text-[10px]"
                          aria-label={`Tamanho de ${el.content}`}
                        />
                        <input
                          type="color"
                          value={el.color || '#333333'}
                          onChange={(e) => handleUpdateElement(el.id, { color: e.target.value })}
                          className="h-7 w-9 cursor-pointer rounded border border-border bg-white p-0.5"
                          aria-label={`Cor de ${el.content}`}
                        />
                        {el.type !== 'line' && (
                          <select
                            value={el.align || 'center'}
                            onChange={(e) => handleUpdateElement(el.id, { align: e.target.value as CertificatePdfElement['align'] })}
                            className="h-7 rounded border border-border bg-white px-1 text-[10px]"
                            aria-label={`Alinhamento de ${el.content}`}
                          >
                            <option value="left">Esq.</option>
                            <option value="center">Centro</option>
                            <option value="right">Dir.</option>
                          </select>
                        )}
                        <button onClick={() => handleRemoveElement(el.id)} className="shrink-0 px-1 font-bold text-red-600 hover:text-red-800" aria-label={`Remover ${el.content}`}>✕</button>
                        {el.type === 'image' && (
                          <input
                            value={el.src || ''}
                            onChange={(e) => handleUpdateElement(el.id, { src: e.target.value })}
                            placeholder="URL da imagem"
                            className="min-w-0 rounded border border-border px-1.5 py-1 text-[10px] sm:col-span-5"
                            aria-label={`URL da imagem ${el.content}`}
                          />
                        )}
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
              <div className="text-xs text-muted-foreground mb-2 flex items-center justify-between w-full max-w-[620px] px-1 font-mono">
                <span>Prancheta A4 Interativa (Clique nos textos ou use arrastar)</span>
                <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">Modo Canva Ativo</span>
              </div>
              <div ref={artboardRef} onDragOver={(e) => e.preventDefault()} onDrop={handleNewElementDrop} className="relative aspect-[1.414/1] w-full max-w-[620px] select-none overflow-hidden rounded-xl border-2 border-red-300 bg-white p-8 text-center shadow-xl">
                {showGrid && (
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:24px_24px] opacity-80 z-10" />
                )}
                
                {/* Logo / Imagem arrastável livremente */}
                <div className="absolute inset-0 pointer-events-none z-20">
                  {logoUrl && (
                    <div 
                      className="absolute pointer-events-auto cursor-move hover:ring-2 hover:ring-red-500 rounded p-1 transition-shadow bg-white/90 shadow-sm"
                      style={{ 
                        left: `${logoPosX}%`, 
                        top: `${logoPosY}%`, 
                        zIndex: logoLayer,
                        width: `${logoWidth}px` 
                      }}
                      draggable
                      onDragEnd={(e) => {
                        const rect = artboardRef.current?.getBoundingClientRect();
                        if (rect) {
                          const x = Math.max(5, Math.min(85, ((e.clientX - rect.left) / rect.width) * 100));
                          const y = Math.max(5, Math.min(40, ((e.clientY - rect.top) / rect.height) * 100));
                          setLogoPosX(Math.round(x));
                          setLogoPosY(Math.round(y));
                          toast.success(`Logo reposicionada para X: ${Math.round(x)}%, Y: ${Math.round(y)}%`);
                        }
                      }}
                    >
                      <img src={logoUrl} alt="Logo Customizada" className="w-full object-contain" />
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center relative z-20">
                  <h4 className="font-black text-red-700 tracking-wider text-xs uppercase bg-red-50/80 px-2 py-1 rounded border border-red-200">
                    {preset.organization}
                  </h4>
                  <div className="flex items-center gap-1">
                    {extraElements.map(el => (
                      el.type === 'image' && el.src ? (
                        <img
                          key={el.id}
                          src={el.src}
                          alt={el.content || 'Imagem inserida'}
                          className="absolute cursor-move rounded object-contain shadow hover:ring-2 hover:ring-red-500"
                          style={{ left: `${el.x}%`, top: `${el.y}%`, zIndex: 30, width: `${el.width || 140}px`, height: `${el.height || 90}px`, transform: 'translate(-50%, -50%)' }}
                          draggable
                          onDragEnd={(e) => handleElementDragEnd(el.id, e)}
                        />
                      ) : el.type === 'line' ? (
                        <span
                          key={el.id}
                          className="absolute h-0.5 cursor-move bg-slate-500 hover:ring-2 hover:ring-red-500"
                          style={{ left: `${el.x}%`, top: `${el.y}%`, zIndex: 30, width: '140px', transform: 'translate(-50%, -50%)', backgroundColor: el.color }}
                          draggable
                          onDragEnd={(e) => handleElementDragEnd(el.id, e)}
                          aria-label={el.content}
                        />
                      ) : (
                        <span
                          key={el.id}
                          className="absolute cursor-move rounded border border-amber-300 bg-amber-50 px-2 py-1 font-mono text-[10px] text-amber-900 shadow hover:bg-amber-100"
                          style={{ left: `${el.x}%`, top: `${el.y}%`, zIndex: 30, color: el.color, fontSize: `${el.size}px`, transform: 'translate(-50%, -50%)' }}
                          draggable
                          onDragEnd={(e) => handleElementDragEnd(el.id, e)}
                        >
                          {el.content}
                        </span>
                      )))}
                  </div>
                </div>

                <div className="space-y-4 relative z-20 bg-white/70 backdrop-blur-[1px] p-2 rounded-lg border border-transparent hover:border-red-200 transition-colors">
                  <input 
                    type="text" 
                    value={customTitle} 
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full text-center font-black text-xl text-foreground bg-transparent border-b border-dashed border-red-300 focus:outline-none focus:border-red-600 py-1"
                    title="Clique para editar o título em tempo real"
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed px-6 font-medium">
                    {preset.bodyTemplate(studentName, studentCpf, courseTitle, workload, period)}
                  </p>
                </div>

                <div className="space-y-2 relative z-20 bg-white/70 backdrop-blur-[1px] p-3 rounded-lg border border-transparent hover:border-red-200 transition-colors">
                  <input 
                    type="text" 
                    value={customDate} 
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full text-center text-xs font-semibold text-foreground bg-transparent border-b border-dashed border-red-300 focus:outline-none focus:border-red-600 py-0.5"
                  />
                  <div className="w-56 mx-auto border-b-2 border-muted-foreground/60 pb-1">
                    <input 
                      type="text" 
                      value={customSigner} 
                      onChange={(e) => setCustomSigner(e.target.value)}
                      className="w-full text-center text-xs font-bold text-foreground bg-transparent focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <input 
                    type="text" 
                    value={customRole} 
                    onChange={(e) => setCustomRole(e.target.value)}
                    className="w-full text-center text-[10px] text-muted-foreground bg-transparent focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
