export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Sobre Anderson Palafoz | Ensino de Inglês",
  description:
    "Conheça a história, formação e filosofia de ensino de Anderson Palafoz.",
};

export default function SobrePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="pt-32 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Sobre <span className="text-primary">Anderson Palafoz</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Professor, pesquisador e educador dedicado ao ensino de inglês de
            alta qualidade.
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto space-y-12">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Quem Sou
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Sou Anderson Palafoz, professor de inglês com formação em
              Letras-Inglês pela UFBA. Minha paixão é tornar o ensino de
              inglês acessível, prático e significativo para todos os meus
              alunos.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Formação
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                <span>
                  Licenciatura em Letras-Inglês pela Universidade Federal da
                  Bahia (UFBA)
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                <span>
                  Pesquisa em Linguística com foco em Morfologia e Sintaxe
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                <span>
                  Experiência em educação com foco étnico-racial e inclusão
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Filosofia de Ensino
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Acredito que o ensino de inglês deve ser estruturado, prático e
              centrado no aluno. Utilizo metodologias modernas como ESA (Engage,
              Study, Activate) e integro tecnologia para potencializar a
              aprendizagem.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Áreas de Atuação
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Ensino de Inglês",
                "Linguística Aplicada",
                "Produção de Materiais",
                "Educação com Foco Étnico-Racial",
                "Tecnologia e IA em Educação",
                "Formação de Professores",
              ].map((area) => (
                <div
                  key={area}
                  className="p-4 rounded-lg border border-border bg-card"
                >
                  <p className="font-semibold text-foreground">{area}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-card">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-foreground">
            Pronto para Começar?
          </h2>
          <p className="text-lg text-muted-foreground">
            Explore meus cursos, materiais e conteúdos educacionais.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/aulas">
              <Button size="lg">Ver Aulas</Button>
            </Link>
            <Link href="/materiais">
              <Button variant="outline" size="lg">
                Explorar Materiais
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
