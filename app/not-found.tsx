import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md">
        <p className="text-sm font-bold uppercase tracking-widest text-red-600">404</p>
        <h1 className="mt-3 text-3xl font-black text-gray-950">Página não encontrada</h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">O endereço pode ter sido alterado ou o conteúdo ainda não está disponível.</p>
        <Link href="/" className="mt-6 inline-flex rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700">Voltar para a página inicial</Link>
      </div>
    </main>
  );
}
