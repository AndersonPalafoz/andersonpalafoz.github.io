import { Skeleton } from "@/app/components/ui/skeleton";

export default function ProfessorLoading() {
  return (
    <div className="site-shell px-4 py-8 sm:px-6 lg:px-8">
      <div className="page-container space-y-8">
        <div className="surface-card p-6 sm:p-8 rounded-3xl border border-border/70 space-y-4">
          <Skeleton className="h-6 w-48 rounded-xl" />
          <Skeleton className="h-10 w-72 rounded-2xl" />
          <Skeleton className="h-4 w-full max-w-xl rounded-lg" />
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-11 w-36 rounded-xl" />
            <Skeleton className="h-11 w-36 rounded-xl" />
            <Skeleton className="h-11 w-36 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="surface-card p-5 space-y-3">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="surface-card p-6 sm:p-8 space-y-4">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
          <div className="surface-card p-6 sm:p-8 space-y-4">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
