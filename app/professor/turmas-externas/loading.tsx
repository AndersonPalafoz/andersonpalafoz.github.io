import { Loader2 } from "lucide-react";

export default function ExternalClassesLoading() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-10" aria-busy="true" aria-live="polite">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-6 dark:border-slate-800">
          <div className="h-10 w-10 animate-pulse rounded-2xl bg-gray-200 dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="h-6 w-72 animate-pulse rounded-lg bg-gray-200 dark:bg-slate-800" />
            <div className="h-3 w-96 max-w-[80vw] animate-pulse rounded bg-gray-200 dark:bg-slate-800" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <div className="h-72 animate-pulse rounded-3xl bg-white shadow-sm dark:bg-slate-900" />
            <div className="h-80 animate-pulse rounded-3xl bg-white shadow-sm dark:bg-slate-900" />
          </div>
          <div className="flex min-h-96 flex-col items-center justify-center gap-3 rounded-3xl bg-white shadow-sm dark:bg-slate-900">
            <Loader2 size={24} className="animate-spin text-red-600" aria-hidden="true" />
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Carregando turmas e dados acadêmicos reais...</p>
          </div>
        </div>
      </div>
    </main>
  );
}
