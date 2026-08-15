import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-20">
      <div className="max-w-lg text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">Erro 404</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Página não encontrada</h1>
        <p className="mt-4 text-base leading-7 text-gray-600">O endereço pode ter sido alterado ou o conteúdo ainda não está disponível.</p>
        <Link href="/" className="mt-8 inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700">Voltar para a página inicial</Link>
      </div>
    </main>
  );
}
