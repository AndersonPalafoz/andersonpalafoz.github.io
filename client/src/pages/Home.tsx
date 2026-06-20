import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PROFESSOR_NAME } from "@/constants";
import { BookOpen, FileText, MessageSquare, Users } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 bg-gradient-to-b from-light to-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  Aprenda Inglês com <span className="text-primary">{PROFESSOR_NAME}</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  Plataforma educacional completa com aulas, materiais exclusivos e conteúdo acadêmico de alta qualidade.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <>
                    <Button asChild size="lg" className="bg-primary hover:bg-primary-hover text-white">
                      <Link href="/dashboard/courses">Ir para Dashboard</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/courses">Explorar Aulas</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild size="lg" className="bg-primary hover:bg-primary-hover text-white">
                      <a href={getLoginUrl()}>Começar Agora</a>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/about">Saiba Mais</Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-2xl font-bold text-primary">100+</p>
                  <p className="text-sm text-muted-foreground">Aulas Disponíveis</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">A1-C2</p>
                  <p className="text-sm text-muted-foreground">Todos os Níveis CEFR</p>
                </div>
              </div>
            </div>

            {/* Hero Image Placeholder */}
            <div className="hidden md:flex items-center justify-center">
              <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-32 h-32 text-primary/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Professor Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Sobre {PROFESSOR_NAME}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Professor especializado em ensino de inglês com foco em metodologia comunicativa e aprendizagem significativa. Dedicado a transformar a forma como os alunos aprendem idiomas, combinando teoria linguística com prática real.
            </p>
            <Button asChild variant="outline">
              <Link href="/about">Conhecer Mais</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container">
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Aulas</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Cursos estruturados seguindo o framework CEFR, com aulas interativas e materiais complementares.
              </p>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Iniciante",
                  level: "A1-A2",
                  description: "Fundamentos do inglês para iniciantes",
                  icon: Users,
                },
                {
                  title: "Intermediário",
                  level: "B1-B2",
                  description: "Desenvolvimento de fluência e confiança",
                  icon: MessageSquare,
                },
                {
                  title: "Avançado",
                  level: "C1-C2",
                  description: "Domínio completo e especialização",
                  icon: BookOpen,
                },
              ].map((course, idx) => {
                const Icon = course.icon;
                return (
                  <Card key={idx} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription className="text-primary font-semibold">
                        {course.level}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/courses">Explorar</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center pt-4">
              <Button asChild size="lg" variant="outline">
                <Link href="/courses">Ver Todas as Aulas</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Materials Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Materiais</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Biblioteca completa com worksheets, slides, artigos e recursos pedagógicos.
              </p>
            </div>

            {/* Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Worksheets",
                  description: "Exercícios práticos e atividades interativas",
                  icon: FileText,
                },
                {
                  title: "Slides",
                  description: "Apresentações estruturadas para cada tema",
                  icon: BookOpen,
                },
              ].map((material, idx) => {
                const Icon = material.icon;
                return (
                  <Card key={idx} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle>{material.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{material.description}</p>
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/materials">Acessar</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center pt-4">
              <Button asChild size="lg" variant="outline">
                <Link href="/materials">Explorar Biblioteca</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container">
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Blog</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Artigos, dicas e conteúdo acadêmico sobre ensino de inglês.
              </p>
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Metodologia CEFR",
                  category: "Educação",
                  readTime: "5 min",
                },
                {
                  title: "Dicas de Pronúncia",
                  category: "Pronúncia",
                  readTime: "3 min",
                },
                {
                  title: "Vocabulário Avançado",
                  category: "Vocabulário",
                  readTime: "7 min",
                },
              ].map((post, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{post.readTime}</span>
                    </div>
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full">
                      Ler Artigo
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center pt-4">
              <Button asChild size="lg" variant="outline">
                <Link href="/blog">Ver Todos os Artigos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary to-primary-hover text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Pronto para Começar sua Jornada?
            </h2>
            <p className="text-lg opacity-90">
              Junte-se a centenas de alunos que já estão aprendendo inglês com {PROFESSOR_NAME}.
            </p>
            {!isAuthenticated && (
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary-hover text-white"
            >
              <Link href="/dashboard/courses">Ir para Dashboard</Link>
            </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
