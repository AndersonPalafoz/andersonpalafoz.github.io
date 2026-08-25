export interface SimalGradeInput {
  assessmentTitle?: string | null;
  assessmentType?: string | null;
  assessmentComponent?: string | null;
  score: string | number | null | undefined;
  maxScore: string | number | null | undefined;
  createdAt?: string | Date | null;
}

export interface SimalCompositeGrade {
  isSimal: boolean;
  proofScore: number | null;
  presentationScore: number | null;
  finalScore: number | null;
  proofMax: 8;
  presentationMax: 2;
  totalMax: 10;
  complete: boolean;
  missingProof: boolean;
  missingPresentation: boolean;
}

const PROOF_MAX = 8 as const;
const PRESENTATION_MAX = 2 as const;
const TOTAL_MAX = 10 as const;

function numberValue(value: string | number | null | undefined) {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalized(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function isPresentation(grade: SimalGradeInput) {
  const component = normalized(grade.assessmentComponent);
  const type = normalized(grade.assessmentType);
  const title = normalized(grade.assessmentTitle);
  return component === "presentation" || type === "presentation" || title.includes("presentation") || title.includes("apresentacao");
}

function isSimal(grade: SimalGradeInput) {
  const type = normalized(grade.assessmentType);
  const title = normalized(grade.assessmentTitle);
  const component = normalized(grade.assessmentComponent);
  return type === "written" || type === "oral" || type === "presentation" || component === "presentation" || title.includes("simal");
}

function latestBy<T extends SimalGradeInput>(grades: T[], predicate: (grade: T) => boolean) {
  return grades.filter(predicate).sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  })[0];
}

function scoreInPoints(grade: SimalGradeInput, fallbackMax: number) {
  const score = numberValue(grade.score);
  const maxScore = numberValue(grade.maxScore) || fallbackMax;
  if (score === null || maxScore <= 0) return null;
  return Math.max(0, Math.min(fallbackMax, (score / maxScore) * fallbackMax));
}

export function calculateSimalComposite(grades: readonly SimalGradeInput[]): SimalCompositeGrade {
  const simalGrades = grades.filter(isSimal);
  const presentation = latestBy(simalGrades, isPresentation);
  const proofTotal = latestBy(simalGrades, (grade) => !isPresentation(grade) && normalized(grade.assessmentComponent) === "total");
  const proofComponents = simalGrades.filter((grade) => !isPresentation(grade) && normalized(grade.assessmentComponent) !== "total");
  const proof = proofTotal
    ? scoreInPoints(proofTotal, PROOF_MAX)
    : proofComponents.length > 0
      ? proofComponents.reduce((sum, grade) => sum + (scoreInPoints(grade, numberValue(grade.maxScore) || 0) || 0), 0)
      : null;
  const presentationScore = presentation ? scoreInPoints(presentation, PRESENTATION_MAX) : null;
  const proofScore = proof === null ? null : Math.min(PROOF_MAX, proof);
  const complete = proofScore !== null && presentationScore !== null;

  return {
    isSimal: simalGrades.length > 0,
    proofScore,
    presentationScore,
    finalScore: complete ? Math.min(TOTAL_MAX, proofScore + presentationScore) : null,
    proofMax: PROOF_MAX,
    presentationMax: PRESENTATION_MAX,
    totalMax: TOTAL_MAX,
    complete,
    missingProof: proofScore === null,
    missingPresentation: presentationScore === null,
  };
}
