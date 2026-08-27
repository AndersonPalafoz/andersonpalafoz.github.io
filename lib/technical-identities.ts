export interface LearnerIdentity {
  email?: string | null;
  name?: string | null;
}

/**
 * Identifica somente registros técnicos e históricos que não representam uma
 * pessoa acompanhável em listas pedagógicas. Contas externas reais continuam
 * elegíveis quando possuem nome e e-mail reais.
 */
export function isTechnicalLearnerIdentity(identity: LearnerIdentity) {
  const email = identity.email?.trim().toLowerCase() || "";
  const name = identity.name?.trim().toLowerCase() || "";

  return (
    email.endsWith("@external.placeholder") ||
    email.startsWith("nao-cadastrado-") ||
    email === "andersonpalafozbackup@gmail.com" ||
    name.includes("teste docx")
  );
}
