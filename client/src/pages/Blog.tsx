import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";

export default function Blog() {
  const articles = [
    {
      id: 1,
      title: "Metodologia CEFR: Entendendo os Níveis de Proficiência",
      category: "Educação",
      author: "Anderson Palafoz",
      date: "2024-06-15",
      readTime: "8 min",
      excerpt:
        "Descubra como o framework CEFR estrutura o ensino de idiomas e como ele pode guiar sua jornada de aprendizagem.",
      image: "📚",
    },
    {
      id: 2,
      title: "10 Dicas de Pronúncia para Melhorar seu Inglês",
      category: "Pronúncia",
      author: "Anderson Palafoz",
      date: "2024-06-10",
      readTime: "5 min",
      excerpt:
        "Técnicas práticas para aprimorar sua pronúncia e soar mais natural ao falar inglês.",
      image: "🎤",
    },
    {
      id: 3,
      title: "Phrasal Verbs: Guia Completo e Prático",
      category: "Vocabulário",
      author: "Anderson Palafoz",
      date: "2024-06-05",
      readTime: "10 min",
      excerpt:
        "Entenda os phrasal verbs mais comuns e como utilizá-los corretamente em contextos reais.",
      image: "📖",
    },
    {
      id: 4,
      title: "Imersão em Inglês: Estratégias Eficazes",
      category: "Aprendizagem",
      author: "Anderson Palafoz",
      date: "2024-05-28",
      readTime: "7 min",
      excerpt:
        "Como criar um ambiente de imersão em inglês mesmo sem sair do Brasil.",
      image: "🌍",
    },
    {
      id: 5,
      title: "Inglês para Negócios: Vocabulário Essencial",
      category: "Negócios",
      author: "Anderson Palafoz",
      date: "2024-05-20",
      readTime: "9 min",
      excerpt:
        "Vocabulário e expressões indispensáveis para comunicação profissional em inglês.",
      image: "💼",
    },
    {
      id: 6,
      title: "Fluência Conversacional: Começando do Zero",
      category: "Conversação",
      author: "Anderson Palafoz",
      date: "2024-05-12",
      readTime: "6 min",
      excerpt:
        "Passo a passo para desenvolver confiança e fluência em conversas em inglês.",
      image: "💬",
    },
  ];

  const categories = [
    "Educação",
    "Pronúncia",
    "Vocabulário",
    "Aprendizagem",
    "Negócios",
    "Conversação",
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-light to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Blog & Knowledge Hub
            </h1>
            <p className="text-lg text-muted-foreground">
              Artigos, dicas e conteúdo acadêmico sobre ensino de inglês
            </p>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-12 bg-background">
        <div className="container">
          <Card className="border-2 border-primary/20 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <Badge className="mb-3 bg-primary text-white">Destaque</Badge>
                  <CardTitle className="text-2xl">{articles[0].title}</CardTitle>
                  <CardDescription className="mt-2">
                    {articles[0].excerpt}
                  </CardDescription>
                </div>
                <span className="text-4xl">{articles[0].image}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {articles[0].author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(articles[0].date).toLocaleDateString("pt-BR")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {articles[0].readTime}
                </span>
              </div>
              <Button className="bg-primary hover:bg-primary-hover text-white">
                Ler Artigo Completo
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container">
          <p className="text-sm font-semibold text-foreground mb-3">Categorias</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="bg-primary text-white">
              Todos
            </Button>
            {categories.map((category) => (
              <Button key={category} variant="outline" size="sm">
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.slice(1).map((article) => (
              <Card
                key={article.id}
                className="hover:shadow-lg transition-shadow flex flex-col cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <span className="text-3xl">{article.image}</span>
                    <Badge variant="outline">{article.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {article.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(article.date).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-primary text-primary hover:bg-primary/10"
                  >
                    Ler Mais
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary to-primary-hover text-white">
        <div className="container max-w-2xl">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold">
              Receba Novos Artigos por Email
            </h2>
            <p className="text-lg opacity-90">
              Inscreva-se para receber dicas, artigos e conteúdo exclusivo diretamente em sua caixa de entrada.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="seu@email.com"
                className="flex-1 px-4 py-2 rounded-lg text-foreground"
              />
              <Button className="bg-white text-primary hover:bg-light">
                Inscrever
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
