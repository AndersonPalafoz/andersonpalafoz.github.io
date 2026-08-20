import { describe, expect, it } from "vitest";
import { isSupportedLearningAudioUrl, resolveLessonAudioUrl } from "./lesson-media";

describe("lesson media", () => {
  it("prefers the lesson audio and falls back to the course audio", () => {
    expect(resolveLessonAudioUrl(" https://cdn.example.com/lesson.mp3 ", "https://cdn.example.com/course.mp3")).toBe("https://cdn.example.com/lesson.mp3");
    expect(resolveLessonAudioUrl("", "https://cdn.example.com/course.mp3")).toBe("https://cdn.example.com/course.mp3");
    expect(resolveLessonAudioUrl(null, null)).toBeNull();
  });

  it("accepts only http and https media URLs", () => {
    expect(isSupportedLearningAudioUrl("https://cdn.example.com/listening.mp3")).toBe(true);
    expect(isSupportedLearningAudioUrl("http://localhost:3000/audio.webm")).toBe(true);
    expect(isSupportedLearningAudioUrl("javascript:alert(1)")).toBe(false);
    expect(isSupportedLearningAudioUrl("not-a-url")).toBe(false);
  });
});
