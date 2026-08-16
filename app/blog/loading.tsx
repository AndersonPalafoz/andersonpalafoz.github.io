export default function BlogLoading() {
  return (
    <main className="site-shell px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-label="Carregando artigos">
      <div className="page-container space-y-8">
        <header className="mx-auto max-w-3xl space-y-4 text-center">
          <div className="mx-auto h-4 w-28 animate-pulse rounded-full bg-muted" />
          <div className="mx-auto h-12 w-4/5 animate-pulse rounded-2xl bg-muted" />
          <div className="mx-auto h-5 w-3/5 animate-pulse rounded-full bg-muted" />
        </header>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <article key={index} className="surface-card min-h-64 animate-pulse p-6">
              <div className="h-4 w-24 rounded-full bg-muted" />
              <div className="mt-6 h-8 w-4/5 rounded-xl bg-muted" />
              <div className="mt-4 h-4 w-full rounded-full bg-muted" />
              <div className="mt-3 h-4 w-3/4 rounded-full bg-muted" />
              <div className="mt-8 h-11 w-full rounded-xl bg-muted" />
            </article>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground">Carregando artigos publicados…</p>
      </div>
    </main>
  );
}
