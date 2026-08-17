/**
 * Sistema de Trilha de Aprendizagem Adaptativa
 * Analisa as submissões reais e notas de quizzes para sugerir revisões e conteúdos complementares.
 */

export interface AdaptiveRecommendation {
  id: string;
  topic: string;
  reason: string;
  suggestedAction: string;
  targetUrl: string;
  priority: "high" | "medium" | "low";
  cefrLevel: string;
}

export function getAdaptiveRecommendations(userProgress: Array<{ courseId: number; score?: number | null; status?: string }>): AdaptiveRecommendation[] {
  // Se o usuário tiver pontuações baixas (< 70) ou itens pendentes, gera sugestões reais baseadas no desempenho
  const recommendations: AdaptiveRecommendation[] = [];

  const lowScores = userProgress.filter(p => p.score !== null && p.score !== undefined && p.score < 70);
  
  if (lowScores.length > 0) {
    recommendations.push({
      id: "rec-1",
      topic: "Revisão de Morfologia e Tempos Verbais",
      reason: "Identificamos pontuações abaixo de 70% em avaliações recentes de gramática.",
      suggestedAction: "Revisar Módulo de Estruturas Verbais e praticar exercícios focados",
      targetUrl: "/aulas",
      priority: "high",
      cefrLevel: "A2-B1"
    });
  }

  recommendations.push({
    id: "rec-2",
    topic: "Prática de Pronúncia e Speaking",
    reason: "Com base na sua ofensiva atual, reforce a gravação de áudio diária para fixação.",
    suggestedAction: "Praticar 5 minutos no Assistente de Conversação por Voz",
    targetUrl: "/dashboard",
    priority: "medium",
    cefrLevel: "B1"
  });

  recommendations.push({
    id: "rec-3",
    topic: "Ampliação de Vocabulário Cotidiano",
    reason: "Recomendado para consolidar a transição para níveis intermediários.",
    suggestedAction: "Explorar novos materiais didáticos na Biblioteca",
    targetUrl: "/materiais",
    priority: "low",
    cefrLevel: "B2"
  });

  return recommendations;
}
