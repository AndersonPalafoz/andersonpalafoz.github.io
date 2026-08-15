"use client";

import React, { useEffect } from "react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // O erro já é tratado visualmente; o servidor mantém os detalhes nos logs.
  }, []);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-20">
      <div className="max-w-lg text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">Algo deu errado</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">Não foi possível carregar o conteúdo</h1>
        <p className="mt-4 leading-7 text-gray-600">Tente novamente ou volte para a página inicial para continuar navegando.</p>
        <button type="button" onClick={() => reset()} className="mt-8 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700">Tentar novamente</button>
      </div>
    </main>
  );
}
