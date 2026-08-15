import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  GraduationCap,
  Heart,
  Lightbulb,
  Sparkles,
  Users,
} from "lucide-react";

export const metadata = {
  title: "Sobre Anderson Bacelar Palafoz | Professor de Inglês e Pesquisador",
  description:
    "Conheça a trajetória, formação acadêmica na UFBA, filosofia pedagógica e áreas de especialização de Anderson Bacelar Palafoz.",
  alternates: {
    canonical: "/sobre",
  },
};

const timelineEvents = [
  {
    period: "Formação Inicial e Graduação",
    titulo: "Licenciatura em Letras com Inglês pela UFBA",
    descricao:
      "Conclusão da graduação na Universidade Federal da Bahia (UFBA), com imersão em linguística aplicada, morfossintaxe e metodologias modernas de aquisição de segunda língua.",
  },
  {
    period: "Aprofundamento Acadêmico",
    titulo: "Bacharelado em Inglês na UFBA",
    descricao:
      "Continuidade dos estudos acadêmicos na UFBA, com foco avançado em literatura de língua inglesa, análise sintática e produção crítica.",
  },
  {
    period: "Atuação Pedagógica",
    titulo: "Ensino de Inglês e Projetos Comunitários",
    descricao:
      "Atuação no planejamento de aulas para iniciantes e jovens, unindo rigor metodológico, letramento étnico-racial e ferramentas digitais.",
  },
  {
    period: "Inovação Educacional",
    titulo: "Plataforma Digital e Knowledge Hub",
    descricao:
      "Desenvolvimento de ecossistema próprio para centralizar cursos, materiais didáticos exclusivos e recursos interativos baseados no modelo ESA.",
  },
];

const researchInterests = [
  {
    titulo: "Morfologia e Sintaxe",
    descricao: "Investigação da estrutura frasal e verbos inacusativos/inergativos na aquisição do inglês.",
  },
  {
    titulo: "Letramento Étnico-Racial",
    descricao: "Integração de representatividade e inclusão social na prática de ensino de línguas.",
  },
  {
    titulo: "Tecnologia e IA na Educação",
    descricao: "Uso inteligente de ferramentas digitais e agentes de inteligência artificial para personalização de estudos.",
  },
  {
    titulo: "Quadrinhos como Ferramenta Pedagógica",
    descricao: "Uso de narrativas visuais e quadrinhos para dinamizar a leitura e a compreensão de vocabulário.",
  },
];

