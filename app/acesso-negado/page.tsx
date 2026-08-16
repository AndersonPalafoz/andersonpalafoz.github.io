import Link from "next/link";

export default function DeniedAccessPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-6 py-20">
      <section className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700" aria-hidden="true">
          403
        </span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-red-600">Acesso não liberado</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Não é possível acessar esta área</h1>
        <p className="mt-5 leading-7 text-gray-600">
          Sua conta está bloqueada, suspensa ou ainda não possui autorização para entrar na área do aluno. Entre em contato para verificar a situação do cadastro.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2">
            Voltar para o início
          </Link>
          <Link href="/contato" className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:border-red-600 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2">
            Falar com Anderson
          </Link>
        </div>
      </section>
    </main>
  );
}
