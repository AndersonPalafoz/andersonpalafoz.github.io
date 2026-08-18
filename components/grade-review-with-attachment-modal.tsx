"use client";

import { useState } from "react";
import { HelpCircle, Loader2, Send, Paperclip, UploadCloud } from "lucide-react";
import { toast } from "sonner";

interface GradeReviewModalProps {
  gradeId: number;
  assessmentTitle: string;
  currentScore: string;
}

export function GradeReviewWithAttachmentModal({ gradeId, assessmentTitle, currentScore }: GradeReviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro no upload do arquivo");

      setAttachmentUrl(data.url);
      toast.success("Arquivo de evidência anexado com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao enviar arquivo.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Por favor, digite a justificativa para a revisão.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/grades/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gradeId, reason, attachmentUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao solicitar revisão");
      toast.success("Solicitação de revisão enviada com sucesso!");
      setReason("");
      setAttachmentUrl("");
      setIsOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao enviar solicitação.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-3 py-1.5 text-xs font-bold text-red-700 dark:text-red-300 transition hover:bg-red-100"
      >
        <HelpCircle size={14} /> Solicitar Revisão (c/ Evidência)
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Solicitar Revisão com Evidência</h3>
              <p className="text-xs text-gray-500 mt-1">
                Avaliação: <span className="font-bold text-gray-800 dark:text-gray-200">{assessmentTitle}</span> (Nota atual: {currentScore})
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Justificativa / Motivo da Revisão
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explique o motivo da revisão..."
                  className="w-full rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-red-500 resize-y"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Anexar Arquivo ou Imagem de Evidência (Opcional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-3 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                    {uploading ? (
                      <Loader2 size={16} className="animate-spin text-red-600" />
                    ) : attachmentUrl ? (
                      <>
                        <Paperclip size={16} className="text-emerald-600" />
                        <span className="font-bold text-emerald-600 truncate max-w-[200px]">Evidência anexada</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={16} className="text-red-600" />
                        <span>Selecionar arquivo ou imagem</span>
                      </>
                    )}
                    <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*,.pdf,.doc,.docx" />
                  </label>
                </div>
                {attachmentUrl && (
                  <p className="text-[10px] text-emerald-600 mt-1 truncate">Link do arquivo: {attachmentUrl}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-gray-200 dark:border-slate-800 px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading || !reason.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-black text-white shadow-md shadow-red-600/20 transition hover:bg-red-700 disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  Enviar Solicitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