export default function SobrePage() {
  return (
    <main className="w-full bg-white text-[#1F1F1F]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#F8F9FA] px-4 py-20 sm:px-6 md:px-8 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-red-600">
                <Sparkles size={14} aria-hidden="true" />
                Trajetória Acadêmica e Profissional
              </span>
              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Sobre
                <span className="block text-[#D62828]">Anderson Bacelar Palafoz</span>
              </h1>
              <p className="text-lg leading-8 text-gray-600">
                Professor de inglês licenciado e graduando em Letras com Inglês pela <strong className="font-semibold text-[#1F1F1F]">Universidade Federal da Bahia (UFBA)</strong>. Pesquisador de linguística, letramento étnico-racial e metodologias ativas para o ensino de idiomas.
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
                <Link
                  href="/aulas"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#D62828] px-6 py-3 font-semibold text-white transition hover:bg-[#B91C1C] focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-2 active:scale-[0.98]"
                >
                  Conhecer Aulas
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link
                  href="/materiais"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-[#1F1F1F] transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-2 active:scale-[0.98]"
                >
                  Explorar Materiais
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] sm:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-600">Resumo Profissional</p>
                <h2 className="mt-3 text-2xl font-bold text-[#1F1F1F]">Compromisso com a excelência acadêmica</h2>
                <p className="mt-4 leading-7 text-gray-600">
                  Com sólida formação universitária e atuação em Salvador (Bahia), Anderson alia o rigor teórico da linguística à aplicação prática em sala de aula, ajudando alunos a destravarem o inglês com segurança e autonomia.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-6 border-t border-gray-100 pt-6">
                  <div>
                    <p className="text-3xl font-bold text-[#D62828]">UFBA</p>
                    <p className="mt-1 text-sm text-gray-600">Letras com Inglês</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#D62828]">ESA</p>
                    <p className="mt-1 text-sm text-gray-600">Modelo Metodológico</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Background Section */}
      <section className="bg-white px-4 py-16 sm:px-6 md:px-8 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center sm:mb-16">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-red-600">Base Universitária</p>
            <h2 className="text-3xl font-bold sm:text-4xl">Formação Acadêmica e Pesquisa</h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-600">
              Trajetória consolidada na Universidade Federal da Bahia, com foco em estudos linguísticos avançados.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-[#F8F9FA] p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <GraduationCap size={24} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-[#1F1F1F]">Licenciatura em Letras com Inglês</h3>
                  <p className="mt-1 text-sm font-semibold text-red-600">Universidade Federal da Bahia (UFBA)</p>
                  <p className="mt-3 leading-7 text-gray-600">
                    Formação com habilitação específica no ensino da língua inglesa, englobando fonética, fonologia, morfologia, sintaxe, pragmática e teorias contemporâneas de aquisição de linguagem.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-[#F8F9FA] p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <BookOpen size={24} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-[#1F1F1F]">Bacharelado em Inglês</h3>
                  <p className="mt-1 text-sm font-semibold text-red-600">Universidade Federal da Bahia (UFBA)</p>
                  <p className="mt-3 leading-7 text-gray-600">
                    Aprofundamento na literatura, na estrutura formal da língua e em pesquisas acadêmicas voltadas para a análise morfossintática e o uso de recursos textuais autênticos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="bg-[#F8F9FA] px-4 py-16 sm:px-6 md:px-8 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center sm:mb-16">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-red-600">Evolução</p>
            <h2 className="text-3xl font-bold sm:text-4xl">Linha do Tempo Profissional</h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-600">
              Passos marcantes na consolidação da carreira docente e acadêmica.
            </p>
          </div>

          <div className="space-y-6">
            {timelineEvents.map((item, index) => (
              <div key={index} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <span className="inline-block rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                  {item.period}
                </span>
                <h3 className="mt-3 text-xl font-bold text-[#1F1F1F]">{item.titulo}</h3>
                <p className="mt-2 leading-7 text-gray-600">{item.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research & Interests */}
      <section className="bg-white px-4 py-16 sm:px-6 md:px-8 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center sm:mb-16">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-red-600">Investigação e Prática</p>
            <h2 className="text-3xl font-bold sm:text-4xl">Áreas de Pesquisa e Interesse</h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-600">
              Temas que fundamentam a curadoria de materiais, artigos e metodologias aplicadas na plataforma.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {researchInterests.map((item) => (
              <div key={item.titulo} className="rounded-2xl border border-gray-200 bg-[#F8F9FA] p-6 transition hover:border-red-200">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <Award size={20} aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-bold text-[#1F1F1F]">{item.titulo}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{item.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teaching Philosophy */}
      <section className="bg-[#F8F9FA] px-4 py-16 sm:px-6 md:px-8 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-red-600">Metodologia ESA</p>
              <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
                Filosofia de Ensino Baseada em Objetivos Claros
              </h2>
              <p className="mt-4 leading-7 text-gray-600">
                O ensino de inglês não deve ser mecânico. A abordagem pedagógica prioriza o modelo <strong className="font-semibold text-[#1F1F1F]">Engage, Study, Activate (ESA)</strong>, separando momentos de aquecimento, estudo aprofundado de morfologia/sintaxe e ativação prática individualizada.
              </p>
              <ul className="mt-6 space-y-3 text-gray-700">
                <li className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-red-600" />
                  <span>Aulas estruturadas com objetivos explícitos e mensuráveis.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-red-600" />
                  <span>Materiais didáticos originais, worksheets e leituras contextualizadas.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-red-600" />
                  <span>Integração de tecnologia, IA e ferramentas de produtividade acadêmica.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
              <h3 className="text-2xl font-bold text-[#1F1F1F]">Valores e Princípios</h3>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <Lightbulb size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h4 className="font-semibold text-[#1F1F1F]">Clareza e Transparência</h4>
                    <p className="mt-1 text-sm text-gray-600">Explicações diretas e objetivas, sem complexidade desnecessária.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <Users size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h4 className="font-semibold text-[#1F1F1F]">Respeito à Diversidade</h4>
                    <p className="mt-1 text-sm text-gray-600">Inclusão e representatividade étnico-racial em todas as frentes educativas.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <Heart size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h4 className="font-semibold text-[#1F1F1F]">Dedicação ao Aluno</h4>
                    <p className="mt-1 text-sm text-gray-600">Acompanhamento contínuo do progresso para garantir resultados reais.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#D62828] px-4 py-16 sm:px-6 md:px-8 lg:px-16 lg:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Pronto para começar sua jornada?</h2>
            <p className="mt-3 max-w-2xl text-lg leading-7 text-red-100">
              Conheça os cursos disponíveis ou entre em contato para tirar suas dúvidas.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/aulas"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600 active:scale-[0.98]"
            >
              Ver aulas
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              href="/contato"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/80 px-5 py-3 font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600 active:scale-[0.98]"
            >
              Falar com Anderson
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
