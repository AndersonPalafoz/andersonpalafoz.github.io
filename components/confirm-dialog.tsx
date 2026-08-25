'use client';

import { Loader2, ShieldAlert, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar exclusão",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description" className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"><ShieldAlert size={22} /></div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h2 id="confirm-dialog-title" className="text-lg font-black">{title}</h2>
              <button type="button" onClick={onCancel} disabled={busy} aria-label="Fechar confirmação" className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"><X size={18} /></button>
            </div>
            <p id="confirm-dialog-description" className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={busy} className="min-h-11 rounded-xl border border-border px-4 text-sm font-bold text-foreground hover:bg-muted disabled:opacity-50">Cancelar</button>
          <button type="button" onClick={onConfirm} disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-60">{busy && <Loader2 size={16} className="animate-spin" />}{busy ? "Excluindo..." : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
