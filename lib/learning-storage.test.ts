import { describe, expect, it } from "vitest";
import { validateLearningAudio, LEARNING_AUDIO_MAX_BYTES } from "@/lib/learning-storage";

describe("storage de áudio educacional", () => {
  it("aceita formatos comuns de gravação", () => {
    expect(validateLearningAudio({ mimeType: "audio/webm", size: 1024 })).toEqual({ valid: true });
    expect(validateLearningAudio({ mimeType: "audio/mpeg", size: 1024 })).toEqual({ valid: true });
  });

  it("recusa formato não suportado e arquivo acima do limite", () => {
    expect(validateLearningAudio({ mimeType: "video/mp4", size: 1024 }).valid).toBe(false);
    expect(validateLearningAudio({ mimeType: "audio/webm", size: LEARNING_AUDIO_MAX_BYTES + 1 }).valid).toBe(false);
  });
});
