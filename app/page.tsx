export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            Aprenda Inglês com{" "}
            <span className="text-primary">Anderson Palafoz</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Plataforma educacional completa com cursos, materiais e conteúdos
            acadêmicos de alta qualidade.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg">Acessar Minha Área</Button>
            </Link>
            <Link href="/sobre">
              <Button variant="outline" size="lg">
                Saiba Mais
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Cursos Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
            Cursos Disponíveis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { level: "A1", title: "Iniciante" },
              { level: "A2", title: "Elementar" },
              { level: "B1", title: "Intermediário" },
              { level: "B2", title: "Intermediário Alto" },
              { level: "C1", title: "Avançado" },
              { level: "C2", title: "Proficiência" },
            ].map((course) => (
              <div
                key={course.level}
                className="p-6 rounded-lg border border-border bg-background hover:bg-muted transition"
              >
                <div className="text-3xl font-bold text-primary mb-2">
                  {course.level}
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Aprenda inglês no nível {course.level}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Materiais Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
            Materiais Educacionais
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Acesse uma biblioteca completa de materiais, exercícios e recursos
            para potencializar seu aprendizado.
          </p>
          <div className="text-center">
            <Link href="/materiais">
              <Button variant="outline">Ver Todos os Materiais</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
            Blog & Conhecimento
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Leia artigos sobre ensino de inglês, linguística, metodologia e
            muito mais.
          </p>
          <div className="text-center">
            <Link href="/blog">
              <Button variant="outline">Ler Artigos</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
