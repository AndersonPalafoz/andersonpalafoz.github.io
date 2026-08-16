export type OrderedEntity = { id: number; order: number };

export function reindexEntities<T extends { id: number }>(entities: T[], orderedIds: number[]) {
  const byId = new Map(entities.map((entity) => [entity.id, entity]));
  return orderedIds.map((id, index) => {
    const entity = byId.get(id);
    if (!entity) return null;
    return { ...entity, order: index + 1 };
  }).filter((entity): entity is T & OrderedEntity => entity !== null);
}

export function isCompleteOrder(orderedIds: number[], existingIds: number[]) {
  if (orderedIds.length !== existingIds.length) return false;
  const expected = new Set(existingIds);
  if (new Set(orderedIds).size !== orderedIds.length) return false;
  return orderedIds.every((id) => Number.isInteger(id) && id > 0 && expected.has(id));
}

export function isMaterialLinkedToLesson(material: { courseId?: number | null; lessonId?: number | null }, lesson: { courseId: number; id: number }) {
  return material.courseId === lesson.courseId && material.lessonId === lesson.id;
}
