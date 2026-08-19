import { Skeleton } from "@/app/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className="flex min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8" aria-busy="true" aria-live="polite">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-card p-4 shadow-sm md:hidden">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-11 w-11 rounded-xl" />
        </div>
        <div className="space-y-3 rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-80 max-w-full" />
          <Skeleton className="h-4 w-[34rem] max-w-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-2xl" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
              <Skeleton className="h-7 w-52" />
              <div className="mt-6 space-y-3">{Array.from({ length: 4 }).map((__, row) => <Skeleton key={row} className="h-14 rounded-xl" />)}</div>
            </div>
          ))}
        </div>
        <p className="sr-only">Carregando sua área acadêmica.</p>
      </div>
    </main>
  );
}
