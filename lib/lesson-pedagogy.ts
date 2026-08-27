export type LessonPedagogy = {
  learningObjectives: string[];
  evidenceOfLearning: string[];
};

const PEDAGOGY_PREFIX = "<!-- ap-lesson-pedagogy:";
const PEDAGOGY_SUFFIX = " -->";
const MAX_ITEMS_PER_LIST = 6;
const MAX_ITEM_LENGTH = 180;

const emptyPedagogy = (): LessonPedagogy => ({
  learningObjectives: [],
  evidenceOfLearning: [],
});

function normalizeText(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/-->/g, "—>")
    .trim()
    .slice(0, MAX_ITEM_LENGTH);
}

function normalizeList(value: unknown): string[] {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/\r?\n/)
      : [];

  return Array.from(
    new Set(
      values
        .filter((item): item is string => typeof item === "string")
        .map(normalizeText)
        .filter(Boolean)
    )
  ).slice(0, MAX_ITEMS_PER_LIST);
}

export function normalizeLessonPedagogy(value: unknown): LessonPedagogy {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};

  return {
    learningObjectives: normalizeList(record.learningObjectives),
    evidenceOfLearning: normalizeList(record.evidenceOfLearning),
  };
}

function metadataMatch(content: string) {
  return content.match(/<!-- ap-lesson-pedagogy:([\s\S]*?) -->/);
}

export function getLessonPedagogy(content?: string | null): LessonPedagogy {
  if (!content) return emptyPedagogy();
  const match = metadataMatch(content);
  if (!match?.[1]) return emptyPedagogy();

  try {
    return normalizeLessonPedagogy(JSON.parse(match[1]));
  } catch {
    return emptyPedagogy();
  }
}

export function getLessonBody(content?: string | null) {
  return content ? content.replace(metadataMatch(content)?.[0] || "", "").trim() : "";
}

export function hasLessonPedagogy(pedagogy: LessonPedagogy) {
  return pedagogy.learningObjectives.length > 0 || pedagogy.evidenceOfLearning.length > 0;
}

export function withLessonPedagogy(content: string | null | undefined, value: unknown) {
  const pedagogy = normalizeLessonPedagogy(value);
  const body = getLessonBody(content);
  if (!hasLessonPedagogy(pedagogy)) return body;

  const metadata = `${PEDAGOGY_PREFIX}${JSON.stringify(pedagogy)}${PEDAGOGY_SUFFIX}`;
  return body ? `${body}\n\n${metadata}` : metadata;
}
