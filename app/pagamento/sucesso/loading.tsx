import { Loader2 } from "lucide-react";

export default function PaymentSuccessLoading() {
  return (
    <main className="site-shell min-h-screen bg-background text-foreground flex items-center justify-center p-6" role="status" aria-live="polite">
      <div className="w-full max-w-xl space-y-6 rounded-3xl border border-border bg-card p-8 shadow-lg md:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300">
          <Loader2 className="animate-spin" size={32} aria-hidden="true" />
        </div>
        <div className="mx-auto h-6 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="mx-auto h-4 w-full max-w-md animate-pulse rounded bg-muted" />
        <div className="h-28 animate-pulse rounded-2xl bg-muted" />
        <span className="sr-only">Carregando confirmação do pagamento.</span>
      </div>
    </main>
  );
}
