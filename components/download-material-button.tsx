"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export function DownloadMaterialButton({
  materialId,
  fileUrl,
}: {
  materialId: number;
  fileUrl: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await fetch(`/api/materials/${materialId}/download`, { method: "POST" });
    } catch {
      // mesmo se o contador falhar, ainda deixamos o usuario acessar o arquivo
    } finally {
      setLoading(false);
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition disabled:opacity-50"
    >
      <Download size={20} />
      {loading ? "Abrindo..." : "Fazer Download"}
    </button>
  );
}
