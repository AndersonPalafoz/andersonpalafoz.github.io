import Link from "next/link";
import { Clock3 } from "lucide-react";

export default function PendingAccessPage() {
  return (
    <main className="site-shell flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-16 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6 sm:py-20">
      <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-amber-600 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-300" aria-hidden="true">
          <Clock3 size={24} />
        </span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-red-600">Acesso em análise</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">Sua conta está aguardando aprovação</h1>
        <p className="mt-5 leading-7 text-slate-600 dark:text-slate-300">
          O cadastro foi realizado, mas o acesso aos cursos e à área do aluno será liberado após a análise de um professor ou administrador.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2">
            Voltar para o início
          </Link>
          <Link href="/contato" className="rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 px-5 py-3 font-semibold text-slate-900 dark:text-white transition hover:border-red-600 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2">
            Falar com Anderson
          </Link>
        </div>
      </section>
    </main>
  );
}
