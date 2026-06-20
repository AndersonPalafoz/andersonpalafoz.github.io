import { PROFESSOR_NAME } from "@/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, Users } from "lucide-react";

export default function About() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-light to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Sobre {PROFESSOR_NAME}
            </h1>
            <p className="text-lg text-muted-foreground">
              Conheça a história, metodologia e missão educacional
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">
                Professor de Inglês Dedicado
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Com mais de uma década de experiência em ensino de inglês, {PROFESSOR_NAME} desenvolveu uma metodologia única que combina teoria linguística com prática real. Seu foco é transformar a forma como os alunos aprendem idiomas.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Especializado em preparação para certificações internacionais e desenvolvimento de fluência conversacional, {PROFESSOR_NAME} acredita que todo aluno tem potencial para dominar o inglês quando exposto à metodologia correta.
              </p>
            </div>

            {/* Image Placeholder */}
            <div className="hidden md:flex items-center justify-center">
              <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
                <Users className="w-32 h-32 text-primary/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Destaques
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Metodologia Comprovada",
                description: "Baseada em princípios CEFR e melhores práticas internacionais de ensino de idiomas.",
              },
              {
                icon: Users,
                title: "Centenas de Alunos",
                description: "Alunos satisfeitos que alcançaram seus objetivos de aprendizagem com sucesso.",
              },
              {
                icon: Award,
                title: "Certificações",
                description: "Especialista em preparação para exames internacionais de proficiência em inglês.",
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx}>
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-3xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">Filosofia Educacional</h2>

          <div className="space-y-6 text-muted-foreground">
            <p>
              A educação é mais que transmitir conhecimento. É inspirar, motivar e capacitar alunos a alcançarem seu potencial máximo. Essa é a filosofia que guia todo o trabalho de {PROFESSOR_NAME}.
            </p>

            <p>
              Acredita-se que cada aluno tem um ritmo único de aprendizagem. Por isso, a plataforma oferece flexibilidade, personalizando a experiência de aprendizagem para cada um.
            </p>

            <p>
              O objetivo final não é apenas ensinar inglês, mas criar confiança, autonomia e amor pelo aprendizado contínuo. Quando um aluno domina um idioma, ele abre portas para novas oportunidades, culturas e perspectivas.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
