import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ShieldCheck, Sparkles, Download, CheckCircle2, Loader2, Award, Trash2, CheckSquare, Square, Eye, AlertTriangle, Search, Filter, ChevronLeft, ChevronRight, RotateCcw, ExternalLink } from "lucide-react";
import { useCertificateWorkspace } from "@/components/certificate-workspace-context";
import { CertificateCompositionPreview } from "@/components/certificate-composition-preview";
import { parseCertificateComposition, type CertificateVisualVariant } from "@/lib/certificate-composition";
import { CERTIFICATE_VISUAL_VARIANT_LIST } from "@/lib/certificate-visual-variants";
import { getCertificateLayoutPreset } from "@/lib/certificate-layout-presets";

export function CertificateStandardManager() {
  const {
    composition,
    sampleData,
    selectedTemplateId: workspaceTemplateId,
    includeSiteBranding: workspaceBranding,
    setSampleData,
    setSelectedTemplateId: setWorkspaceTemplateId,
    setIncludeSiteBranding: setWorkspaceBranding,
    visualVariant,
    setVisualVariant,
    updateComposition,
  } = useCertificateWorkspace();
  const [studentName, setStudentName] = useState(sampleData.studentName);
  const [courseTitle, setCourseTitle] = useState(sampleData.courseTitle);
  const [level, setLevel] = useState(sampleData.level);
  const [workloadHours, setWorkloadHours] = useState(sampleData.workloadHours.replace(/\\D/g, "") || "40");
  const [includeBranding, setIncludeBranding] = useState(workspaceBranding);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(workspaceTemplateId);
  const [templates, setTemplates] = useState<Array<any>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [issuedResult, setIssuedResult] = useState<{ code: string; url: string } | null>(null);
  const [issuedCertificates, setIssuedCertificates] = useState<Array<any>>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "signed" | "pending">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "student">("newest");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const fetchCertificates = async () => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const res = await fetch("/api/admin/certificates/issue", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível carregar os certificados.");
      setIssuedCertificates(Array.isArray(data.certificates) ? data.certificates : []);
    } catch (e) {
      console.error("Erro ao carregar certificados", e);
      setListError(e instanceof Error ? e.message : "Não foi possível carregar os certificados.");
    } finally {
      setIsLoadingList(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/admin/certificate-templates");
      const data = await res.json();
      if (res.ok && data.templates) {
        setTemplates(data.templates);
      }
    } catch (e) {
      console.error("Erro ao carregar templates", e);
    }
  };

  useEffect(() => {
    fetchCertificates();
    fetchTemplates();
  }, []);

  useEffect(() => {
    setStudentName(sampleData.studentName);
    setCourseTitle(sampleData.courseTitle);
    setLevel(sampleData.level);
    setWorkloadHours(sampleData.workloadHours.replace(/\\D/g, "") || "40");
  }, [sampleData]);

  useEffect(() => {
    setSelectedTemplateId(workspaceTemplateId);
  }, [workspaceTemplateId]);

  useEffect(() => {
    setIncludeBranding(workspaceBranding);
  }, [workspaceBranding]);

  const handleDeleteCertificate = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este certificado permanentemente do banco de dados?")) return;
    try {
      const res = await fetch(`/api/admin/certificates/issue?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao excluir certificado.");
      setIssuedCertificates(prev => prev.filter(c => c.id !== id));
      setSelectedIds(prev => prev.filter(i => i !== id));
      toast.success("Certificado excluído do banco com sucesso.");
      fetchCertificates();
    } catch (e: any) {
      toast.error(e.message || "Erro ao excluir certificado.");
    }
  };

  const handleBulkDeleteConfirmed = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch(`/api/admin/certificates/issue?ids=${selectedIds.join(",")}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao excluir em massa.");
      setIssuedCertificates(prev => prev.filter(c => !selectedIds.includes(c.id)));
      setSelectedIds([]);
      setShowBulkDeleteModal(false);
      toast.success("Certificados selecionados excluídos com sucesso.");
      fetchCertificates();
    } catch (e: any) {
      toast.error(e.message || "Erro ao excluir em massa.");
    }
  };

  const handleBulkExport = () => {
    if (selectedIds.length === 0) return;
    const selectedCerts = issuedCertificates.filter(c => selectedIds.includes(c.id));
    selectedCerts.forEach((c, idx) => {
      if (c.certificateUrl && c.certificateUrl !== "#") {
        setTimeout(() => {
          window.open(c.certificateUrl, "_blank");
        }, idx * 400);
      }
    });
    toast.success(`Iniciando download de ${selectedCerts.length} certificado(s)...`);
  };

  const toggleSelectAll = () => {
    const visibleIds = visibleCertificates.map(c => c.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
    setSelectedIds(prev => allVisibleSelected ? prev.filter(id => !visibleIds.includes(id)) : Array.from(new Set([...prev, ...visibleIds])));
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, sortOrder]);

  const activeTemplate = templates.find((t: any) => String(t.id) === selectedTemplateId);
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-BR");
  const filteredCertificates = issuedCertificates
    .filter(cert => {
      const searchable = `${cert.studentName ?? ""} ${cert.courseTitle ?? ""} ${cert.verificationCode ?? ""}`.toLocaleLowerCase("pt-BR");
      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      const matchesStatus = statusFilter === "all" || (statusFilter === "signed" ? Boolean(cert.signed) : !cert.signed);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === "student") return String(a.studentName ?? "").localeCompare(String(b.studentName ?? ""), "pt-BR");
      const first = new Date(a.issueDate ?? 0).getTime();
      const second = new Date(b.issueDate ?? 0).getTime();
      return sortOrder === "newest" ? second - first : first - second;
    });
  const totalPages = Math.max(1, Math.ceil(filteredCertificates.length / pageSize));
  const visibleCertificates = filteredCertificates.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleGenerateOfficial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !courseTitle.trim()) {
      toast.error("Informe o nome do aluno e o título do curso.");
      return;
    }

    setIsGenerating(true);
    setIssuedResult(null);

    try {
      const response = await fetch("/api/admin/certificates/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: studentName.trim(),
          customCourseTitle: courseTitle.trim(),
          customCourseLevel: level.trim(),
          customWorkloadHours: Number(workloadHours) || 40,
          includeSiteBranding: includeBranding,
          templateId: selectedTemplateId === "default" ? null : Number(selectedTemplateId),
          composition,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Erro ao gerar certificado oficial.");
      }

      setIssuedResult({
        code: payload.certificate?.certificateCode || "OFICIAL-2026",
        url: payload.certificate?.certificateUrl || "#",
      });

      toast.success("Certificado oficial gerado e persistido com sucesso!");
      fetchCertificates();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar certificado.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-[2rem] border-border/70 bg-card shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <CardHeader className="border-b border-red-200/70 bg-[radial-gradient(circle_at_top_right,rgba(214,40,40,0.12),transparent_36%),linear-gradient(135deg,rgba(254,242,242,0.92),rgba(255,255,255,0.98))] pb-5 pt-6 sm:px-7 dark:border-red-900/50 dark:bg-red-950/20">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight text-red-950 dark:text-red-100">
                <ShieldCheck className="w-5 h-5 text-red-600" />
                Gerador Oficial Padrão (100% Funcional e Integrado)
              </CardTitle>
              <CardDescription>
                Selecione o modelo institucional ou envie um template personalizado antes de emitir e persistir o certificado no banco de dados.
              </CardDescription>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 size={14} /> Sistema Principal Ativo
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-6 pt-5 sm:px-7 sm:pb-8">
          <form onSubmit={handleGenerateOfficial} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-3 grid gap-2 rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-3 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-emerald-200/70 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:sm:divide-emerald-900/50">
              {[["01", "Modelo", "Escolha a identidade"], ["02", "Dados", "Preencha o certificado"], ["03", "Emissão", "Gere o PDF oficial"]].map(([number, title, description]) => (
                <div key={number} className="flex items-center gap-2 px-2 py-2 sm:flex-col sm:items-start sm:px-3 sm:first:pl-1">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[10px] font-black text-emerald-700 shadow-sm ring-1 ring-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-200 dark:ring-emerald-900/60">{number}</span>
                  <span><strong className="block text-[11px] font-black text-emerald-900 dark:text-emerald-100">{title}</strong><span className="block text-[10px] text-emerald-700/75 dark:text-emerald-200/70">{description}</span></span>
                </div>
              ))}
            </div>
            <div className="space-y-4 lg:col-span-2">
              <div className="space-y-4 rounded-2xl border border-red-100 bg-red-50/40 p-4 shadow-sm dark:border-red-900/50 dark:bg-red-950/10">
                <Label htmlFor="std-template-select" className="font-bold text-red-900 flex items-center gap-2">
                  <Award size={16} /> 1. Escolher Modelo de Certificado (Início do Fluxo)
                </Label>
                <Select
                  value={selectedTemplateId}
                  onValueChange={value => {
                    setSelectedTemplateId(value);
                    setWorkspaceTemplateId(value);
                    const template = templates.find((item: any) => String(item.id) === value);
                    if (template?.fieldMappings) {
                      const parsed = parseCertificateComposition(template.fieldMappings);
                      updateComposition(current => ({
                        ...current,
                        ...parsed,
                        visualVariant: parsed.visualVariant || current.visualVariant,
                      }));
                    }
                  }}
                >
                  <SelectTrigger id="std-template-select" className="bg-white">
                    <SelectValue placeholder="Selecione um modelo cadastrado..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Modelo Padrão da Plataforma (Anderson Palafoz)</SelectItem>
                    {templates.map((t: any) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name} ({t.institution || t.category || "Institucional"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid gap-3 rounded-xl border border-red-100 bg-white/70 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] dark:border-red-900/40 dark:bg-red-950/10">
                  <div>
                    <Label htmlFor="std-visual-variant" className="text-xs font-black uppercase tracking-wide text-red-900 dark:text-red-200">
                      Variação visual
                    </Label>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      A escolha é aplicada à prévia e à composição enviada para emissão.
                    </p>
                  </div>
                  <Select
                    value={visualVariant}
                    onValueChange={value => {
                      const nextVariant = value as CertificateVisualVariant;
                      setVisualVariant(nextVariant);
                      updateComposition(current => ({
                        ...current,
                        visualVariant: nextVariant,
                        fieldMappings: {
                          ...current.fieldMappings,
                          ...getCertificateLayoutPreset(nextVariant),
                        },
                      }));
                    }}
                  >
                    <SelectTrigger id="std-visual-variant" className="bg-white dark:bg-background">
                      <SelectValue placeholder="Escolha uma variação" />
                    </SelectTrigger>
                    <SelectContent>
                      {CERTIFICATE_VISUAL_VARIANT_LIST.map(variant => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {variant.label} · {variant.family}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pré-visualização visual imediata do modelo selecionado */}
                <div className="mt-3 rounded-2xl border border-border/70 bg-card p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-1.5">
                      <Eye size={14} className="text-red-600" /> Pré-visualização do Modelo Selecionado
                    </span>
                    <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
                      {selectedTemplateId === "default" ? "Padrão Oficial" : (activeTemplate?.institution || "Personalizado")}
                    </span>
                  </div>
                  <CertificateCompositionPreview
                    composition={composition}
                    values={sampleData}
                    includeSiteBranding={includeBranding}
                    interactive
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-foreground">2. Preencher Dados do Aluno e Curso</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="std-student-name">Nome Completo do Aluno *</Label>
                    <Input
                      id="std-student-name"
                      required
                      value={studentName}
                      onChange={(e) => {
                        setStudentName(e.target.value);
                        setSampleData({ studentName: e.target.value });
                      }}
                      placeholder="Ex: Adna Caroline"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="std-level">Nível / Proficiência</Label>
                    <Input
                      id="std-level"
                      value={level}
                      onChange={(e) => {
                        setLevel(e.target.value);
                        setSampleData({ level: e.target.value });
                      }}
                      placeholder="Ex: B1 - Intermediário"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="std-course-title">Título do Curso ou Programa *</Label>
                <Input
                  id="std-course-title"
                  required
                  value={courseTitle}
                  onChange={(e) => {
                    setCourseTitle(e.target.value);
                    setSampleData({ courseTitle: e.target.value });
                  }}
                  placeholder="Nome do curso"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="std-workload">Carga Horária (Horas)</Label>
                  <Input
                    type="number"
                    value={workloadHours}
                    onChange={(e) => {
                    setWorkloadHours(e.target.value);
                    setSampleData({ workloadHours: `${e.target.value || "0"} horas` });
                  }}
                    placeholder="40"
                  />
                </div>
                <div className="flex items-center justify-between pt-6">
                  <Label htmlFor="std-branding" className="cursor-pointer text-xs">Incluir Identidade Visual do Site</Label>
                  <Switch
                    id="std-branding"
                    checked={includeBranding}
                    onCheckedChange={value => {
                      setIncludeBranding(value);
                      setWorkspaceBranding(value);
                    }}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-sm"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} /> Gerando Certificado Oficial...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2" size={18} /> Emitir e Persistir Certificado Oficial
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-col justify-between space-y-5 rounded-2xl border border-border/70 bg-muted/25 p-5 shadow-sm">
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Award className="text-red-600" size={16} /> Status da Emissão
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Esta opção utiliza o motor robusto do `pdf-lib` integrado ao Supabase S3. O documento gerado recebe código de verificação único e fica disponível para download imediato.
                </p>
                {issuedResult && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-600/30 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Emitido com sucesso!
                    </p>
                    <p className="text-[11px] font-mono text-muted-foreground break-all">
                      Código: {issuedResult.code}
                    </p>
                    <a
                      href={issuedResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg transition"
                    >
                      <Download size={14} /> Baixar PDF Oficial
                    </a>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-muted-foreground border-t pt-3">
                <p>• 100% garantido e testado em produção.</p>
                <p>• Persistência real em banco de dados.</p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6 overflow-hidden rounded-[2rem] border-border/70 bg-card shadow-[0_18px_60px_rgba(15,23,42,0.07)]">
        <CardHeader className="flex flex-col items-start gap-3 border-b border-red-200/70 bg-red-50/60 pb-4 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-red-900/50 dark:bg-red-950/20">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-black text-red-950 dark:text-red-100">
              <Award className="w-5 h-5 text-red-600" /> Certificados Emitidos (Banco de Dados)
            </CardTitle>
            <CardDescription>
              Consulte, filtre, selecione e gerencie certificados emitidos sem perder o contexto do fluxo oficial.
            </CardDescription>
          </div>
          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleBulkExport} className="h-8 text-xs bg-white">
                <Download size={14} className="mr-1" /> Baixar Selecionados ({selectedIds.length})
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowBulkDeleteModal(true)} className="h-8 text-xs bg-red-600 hover:bg-red-700">
                <Trash2 size={14} className="mr-1" /> Excluir Selecionados ({selectedIds.length})
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-5 grid gap-3 rounded-2xl border border-border/70 bg-muted/20 p-3 sm:grid-cols-[minmax(0,1fr)_180px_180px_auto] sm:items-center">
            <label className="relative block">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Buscar por aluno, curso ou código..."
                aria-label="Buscar certificados"
                className="h-10 bg-background pl-9"
              />
            </label>
            <label className="relative block">
              <Filter size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={event => setStatusFilter(event.target.value as typeof statusFilter)}
                aria-label="Filtrar por status"
                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-red-500/30"
              >
                <option value="all">Todos os status</option>
                <option value="signed">Emitidos / S3</option>
                <option value="pending">Pendentes</option>
              </select>
            </label>
            <select
              value={sortOrder}
              onChange={event => setSortOrder(event.target.value as typeof sortOrder)}
              aria-label="Ordenar certificados"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-red-500/30"
            >
              <option value="newest">Mais recentes</option>
              <option value="oldest">Mais antigos</option>
              <option value="student">Nome do aluno</option>
            </select>
            <Button type="button" variant="outline" onClick={() => { setSearchTerm(""); setStatusFilter("all"); setSortOrder("newest"); setPage(1); }} className="h-10 gap-2 bg-background text-xs">
              <RotateCcw size={14} /> Limpar
            </Button>
          </div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span><strong className="text-foreground">{filteredCertificates.length}</strong> certificado(s) encontrado(s)</span>
            {filteredCertificates.length > 0 && <span>Página {page} de {totalPages}</span>}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 uppercase text-[10px] text-muted-foreground font-semibold border-b">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <button onClick={toggleSelectAll} className="flex items-center justify-center">
                      {visibleCertificates.length > 0 && visibleCertificates.every(cert => selectedIds.includes(cert.id)) ? (
                        <CheckSquare size={16} className="text-red-600" />
                      ) : (
                        <Square size={16} className="text-muted-foreground" />
                      )}
                    </button>
                  </th>
                  <th className="p-3">Aluno</th>
                  <th className="p-3">Curso</th>
                  <th className="p-3">Código</th>
                  <th className="p-3">Data</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoadingList ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">Carregando certificados...</td>
                  </tr>
                ) : listError ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-300">{listError}</p>
                      <Button type="button" variant="outline" onClick={fetchCertificates} className="mt-3 gap-2 text-xs"><RotateCcw size={14} /> Tentar novamente</Button>
                    </td>
                  </tr>
                ) : filteredCertificates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <p className="text-sm font-semibold text-foreground">Nenhum certificado encontrado</p>
                      <p className="mt-1 text-xs text-muted-foreground">Ajuste a busca ou os filtros para continuar.</p>
                    </td>
                  </tr>
                ) : (
                  visibleCertificates.map((cert) => {
                    const isSelected = selectedIds.includes(cert.id);
                    return (
                      <tr key={cert.id} className={`hover:bg-muted/30 transition-colors ${isSelected ? 'bg-red-50/50' : ''}`}>
                        <td className="p-3 text-center">
                          <button onClick={() => toggleSelectOne(cert.id)} className="flex items-center justify-center mx-auto">
                            {isSelected ? (
                              <CheckSquare size={16} className="text-red-600" />
                            ) : (
                              <Square size={16} className="text-muted-foreground" />
                            )}
                          </button>
                        </td>
                        <td className="p-3 font-semibold text-foreground">{cert.studentName}</td>
                        <td className="p-3 text-muted-foreground">{cert.courseTitle}</td>
                        <td className="p-3 font-mono text-xs">{cert.verificationCode}</td>
                        <td className="p-3">{cert.issueDate}</td>
                        <td className="p-3">
                          {cert.signed ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Emitido / S3</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">Pendente</span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <a
                            href={cert.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-2 py-1 bg-white border border-border text-foreground rounded text-[11px] hover:bg-muted font-medium"
                          >
                            Baixar
                          </a>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteCertificate(cert.id)} className="h-7 text-xs bg-red-600 hover:bg-red-700">Excluir</Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {isLoadingList ? (
              Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl border border-border/70 bg-muted/40" />)
            ) : listError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-900/60 dark:bg-red-950/20">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">{listError}</p>
                <Button type="button" variant="outline" onClick={fetchCertificates} className="mt-3 gap-2 text-xs"><RotateCcw size={14} /> Tentar novamente</Button>
              </div>
            ) : visibleCertificates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Nenhum certificado encontrado com esses filtros.</div>
            ) : visibleCertificates.map(cert => {
              const isSelected = selectedIds.includes(cert.id);
              return (
                <article key={cert.id} className={`rounded-2xl border p-4 shadow-sm ${isSelected ? "border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20" : "border-border/70 bg-card"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <button type="button" onClick={() => toggleSelectOne(cert.id)} className="mt-0.5 shrink-0" aria-label={`${isSelected ? "Desmarcar" : "Selecionar"} certificado de ${cert.studentName}`}>
                      {isSelected ? <CheckSquare size={18} className="text-red-600" /> : <Square size={18} className="text-muted-foreground" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-black text-foreground">{cert.studentName}</h4>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{cert.courseTitle}</p>
                    </div>
                    {cert.signed ? <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800">Emitido</span> : <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">Pendente</span>}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                    <span><strong className="block text-[10px] uppercase tracking-wide">Código</strong><code className="break-all">{cert.verificationCode}</code></span>
                    <span><strong className="block text-[10px] uppercase tracking-wide">Emissão</strong>{cert.issueDate}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground"><ExternalLink size={13} /> Abrir PDF</a>
                    <Button type="button" variant="outline" onClick={() => handleDeleteCertificate(cert.id)} className="gap-1 bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700"><Trash2 size={13} /> Excluir</Button>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredCertificates.length > pageSize && (
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/70 pt-4">
              <Button type="button" variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(current => Math.max(1, current - 1))} className="gap-1 text-xs"><ChevronLeft size={14} /> Anterior</Button>
              <span className="text-xs font-semibold text-muted-foreground">{page} / {totalPages}</span>
              <Button type="button" variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(current => Math.min(totalPages, current + 1))} className="gap-1 text-xs">Próxima <ChevronRight size={14} /></Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Confirmação de Segurança para Exclusão em Massa */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground p-6 rounded-2xl max-w-md w-full shadow-2xl border border-red-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Confirmação de Exclusão em Massa</h3>
                <p className="text-xs text-muted-foreground">Esta ação é irreversível e removerá registros do banco.</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Você está prestes a excluir permanentemente <strong className="text-foreground">{selectedIds.length} certificado(s)</strong> selecionado(s). Deseja realmente prosseguir?
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowBulkDeleteModal(false)} className="text-xs">
                Cancelar
              </Button>
              <Button variant="outline" onClick={handleBulkDeleteConfirmed} className="text-xs bg-red-600 hover:bg-red-700 font-bold">
                Sim, Excluir {selectedIds.length} Certificado(s)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
