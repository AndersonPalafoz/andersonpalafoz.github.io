"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function EnrollButton({ courseId }: { courseId: number }) {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleEnroll = async () => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (response.status === 409) {
        setMessage("Você já está inscrito neste curso. Redirecionando...");
        setTimeout(() => router.push("/dashboard/cursos"), 1200);
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Falha ao se inscrever");
      }

      setMessage("Inscrição realizada com sucesso! Redirecionando...");
      setTimeout(() => router.push("/dashboard/cursos"), 1200);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao se inscrever");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleEnroll}
        disabled={loading || status === "loading"}
        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition disabled:opacity-50"
      >
        {loading ? "Inscrevendo..." : "Inscrever-se no Curso"}
      </button>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}
