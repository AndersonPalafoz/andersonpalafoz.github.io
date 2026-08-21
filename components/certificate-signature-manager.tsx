"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileSignature, Loader2, Upload, ShieldCheck } from "lucide-react";

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
        <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-amber-600" size={20} /><p>Envie somente o PDF final que já foi assinado. Para cursos livres, você pode registrar uma assinatura manual ou uma assinatura realizada pelo gov.br. O arquivo é armazenado em área privada e o aluno recebe apenas um link temporário autorizado.</p></div>
      </div>

      {certificates.length === 0 ? (
        <div className="surface-card p-10 text-center text-sm text-muted-foreground">Nenhum certificado emitido está disponível para assinatura.</div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {certificates.map((certificate) => (
            <article key={certificate.id} className="surface-card space-y-5 border border-border/70 p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0"><p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Certificado #{certificate.id}</p><h2 className="mt-1 truncate text-lg font-black text-foreground">{certificate.courseTitle}</h2><p className="text-sm text-muted-foreground">{certificate.studentName}{certificate.studentEmail ? ` · ${certificate.studentEmail}` : ""}</p></div>
                <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${certificate.hasSignedPdf ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200" : "bg-muted text-muted-foreground"}`}><FileSignature size={14} /> {signatureLabel(certificate.signatureType)}</span>
              </div>

              <dl className="grid grid-cols-2 gap-3 border-y border-border/60 py-4 text-xs"><div><dt className="text-muted-foreground">Aluno</dt><dd className="mt-1 font-bold text-foreground">{certificate.studentName}</dd></div><div><dt className="text-muted-foreground">Nível</dt><dd className="mt-1 font-bold text-foreground">{certificate.level}</dd></div><div><dt className="text-muted-foreground">Código</dt><dd className="mt-1 break-all font-bold text-foreground">{certificate.certificateCode || "Não registrado"}</dd></div><div><dt className="text-muted-foreground">Emissão</dt><dd className="mt-1 font-bold text-foreground">{new Date(certificate.issuedAt).toLocaleDateString("pt-BR")}</dd></div></dl>

              <form onSubmit={handleUpload} className="space-y-3" encType="multipart/form-data">
                <input type="hidden" name="certificateId" value={certificate.id} />
                <label className="block text-sm font-bold text-foreground">Tipo de assinatura<select name="signatureType" defaultValue={certificate.signatureType === "none" ? "manual" : certificate.signatureType} className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-normal text-foreground outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20"><option value="manual">Assinatura manual</option><option value="govbr">Assinatura via gov.br</option></select></label>
                <label className="block text-sm font-bold text-foreground">PDF assinado<input name="file" type="file" accept="application/pdf,.pdf" required className="mt-2 block w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white" /></label>
                <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer pt-1">
                  <input type="checkbox" name="sendEmail" value="true" defaultChecked className="rounded border-border text-red-600 focus:ring-red-600" />
                  Enviar certificado por e-mail ao aluno automaticamente após upload
                </label>
                <button type="submit" disabled={uploadingId === certificate.id} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">{uploadingId === certificate.id ? <><Loader2 className="animate-spin" size={17} /> Enviando PDF e e-mail...</> : <><Upload size={17} /> {certificate.hasSignedPdf ? "Substituir e Notificar Aluno" : "Enviar e Notificar Aluno"}</>}</button>
              </form>

              {certificate.signedAt && <p className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle2 size={14} className="text-emerald-600" /> Última assinatura registrada em {new Date(certificate.signedAt).toLocaleString("pt-BR")}.</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
