"use client";

import React from "react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body className="bg-white text-gray-900">
        <main className="flex min-h-screen items-center justify-center px-6 py-20">
          <div className="max-w-lg text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">Algo deu errado</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight">Não foi possível carregar esta página</h1>
            <p className="mt-4 leading-7 text-gray-600">Tente novamente. Se o problema continuar, volte ao início e retome sua navegação.</p>
            <button type="button" onClick={() => reset()} className="mt-8 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700">Tentar novamente</button>
          </div>
        </main>
      </body>
    </html>
  );
}
