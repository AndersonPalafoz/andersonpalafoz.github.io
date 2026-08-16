"use client";

import { useState } from "react";
import { Download, Lock } from "lucide-react";

export function DownloadMaterialButton({
  materialId,
  fileUrl: defaultFileUrl,
}: {
  materialId: number;
  fileUrl: string;
}) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/materials/${materialId}/download`, { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Acesso negado. Este material é pago e requer autorização do administrador ou compra confirmada.");
        setLoading(false);
        return;
      }

      // Progresso
      try {
        const progressResponse = await fetch(`/api/materials/${materialId}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: true }),
        });
        if (progressResponse.ok) {
          window.dispatchEvent(new CustomEvent("material-progress-updated", { detail: { materialId } }));
        }
      } catch {
        // Ignora erro de progresso
      }

      const targetUrl = data.fileUrl || defaultFileUrl;
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Erro ao baixar material:", err);
      setErrorMessage("Erro ao verificar autorização de download.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition disabled:opacity-50 shadow-md shadow-red-600/20"
      >
        <Download size={20} />
        {loading ? "Verificando Acesso..." : "Fazer Download Protegido"}
      </button>

      {errorMessage && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 px-4 py-2.5 rounded-xl text-xs font-semibold">
          <Lock size={15} className="shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
