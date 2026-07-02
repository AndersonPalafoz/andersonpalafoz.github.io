export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Aulas | Anderson Palafoz",
  description: "Conheça as modalidades, público-alvo e metodologia das aulas.",
};

export default function AulasPage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="pt-32 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Modalidades de <span className="text-primary">Aulas</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Escolha a modalidade que melhor se adequa ao seu estilo de
            aprendizagem.
          </p>
        </div>
      </section>

      {/* Modalidades */}
      <section className="py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            Nossas Modalidades
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Cursos Online",
                description:
                  "Cursos estruturados com vídeos, materiais e exercícios.",
                icon: "🎓",
              },
              {
                title: "Aulas Particulares",
                description: "Aulas personalizadas focadas em suas necessidades.",
                icon: "👨‍🏫",
              },
              {
                title: "Grupos de Estudo",
                description: "Aprenda em grupo com alunos no mesmo nível.",
                icon: "👥",
              },
              {
                title: "Materiais Educacionais",
                description: "Acesso a uma biblioteca completa de recursos.",
                icon: "📚",
              },
            ].map((modalidade) => (
              <div
                key={modalidade.title}
                className="p-8 rounded-lg border border-border bg-card hover:bg-muted transition space-y-4"
              >
                <div className="text-4xl">{modalidade.icon}</div>
                <h3 className="text-2xl font-bold text-foreground">
                  {modalidade.title}
                </h3>
                <p className="text-muted-foreground">{modalidade.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metodologia */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-card">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Metodologia ESA
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Todas as aulas seguem o modelo ESA (Engage, Study, Activate),
              comprovado para potencializar a aprendizagem:
            </p>

            <div className="space-y-6">
              {[
                {
                  stage: "Engage",
                  description:
                    "Introdução do tema com contexto real e motivador",
                },
                {
                  stage: "Study",
                  description:
                    "Apresentação de estruturas gramaticais e vocabulário",
                },
                {
                  stage: "Activate",
                  description:
                    "Prática ativa com exercícios e comunicação real",
                },
              ].map((item) => (
                <div key={item.stage} className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {item.stage[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">
                      {item.stage}
                    </h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Público-alvo */}
      <section className="py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Para Quem?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "Iniciantes (A1)",
              "Alunos em transição (A2-B1)",
              "Alunos avançados (B2-C2)",
              "Profissionais",
              "Estudantes",
              "Pesquisadores",
            ].map((target) => (
              <div
                key={target}
                className="p-4 rounded-lg border border-border bg-background flex items-center gap-3"
              >
                <span className="text-primary text-xl">✓</span>
                <span className="text-foreground">{target}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-primary/10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-foreground">
            Comece Agora Mesmo
          </h2>
          <p className="text-lg text-muted-foreground">
            Escolha seu curso e comece sua jornada de aprendizado.
          </p>
          <Link href="/dashboard">
            <Button size="lg">Acessar Minha Área</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
