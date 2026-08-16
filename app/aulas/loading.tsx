export default function AulasLoading() {
  return (
    <main className="site-shell px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-label="Carregando cursos">
      <div className="page-container space-y-8">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <div className="mx-auto h-4 w-28 animate-pulse rounded-full bg-muted" />
          <div className="mx-auto h-12 w-4/5 animate-pulse rounded-2xl bg-muted" />
          <div className="mx-auto h-5 w-3/5 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="surface-card h-28 animate-pulse" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="surface-card overflow-hidden p-0">
              <div className="h-40 animate-pulse bg-muted" />
              <div className="space-y-4 p-6">
                <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
                <div className="h-8 w-4/5 animate-pulse rounded-xl bg-muted" />
                <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
                <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground">Carregando cursos disponíveis…</p>
      </div>
    </main>
  );
}
