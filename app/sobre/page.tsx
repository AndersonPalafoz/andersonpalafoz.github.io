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
    "Conheça a trajetória, formação acadêmica na UFBA e a proposta de aulas de inglês Básico ao Avançado [A1-C2], com foco em Básico, Intermediário e Avançado.",
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
    titulo: "Tecnologia e Ferramentas Digitais na Educação",
    descricao: "Uso inteligente de ferramentas digitais e recursos digitais avançados para personalização de estudos.",
  },
  {
    titulo: "Quadrinhos como Ferramenta Pedagógica",
    descricao: "Uso de narrativas visuais e quadrinhos para dinamizar a leitura e a compreensão de vocabulário.",
  },
];

export default function SobrePage() {
  return (
    <main className="w-full bg-background text-foreground transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900/60 px-4 py-20 sm:px-6 md:px-8 lg:px-16 lg:py-28 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 dark:bg-red-500/20 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-red-600 dark:text-red-400 border border-red-500/20">
                <Sparkles size={14} aria-hidden="true" />
                Trajetória Acadêmica e Profissional
              </span>
              <h1 className="text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl text-slate-900 dark:text-white">
                Sobre
                <span className="block text-red-600 dark:text-red-500">Anderson Bacelar Palafoz</span>
              </h1>
              <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">
                Professor de inglês licenciado e graduando em Letras com Inglês pela <strong className="font-semibold text-slate-900 dark:text-white">Universidade Federal da Bahia (UFBA)</strong>. Pesquisador de linguística, letramento étnico-racial e metodologias ativas para o ensino de idiomas.
              </p>
              <p className="max-w-2xl rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm leading-6 text-red-900 dark:text-red-200">
                As aulas são organizadas do <strong>A1 ao B2</strong>; a biblioteca de materiais pode avançar até os níveis <strong>C1 e C2</strong>, conforme o objetivo de estudo.
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
                <Link
                  href="/aulas"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-6 py-3 font-bold text-white transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]"
                >
                  Conhecer Aulas
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link
                  href="/materiais"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 font-bold text-slate-900 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-[0.98]"
                >
                  Explorar Materiais
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl sm:p-10">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-red-600 dark:text-red-400">Resumo Profissional</p>
                <h2 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">Compromisso com a excelência acadêmica</h2>
                <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300 text-sm">
                  Com sólida formação universitária e atuação em Salvador (Bahia), Anderson alia o rigor teórico da linguística à aplicação prática em sala de aula, ajudando alunos a destravarem o inglês com segurança e autonomia.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div>
                    <p className="text-3xl font-black text-red-600 dark:text-red-400">UFBA</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Letras com Inglês</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-red-600 dark:text-red-400">ESA</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Modelo Metodológico</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Background Section */}
      <section className="bg-white dark:bg-slate-950 px-4 py-16 sm:px-6 md:px-8 lg:px-16 lg:py-24 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center sm:mb-16">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-red-600 dark:text-red-400">Base Universitária</p>
            <h2 className="text-3xl font-black sm:text-4xl text-slate-900 dark:text-white">Formação Acadêmica e Pesquisa</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-400 text-sm">
              Trajetória consolidada na Universidade Federal da Bahia, com foco em estudos linguísticos avançados.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
                  <GraduationCap size={24} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Licenciatura em Letras com Inglês</h3>
                  <p className="mt-1 text-xs font-black text-red-600 dark:text-red-400 uppercase">Universidade Federal da Bahia (UFBA)</p>
                  <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300 text-sm">
                    Formação com habilitação específica no ensino da língua inglesa, englobando fonética, fonologia, morfologia, sintaxe, pragmática e teorias contemporâneas de aquisição de linguagem.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
                  <BookOpen size={24} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Bacharelado em Inglês</h3>
                  <p className="mt-1 text-xs font-black text-red-600 dark:text-red-400 uppercase">Universidade Federal da Bahia (UFBA)</p>
                  <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300 text-sm">
                    Aprofundamento na literatura, na estrutura formal da língua e em pesquisas acadêmicas voltadas para a análise morfossintática e o uso de recursos textuais autênticos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="bg-slate-50 dark:bg-slate-900/60 px-4 py-16 sm:px-6 md:px-8 lg:px-16 lg:py-24 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center sm:mb-16">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-red-600 dark:text-red-400">Evolução</p>
            <h2 className="text-3xl font-black sm:text-4xl text-slate-900 dark:text-white">Linha do Tempo Profissional</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-400 text-sm">
              Passos marcantes na consolidação da carreira docente e acadêmica.
            </p>
          </div>

          <div className="space-y-6">
            {timelineEvents.map((item, index) => (
              <div key={index} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sm:p-8">
                <span className="inline-block rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 text-xs font-bold">
                  {item.period}
                </span>
                <h3 className="mt-3 text-xl font-black text-slate-900 dark:text-white">{item.titulo}</h3>
                <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300 text-sm">{item.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research & Interests */}
      <section className="bg-white dark:bg-slate-950 px-4 py-16 sm:px-6 md:px-8 lg:px-16 lg:py-24 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center sm:mb-16">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-red-600 dark:text-red-400">Investigação e Prática</p>
            <h2 className="text-3xl font-black sm:text-4xl text-slate-900 dark:text-white">Áreas de Pesquisa e Interesse</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-400 text-sm">
              Temas que fundamentam a curadoria de materiais, artigos e metodologias aplicadas na plataforma.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {researchInterests.map((item) => (
              <div key={item.titulo} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-6 transition hover:border-red-500/40">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
                  <Award size={22} aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-black text-slate-900 dark:text-white">{item.titulo}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-400">{item.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teaching Philosophy */}
      <section className="bg-slate-50 dark:bg-slate-900/60 px-4 py-16 sm:px-6 md:px-8 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-red-600 dark:text-red-400">Metodologia ESA</p>
              <h2 className="text-3xl font-black leading-tight sm:text-4xl text-slate-900 dark:text-white">
                Filosofia de Ensino Baseada em Objetivos Claros
              </h2>
              <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300 text-sm">
                O ensino de inglês não deve ser mecânico. A abordagem pedagógica prioriza o modelo <strong className="font-semibold text-slate-900 dark:text-white">Engage, Study, Activate (ESA)</strong>, separando momentos de aquecimento, estudo aprofundado de morfologia/sintaxe e ativação prática individualizada.
              </p>
              <ul className="mt-6 space-y-3 text-slate-700 dark:text-slate-300 text-sm">
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
                  <span>Integração de tecnologia e ferramentas de produtividade acadêmica.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl sm:p-10 space-y-6">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Valores e Princípios</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                    <Lightbulb size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Clareza e Transparência</h4>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Explicações diretas e objetivas, sem complexidade desnecessária.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                    <Users size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Respeito à Diversidade</h4>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Inclusão e representatividade étnico-racial em todas as frentes educativas.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                    <Heart size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Dedicação ao Aluno</h4>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Acompanhamento contínuo do progresso para garantir autonomia.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
