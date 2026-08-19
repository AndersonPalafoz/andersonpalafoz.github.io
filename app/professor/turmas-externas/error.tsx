"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

export default function ExternalClassesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 py-12 text-gray-900 dark:text-white">
      <section role="alert" aria-live="assertive" className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/60 dark:bg-slate-900 sm:p-10">
        <div className="rounded-2xl bg-red-100 p-3 text-red-700 dark:bg-red-950/60 dark:text-red-300">
          <AlertTriangle size={28} aria-hidden="true" />
        </div>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-red-600 dark:text-red-400">Falha na área de turmas externas</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight">Não foi possível exibir este painel</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-600 dark:text-gray-300">Ocorreu uma falha inesperada ao montar a página. Seus dados não foram apagados. Tente carregar novamente; se o problema continuar, volte ao painel e registre o horário do erro.</p>
        <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={() => reset()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
            <RefreshCw size={16} aria-hidden="true" /> Tentar novamente
          </button>
          <Link href="/professor" className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-600 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-800">
            <ArrowLeft size={16} aria-hidden="true" /> Voltar ao painel
          </Link>
        </div>
      </section>
    </main>
  );
}
