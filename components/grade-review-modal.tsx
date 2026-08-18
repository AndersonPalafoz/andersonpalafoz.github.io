"use client";

import { useState } from "react";
import { HelpCircle, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

interface GradeReviewModalProps {
  gradeId: number;
  assessmentTitle: string;
  currentScore: string;
}

export function GradeReviewModal({ gradeId, assessmentTitle, currentScore }: GradeReviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        body: JSON.stringify({ gradeId, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao solicitar revisão");
      toast.success("Solicitação de revisão enviada ao professor com sucesso!");
      setReason("");
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
        <HelpCircle size={14} /> Solicitar Revisão
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Solicitar Revisão de Nota</h3>
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
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explique detalhadamente o motivo pelo qual você solicita a revisão da sua avaliação..."
                  className="w-full rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-red-500 resize-y"
                  required
                />
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
                  disabled={submitting || !reason.trim()}
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
