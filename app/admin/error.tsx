"use client";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="site-shell flex min-h-[70vh] items-center justify-center px-4 py-12 sm:px-6" role="alert">
      <div className="surface-card w-full max-w-lg space-y-5 p-6 text-center sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Painel administrativo</p>
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">Não foi possível carregar esta área</h1>
        <p className="text-sm leading-6 text-muted-foreground">O conteúdo não foi confirmado neste momento. Tente novamente; se o problema persistir, verifique a conexão e os logs administrativos.</p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={() => reset()} className="min-h-11 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2">Tentar novamente</button>
          <a href="/dashboard" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-bold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2">Voltar à Minha Área</a>
        </div>
      </div>
    </main>
  );
}
