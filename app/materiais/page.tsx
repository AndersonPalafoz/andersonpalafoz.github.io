export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";


export const metadata = {
  title: "Materiais | Anderson Palafoz",
  description:
    "Biblioteca completa de materiais educacionais para aprender inglês.",
};

export default function MateriaisPage() {
  const materiais = [
    {
      id: 1,
      titulo: "Grammar Guide: Present Simple",
      nivel: "A1",
      categoria: "Gramática",
      descricao: "Guia completo sobre o Present Simple",
    },
    {
      id: 2,
      titulo: "Vocabulary: Food & Drinks",
      nivel: "A1",
      categoria: "Vocabulário",
      descricao: "Vocabulário essencial sobre comida e bebidas",
    },
    {
      id: 3,
      titulo: "Phrasal Verbs Workbook",
      nivel: "B1",
      categoria: "Exercícios",
      descricao: "Exercícios práticos com phrasal verbs",
    },
    {
      id: 4,
      titulo: "Advanced Writing Skills",
      nivel: "C1",
      categoria: "Escrita",
      descricao: "Técnicas avançadas de escrita em inglês",
    },
    {
      id: 5,
      titulo: "Listening Comprehension A2",
      nivel: "A2",
      categoria: "Listening",
      descricao: "Exercícios de compreensão auditiva",
    },
    {
      id: 6,
      titulo: "Conversation Practice B2",
      nivel: "B2",
      categoria: "Conversação",
      descricao: "Diálogos e prática de conversação",
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="pt-32 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Biblioteca de <span className="text-primary">Materiais</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Acesse uma biblioteca completa de recursos educacionais para
            potencializar seu aprendizado.
          </p>
        </div>
      </section>

      {/* Filtros */}
      <section className="py-8 px-4 md:px-8 lg:px-16 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              Todos
            </Button>
            {["A1", "A2", "B1", "B2", "C1", "C2"].map((nivel) => (
              <Button key={nivel} variant="outline" size="sm">
                {nivel}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de Materiais */}
      <section className="py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materiais.map((material) => (
              <div
                key={material.id}
                className="p-6 rounded-lg border border-border bg-card hover:bg-muted transition space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">
                      {material.titulo}
                    </h3>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold">
                    {material.nivel}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {material.descricao}
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {material.categoria}
                  </span>
                  <Button variant="ghost" size="sm">
                    Ver Mais →
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
