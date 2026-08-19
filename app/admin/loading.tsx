import { Skeleton } from "@/app/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <main className="site-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8" aria-busy="true" aria-live="polite">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-9 w-72 max-w-full" />
            <Skeleton className="h-4 w-[28rem] max-w-full" />
          </div>
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-2xl" />)}
        </div>
        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
          <Skeleton className="h-7 w-56" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-14 rounded-xl" />)}
          </div>
        </div>
        <p className="sr-only">Carregando painel administrativo.</p>
      </div>
    </main>
  );
}
