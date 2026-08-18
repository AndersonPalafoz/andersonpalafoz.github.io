import { Loader2 } from "lucide-react";

export default function ReceiptLoading() {
  return (
    <main className="site-shell min-h-screen bg-background text-foreground flex items-center justify-center p-6" role="status" aria-live="polite">
      <div className="w-full max-w-2xl space-y-8 rounded-3xl border border-border bg-card p-8 shadow-lg md:p-12">
        <div className="flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300">
            <Loader2 className="animate-spin" size={32} aria-hidden="true" />
          </div>
        </div>
        <div className="h-7 w-72 animate-pulse rounded-lg bg-muted" />
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        <div className="h-36 animate-pulse rounded-2xl bg-muted" />
        <span className="sr-only">Carregando recibo da transação.</span>
      </div>
    </main>
  );
}
