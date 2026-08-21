"use client";

import { useEffect, useState, useMemo } from "react";
import { CheckCircle2, FileSignature, Loader2, Upload, ShieldCheck, Filter, Download, Eye, Calendar, Sparkles, X } from "lucide-react";

type SignatureType = "none" | "manual" | "govbr";

type CertificateItem = {
  id: number;
  studentName: string;
  studentEmail: string | null;
  courseTitle: string;
  level: string;
  certificateCode: string | null;
  issuedAt: string;
  signatureType: SignatureType;
  signedAt: string | null;
  hasSignedPdf: boolean;
  certificateUrl?: string;
  signedPdfUrl?: string;
};

function signatureLabel(type: SignatureType) {
  if (type === "govbr") return "Assinado via gov.br";
  if (type === "manual") return "Assinado manualmente";
  return "Aguardando assinatura";
}

export function CertificateSignatureManager() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters & Batch download states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  // Preview modal state
  const [previewCert, setPreviewCert] = useState<CertificateItem | null>(null);

  async function loadCertificates() {
    setLoading(true);
    setLoadingError(null);
    try {
      const response = await fetch("/api/admin/certificates", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível carregar os certificados.");
      setCertificates(payload.certificates || []);
    } catch (error) {
      setLoadingError(error instanceof Error ? error.message : "Não foi possível carregar os certificados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCertificates();
  }, []);

  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const matchesSearch =
        cert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cert.studentEmail && cert.studentEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
        cert.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cert.certificateCode && cert.certificateCode.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesStatus = true;
      if (statusFilter === "signed") matchesStatus = cert.hasSignedPdf;
      else if (statusFilter === "unsigned") matchesStatus = !cert.hasSignedPdf;
      else if (statusFilter !== "all") matchesStatus = cert.signatureType === statusFilter;

      let matchesDate = true;
      const certDate = new Date(cert.issuedAt).getTime();
      if (startDateFilter) {
        const start = new Date(startDateFilter).getTime();
        if (certDate < start) matchesDate = false;
      }
      if (endDateFilter) {
        const end = new Date(endDateFilter).getTime() + 86400000; // end of day
        if (certDate > end) matchesDate = false;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [certificates, searchQuery, statusFilter, startDateFilter, endDateFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCertificates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCertificates.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  async function handleBatchDownload() {
    if (selectedIds.length === 0) return;
    setBatchLoading(true);
    setBatchProgress(10);
    setMessage(null);

    try {
      const timer = setInterval(() => {
        setBatchProgress((p) => (p < 85 ? p + 25 : p));
      }, 300);

      const response = await fetch("/api/user/certificates/batch-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateIds: selectedIds }),
      });

      clearInterval(timer);
      setBatchProgress(100);

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Falha ao gerar lote de certificados.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificados-admin-lote-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setMessage({ type: "success", text: `Download em lote de ${selectedIds.length} certificados concluído com sucesso!` });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao baixar lote." });
    } finally {
      setBatchLoading(false);
      setTimeout(() => setBatchProgress(0), 1000);
    }
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const certificateId = Number(formData.get("certificateId"));
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setMessage({ type: "error", text: "Selecione o PDF final assinado antes de enviar." });
      return;
    }

    setUploadingId(certificateId);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/certificates", { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível salvar o certificado assinado.");
      setMessage({ type: "success", text: payload.message || "Certificado assinado salvo com sucesso." });
      form.reset();
      await loadCertificates();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Não foi possível salvar o certificado assinado." });
    } finally {
      setUploadingId(null);
    }
  }

  if (loading) {
    return <div className="surface-card flex items-center justify-center gap-3 p-10 text-sm text-muted-foreground"><Loader2 className="animate-spin text-red-600" size={20} /> Carregando certificados emitidos...</div>;
  }

  if (loadingError) {
    return <div role="alert" className="surface-card space-y-4 border border-red-500/30 bg-red-500/5 p-6 text-sm text-red-700 dark:text-red-200"><p>{loadingError}</p><button type="button" onClick={() => void loadCertificates()} className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700">Tentar novamente</button></div>;
  }

  return (
    <div className="space-y-6">
      {message && <div role="status" aria-live="polite" className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${message.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200" : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200"}`}>{message.text}</div>}

      <div className="surface-card border border-amber-500/30 bg-amber-500/5 p-5 text-sm text-foreground">
        <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-amber-600" size={20} /><p>Envie somente o PDF final que já foi assinado. Para cursos livres, você pode registrar uma assinatura manual ou uma assinatura realizada pelo gov.br. Utilize os filtros abaixo por data e status para organizar a emissão e selecione itens para download em lote.</p></div>
      </div>

      {/* Filter and Batch Bar */}
      <div className="surface-card grid gap-4 border border-border/70 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Pesquisar Aluno/Curso</label>
          <input
            type="text"
            placeholder="Nome, e-mail ou código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-red-600"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Status de Assinatura</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-red-600"
          >
            <option value="all">Todos os status</option>
            <option value="signed">Com PDF assinado</option>
            <option value="unsigned">Aguardando assinatura</option>
            <option value="govbr">Assinado via gov.br</option>
            <option value="manual">Assinado manualmente</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Data Inicial</label>
          <input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-red-600"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Data Final</label>
          <input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-red-600"
          />
        </div>
      </div>

      {/* Batch Actions Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between surface-card p-4 border border-border/70">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={filteredCertificates.length > 0 && selectedIds.length === filteredCertificates.length}
            onChange={toggleSelectAll}
            className="rounded border-border text-red-600 focus:ring-red-600 w-4 h-4 cursor-pointer"
          />
          <span className="text-sm font-bold text-foreground">
            {selectedIds.length} de {filteredCertificates.length} certificados selecionados (Total: {certificates.length})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBatchDownload}
            disabled={selectedIds.length === 0 || batchLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
          >
            {batchLoading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            Baixar Lote Selecionado ({selectedIds.length})
          </button>
        </div>
      </div>

      {/* Batch Progress Bar */}
      {batchLoading && (
        <div className="surface-card space-y-2 border border-red-500/30 bg-red-500/5 p-4">
          <div className="flex justify-between text-xs font-bold text-foreground">
            <span>Gerando arquivo ZIP em lote...</span>
            <span>{batchProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${batchProgress}%` }} />
          </div>
        </div>
      )}

      {filteredCertificates.length === 0 ? (
        <div className="surface-card p-10 text-center text-sm text-muted-foreground">Nenhum certificado corresponde aos filtros aplicados.</div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredCertificates.map((certificate) => {
            const isSelected = selectedIds.includes(certificate.id);
            return (
              <article key={certificate.id} className={`surface-card space-y-5 border p-5 sm:p-6 transition ${isSelected ? "border-red-600/60 bg-red-500/[0.02]" : "border-border/70"}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(certificate.id)}
                      className="mt-1 rounded border-border text-red-600 focus:ring-red-600 w-4 h-4 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Certificado #{certificate.id}</p>
                      <h2 className="mt-1 truncate text-lg font-black text-foreground">{certificate.courseTitle}</h2>
                      <p className="text-sm text-muted-foreground">{certificate.studentName}{certificate.studentEmail ? ` · ${certificate.studentEmail}` : ""}</p>
                    </div>
                  </div>
                  <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${certificate.hasSignedPdf ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200" : "bg-muted text-muted-foreground"}`}><FileSignature size={14} /> {signatureLabel(certificate.signatureType)}</span>
                </div>

                <dl className="grid grid-cols-2 gap-3 border-y border-border/60 py-4 text-xs"><div><dt className="text-muted-foreground">Aluno</dt><dd className="mt-1 font-bold text-foreground">{certificate.studentName}</dd></div><div><dt className="text-muted-foreground">Nível</dt><dd className="mt-1 font-bold text-foreground">{certificate.level}</dd></div><div><dt className="text-muted-foreground">Código</dt><dd className="mt-1 break-all font-bold text-foreground">{certificate.certificateCode || "Não registrado"}</dd></div><div><dt className="text-muted-foreground">Emissão</dt><dd className="mt-1 font-bold text-foreground">{new Date(certificate.issuedAt).toLocaleDateString("pt-BR")}</dd></div></dl>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPreviewCert(certificate)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
                  >
                    <Eye size={16} className="text-red-600" /> Pré-visualizar certificado
                  </button>
                  {certificate.certificateUrl && (
                    <a
                      href={certificate.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
                    >
                      <Download size={16} className="text-red-600" /> Baixar PDF
                    </a>
                  )}
                </div>

                <form onSubmit={handleUpload} className="space-y-3 pt-2 border-t border-border/60" encType="multipart/form-data">
                  <input type="hidden" name="certificateId" value={certificate.id} />
                  <label className="block text-sm font-bold text-foreground">Tipo de assinatura<select name="signatureType" defaultValue={certificate.signatureType === "none" ? "manual" : certificate.signatureType} className="mt-1.5 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal text-foreground outline-none focus:border-red-600"><option value="manual">Assinatura manual</option><option value="govbr">Assinatura via gov.br</option></select></label>
                  <label className="block text-sm font-bold text-foreground">PDF assinado<input name="file" type="file" accept="application/pdf,.pdf" required className="mt-1.5 block w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white" /></label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer pt-1">
                    <input type="checkbox" name="sendEmail" value="true" defaultChecked className="rounded border-border text-red-600 focus:ring-red-600" />
                    Enviar certificado por e-mail ao aluno automaticamente após upload
                  </label>
                  <button type="submit" disabled={uploadingId === certificate.id} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">{uploadingId === certificate.id ? <><Loader2 className="animate-spin" size={17} /> Enviando PDF e e-mail...</> : <><Upload size={17} /> {certificate.hasSignedPdf ? "Substituir e Notificar Aluno" : "Enviar e Notificar Aluno"}</>}</button>
                </form>

                {certificate.signedAt && <p className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle2 size={14} className="text-emerald-600" /> Última assinatura registrada em {new Date(certificate.signedAt).toLocaleString("pt-BR")}.</p>}
              </article>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="surface-card w-full max-w-2xl space-y-6 border border-border bg-background p-6 shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-500/10 p-2.5 text-red-600"><Sparkles size={22} /></div>
                <div>
                  <h3 className="text-lg font-black text-foreground">Pré-visualização do Certificado</h3>
                  <p className="text-xs text-muted-foreground">ID #{previewCert.id} · {previewCert.courseTitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCert(null)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-600/10 flex items-center justify-center text-red-600 mb-2">
                <FileSignature size={32} />
              </div>
              <h4 className="text-xl font-black text-foreground">Anderson Palafoz — English Platform</h4>
              <p className="text-xs font-semibold uppercase tracking-widest text-red-600">Certificado de Conclusão de Curso</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto pt-2">
                Certificamos que <strong className="text-foreground">{previewCert.studentName}</strong> concluiu com êxito o curso <strong className="text-foreground">{previewCert.courseTitle}</strong>, nível <strong className="text-foreground">{previewCert.level}</strong>, com carga horária oficial de 40 horas.
              </p>
              <div className="pt-4 border-t border-border/60 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
                <span>Código de Verificação: <strong className="text-foreground font-mono">{previewCert.certificateCode || "N/A"}</strong></span>
                <span>Data de Emissão: <strong className="text-foreground">{new Date(previewCert.issuedAt).toLocaleDateString("pt-BR")}</strong></span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewCert(null)}
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-bold text-foreground hover:bg-muted"
              >
                Fechar
              </button>
              {previewCert.certificateUrl && (
                <a
                  href={previewCert.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700"
                >
                  <Download size={16} /> Baixar PDF Original
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
