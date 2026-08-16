"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md">
        <p className="text-sm font-bold uppercase tracking-widest text-red-600">Algo deu errado</p>
        <h1 className="mt-3 text-3xl font-black text-gray-950">Não foi possível carregar o conteúdo</h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">Tente novamente ou volte para a página inicial para continuar navegando.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={() => reset()} className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700">Tentar novamente</button>
          <a href="/" className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">Voltar para Home</a>
        </div>
      </div>
    </main>
  );
}
