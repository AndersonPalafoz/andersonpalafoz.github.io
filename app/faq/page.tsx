import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

export const metadata = {
  title: "Perguntas Frequentes | Anderson Palafoz",
  description: "Respostas para as principais dúvidas sobre aulas, cursos, materiais e acesso à plataforma Anderson Palafoz.",
  alternates: {
    canonical: "/faq",
  },
};

const faqItems = [
  {
    question: "Quais níveis de inglês são atendidos nas aulas?",
    answer: "As aulas são planejadas para estudantes dos níveis A1 ao B2. A plataforma também disponibiliza materiais de estudo que podem chegar aos níveis C1 e C2.",
  },
  {
    question: "Como funciona o acesso à área do aluno?",
    answer: "Você pode entrar utilizando uma conta autorizada. Novas contas começam com acesso pendente e passam por uma análise antes de receberem permissões acadêmicas.",
  },
  {
    question: "Posso solicitar uma aula individual?",
    answer: "Sim. A plataforma pode organizar cursos e sessões individuais, de acordo com os objetivos, disponibilidade e nível do estudante.",
  },
  {
    question: "Existem cursos em grupo?",
    answer: "Sim. Também há suporte para turmas em grupo, com acompanhamento de progresso, atividades e registro de presença nas sessões.",
  },
  {
    question: "Onde encontro materiais, vídeos e áudios?",
    answer: "Os materiais ficam disponíveis na área de Materiais e podem incluir documentos, imagens, áudio e vídeo. Cursos, aulas e conteúdos do blog também podem utilizar esses formatos.",
  },
  {
    question: "Como acompanho meu progresso?",
    answer: "Na área do aluno, você pode consultar o avanço nas aulas, atividades e cursos. O professor também acompanha indicadores de frequência e participação.",
  },
  {
    question: "Como falar com um professor?",
    answer: "Alunos aprovados podem utilizar o sistema de mensagens diretas para conversar com professores. Para dúvidas gerais, use a página de Contato.",
  },
  {
    question: "Como posso solicitar suporte?",
    answer: "Envie uma mensagem pela página de Contato. Normalmente, as mensagens são respondidas em até 24 horas úteis.",
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-white text-[#1F1F1F]">
      <section className="bg-[#F8F9FA] px-4 py-20 sm:px-6 md:px-8 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-red-600">Central de ajuda</p>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">Perguntas frequentes</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">Encontre orientações rápidas sobre as aulas, os cursos, os materiais e o funcionamento da plataforma educacional Anderson Palafoz.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <MessageCircle className="text-red-600" size={28} aria-hidden="true" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Ainda ficou com dúvida?</h2>
              <p className="mt-3 leading-7 text-gray-600">Nossa equipe pode orientar você sobre acesso, aulas, materiais e próximos passos.</p>
              <Link href="/contato" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-2 active:scale-[0.98]">Falar conosco <ArrowRight size={18} aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 md:px-8 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details key={item.question} className="group rounded-2xl border border-gray-200 bg-[#F8F9FA] px-5 py-4 shadow-sm transition open:border-red-200 sm:px-6">
                <summary className="cursor-pointer list-none pr-10 font-semibold text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-red-200 [&::-webkit-details-marker]:hidden">
                  <span className="relative block after:absolute after:right-0 after:top-1/2 after:text-2xl after:font-normal after:text-red-600 after:content-['+'] after:-translate-y-1/2 group-open:after:content-['−']">{item.question}</span>
                </summary>
                <p className="max-w-3xl pt-3 leading-7 text-gray-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
