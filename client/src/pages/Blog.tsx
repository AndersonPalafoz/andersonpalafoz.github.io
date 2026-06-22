import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

export default function Blog() {
  const { data: articles, isLoading, error } = trpc.articles.list.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Blog & Knowledge Hub</h1>
          <p className="text-muted-foreground mb-12">Artigos e insights sobre ensino de inglês</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader>
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-8 w-full mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Blog & Knowledge Hub</h1>
          <p className="text-red-500">Erro ao carregar artigos. Tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  const blogArticles = articles || [];

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Blog & Knowledge Hub</h1>
          <p className="text-muted-foreground">Artigos e insights sobre ensino de inglês, metodologia e desenvolvimento profissional</p>
        </div>

        {/* Articles Grid */}
        {blogArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum artigo disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogArticles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  {article.category && (
                    <Badge variant="secondary" className="w-fit mb-2">
                      {article.category}
                    </Badge>
                  )}
                  <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {article.content?.substring(0, 100) || "Sem descrição"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{article.published ? new Date(article.published).toLocaleDateString('pt-BR') : 'Data não definida'}</span>
                    </div>
                    {article.readingTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{article.readingTime} min de leitura</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
