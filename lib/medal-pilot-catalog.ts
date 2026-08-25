export type PilotMedalCategory = "achievement" | "academic" | "manual" | "streak";

export type PilotMedalDefinition = {
  code: string;
  title: string;
  description: string;
  icon: string;
  category: PilotMedalCategory;
  requirement: string;
};

/**
 * Catálogo inicial deliberadamente pequeno. Novos códigos só devem ser adicionados
 * após validação editorial e pedagógica, evitando concessões automáticas excessivas.
 */
export const PILOT_MEDALS: readonly PilotMedalDefinition[] = [
  {
    code: "primeiro-passo",
    title: "Primeiro Passo",
    description: "Reconhece a primeira aula concluída pelo aluno em um curso.",
    icon: "🚀",
    category: "achievement",
    requirement: "Concluir a primeira aula de um curso com progresso persistido.",
  },
  {
    code: "trilha-iniciada",
    title: "Trilha Iniciada",
    description: "Reconhece o início consistente de uma trilha de aprendizagem.",
    icon: "🧭",
    category: "achievement",
    requirement: "Concluir pelo menos 25% das aulas de um curso que possua aulas cadastradas.",
  },
  {
    code: "voz-em-pratica",
    title: "Voz em Prática",
    description: "Reconhece o envio de uma prática válida de speaking.",
    icon: "🎙️",
    category: "academic",
    requirement: "Enviar uma atividade de speaking com gravação válida registrada.",
  },
  {
    code: "participacao-destacada",
    title: "Participação Destacada",
    description: "Reconhece uma contribuição relevante observada pelo professor.",
    icon: "🌟",
    category: "manual",
    requirement: "Concessão manual por administrador com justificativa registrada.",
  },
  {
    code: "constancia-na-trilha",
    title: "Constância na Trilha",
    description: "Reconhece o compromisso contínuo do aluno com sua aprendizagem.",
    icon: "🔥",
    category: "streak",
    requirement: "Manter uma sequência de estudos registrada por pelo menos sete dias.",
  },
  {
    code: "explorador-do-vocabulario",
    title: "Explorador do Vocabulário",
    description: "Celebra a ampliação intencional do repertório lexical em inglês.",
    icon: "🗺️",
    category: "academic",
    requirement: "Concluir atividades de vocabulário em pelo menos três aulas do curso.",
  },
  {
    code: "mestre-da-gramatica",
    title: "Mestre da Gramática",
    description: "Reconhece a evolução na compreensão e aplicação de estruturas gramaticais.",
    icon: "🧠",
    category: "academic",
    requirement: "Alcançar média igual ou superior a 80% em duas atividades gramaticais.",
  },
  {
    code: "voz-confiante",
    title: "Voz Confiante",
    description: "Valoriza a coragem de praticar a comunicação oral em inglês.",
    icon: "🎧",
    category: "academic",
    requirement: "Enviar três práticas válidas de speaking com gravação registrada.",
  },
  {
    code: "escrita-em-destaque",
    title: "Escrita em Destaque",
    description: "Reconhece uma produção escrita cuidadosa e orientada por feedback.",
    icon: "✍️",
    category: "academic",
    requirement: "Concluir uma produção escrita avaliada pelo professor com feedback registrado.",
  },
  {
    code: "colaborador-da-turma",
    title: "Colaborador da Turma",
    description: "Reconhece atitudes de cooperação que fortalecem a aprendizagem coletiva.",
    icon: "🤝",
    category: "manual",
    requirement: "Concessão manual por administrador ou professor com justificativa registrada.",
  },
] as const;

export function getPilotMedal(code: string) {
  return PILOT_MEDALS.find((medal) => medal.code === code) ?? null;
}

export function isPilotMedalCode(code: string): boolean {
  return Boolean(getPilotMedal(code));
}

export const PILOT_MEDAL_CODES = PILOT_MEDALS.map((medal) => medal.code);
