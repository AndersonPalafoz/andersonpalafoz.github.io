import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Blog | Anderson Palafoz",
  description: "Artigos sobre ensino de inglês, linguística e educação.",
};

export default function BlogPage() {
  const artigos = [
    {
      id: 1,
      titulo: "Como Estudar Inglês Sozinho",
      categoria: "Dicas",
      tempo_leitura: "5 min",
      descricao: "Estratégias práticas para aprender inglês de forma independente.",
      data: "2024-01-15",
    },
    {
      id: 2,
      titulo: "Entendendo Phrasal Verbs",
      categoria: "Linguística",
      tempo_leitura: "8 min",
      descricao: "Guia completo sobre phrasal verbs e como usá-los corretamente.",
      data: "2024-01-10",
    },
    {
      id: 3,
      titulo: "A Importância da Pronúncia",
      categoria: "Ensino",
      tempo_leitura: "6 min",
      descricao: "Por que a pronúncia é fundamental para a comunicação efetiva.",
      data: "2024-01-05",
    },
  ];

  return (
    <div className="space-y-16">
      <section className="pt-32 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Blog & <span className="text-primary">Conhecimento</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Leia artigos sobre ensino de inglês, linguística e educação.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artigos.map((artigo) => (
              <div
                key={artigo.id}
                className="p-6 rounded-lg border border-border bg-card hover:bg-muted transition space-y-4"
              >
                <div className="flex justify-between items-start">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                    {artigo.categoria}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {artigo.tempo_leitura}
                  </span>
                </div>
                <h3 className="font-bold text-foreground text-lg">
                  {artigo.titulo}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {artigo.descricao}
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {new Date(artigo.data).toLocaleDateString("pt-BR")}
                  </span>
                  <Button variant="ghost" size="sm">
                    Ler →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
