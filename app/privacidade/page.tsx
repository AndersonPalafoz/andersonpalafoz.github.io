import Link from "next/link";
import { ArrowLeft, Cookie } from "lucide-react";

export const metadata = {
  title: "Cookies e Privacidade | Anderson Palafoz",
  description: "Informações sobre o uso de cookies e tecnologias de acessibilidade na plataforma Anderson Palafoz.",
  alternates: {
    canonical: "/privacidade",
  },
};

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-10">
        <header>
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition hover:text-red-700">
            <ArrowLeft size={16} aria-hidden="true" /> Voltar para a página inicial
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-red-300">
            <Cookie size={16} aria-hidden="true" /> Transparência e privacidade
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Cookies e privacidade</h1>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300">Última atualização: 30 de outubro de 2026</p>
        </header>

        <div className="space-y-8 text-base leading-8 text-slate-700 dark:text-slate-300">
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">1. Como usamos cookies</h2>
            <p>Usamos cookies essenciais para manter sessões, preferências de tema e o funcionamento seguro da plataforma. O aviso exibido no site registra apenas a escolha de consentimento no navegador.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">2. Cookies essenciais</h2>
            <p>Os cookies essenciais não são usados para publicidade. Eles ajudam a manter sua autenticação, lembrar preferências e proteger áreas restritas do aluno, professor e administração.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">3. Acessibilidade com VLibras</h2>
            <p>O site disponibiliza o VLibras, um recurso de acessibilidade carregado a partir de <strong>vlibras.gov.br</strong>. Ao utilizar o recurso, o navegador pode realizar uma conexão com o serviço externo para carregar o widget.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">4. Como gerenciar suas preferências</h2>
            <p>Você pode apagar cookies nas configurações do navegador. Isso pode encerrar sua sessão ou restaurar preferências padrão. Para saber como tratamos os dados pessoais, consulte a nossa <Link href="/politica-privacidade" className="font-bold text-red-600 hover:underline">Política de Privacidade</Link>.</p>
          </section>
        </div>

        <footer className="border-t border-slate-200 pt-8 dark:border-slate-800">
          <Link href="/contato" className="text-sm font-bold text-red-600 transition hover:text-red-700 hover:underline">Dúvidas sobre privacidade? Fale conosco.</Link>
        </footer>
      </div>
    </main>
  );
}
