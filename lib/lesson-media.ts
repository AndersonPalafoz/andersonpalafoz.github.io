export function resolveLessonAudioUrl(lessonAudioUrl?: string | null, courseAudioUrl?: string | null) {
  const lessonUrl = lessonAudioUrl?.trim();
  if (lessonUrl) return lessonUrl;
  const courseUrl = courseAudioUrl?.trim();
  return courseUrl || null;
}

export function isSupportedLearningAudioUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
