import { describe, expect, it } from "vitest";
import {
  CERTIFICATE_BUCKET,
  LEARNING_AUDIO_MAX_BYTES,
  SIGNED_CERTIFICATE_BUCKET,
  deleteCertificatePdfFiles,
  getCertificatePdfStorageTargets,
  validateLearningAudio,
} from "@/lib/learning-storage";

describe("storage de áudio educacional", () => {
  it("aceita formatos comuns de gravação", () => {
    expect(validateLearningAudio({ mimeType: "audio/webm", size: 1024 })).toEqual({ valid: true });
    expect(validateLearningAudio({ mimeType: "audio/mpeg", size: 1024 })).toEqual({ valid: true });
  });

  it("recusa formato não suportado e arquivo acima do limite", () => {
    expect(validateLearningAudio({ mimeType: "video/mp4", size: 1024 }).valid).toBe(false);
    expect(validateLearningAudio({ mimeType: "audio/webm", size: LEARNING_AUDIO_MAX_BYTES + 1 }).valid).toBe(false);
  });

  it("identifica somente os caminhos de certificados reconhecidos pela plataforma", () => {
    expect(
      getCertificatePdfStorageTargets({
        certificateUrl:
          "https://project.supabase.co/storage/v1/object/public/certificates/users/7/courses/3/original.pdf",
        signedPdfUrl: "admin/1/certificates/7/signed.pdf",
      })
    ).toEqual([
      { bucket: CERTIFICATE_BUCKET, objectPath: "users/7/courses/3/original.pdf" },
      { bucket: SIGNED_CERTIFICATE_BUCKET, objectPath: "admin/1/certificates/7/signed.pdf" },
    ]);
    expect(
      getCertificatePdfStorageTargets({
        certificateUrl: "https://example.org/documento.pdf",
        signedPdfUrl: "https://example.org/assinado.pdf",
      })
    ).toEqual([]);
  });

  it("não bloqueia a exclusão do registro quando um arquivo legado não pode ser removido", async () => {
    const result = await deleteCertificatePdfFiles(
      {
        certificateUrl:
          "https://project.supabase.co/storage/v1/object/public/certificates/external/abc/courses/3/original.pdf",
        signedPdfUrl: "admin/1/certificates/7/signed.pdf",
      },
      async target => {
        if (target.bucket === SIGNED_CERTIFICATE_BUCKET) {
          throw new Error("arquivo ausente");
        }
      }
    );

    expect(result).toEqual({ attempted: 2, removed: 1, failed: 1 });
  });
});
