"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CheckCircle2, Loader2, PlayCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";

export function EnrollButton({
  courseId,
  isFree = true,
  price = 0,
  resumeLessonId = null,
}: {
  courseId: number;
  isFree?: boolean;
  price?: number | string | null;
  resumeLessonId?: number | null;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function checkEnrollment() {
      if (status !== "authenticated") {
        setChecking(false);
        return;
      }
      try {
        const res = await fetch("/api/enrollments");
        if (res.ok) {
          const data = await res.json();
          const list = data.enrollments || data;
          const found = Array.isArray(list) && list.some((item: any) => item.courseId === courseId || item.course?.id === courseId);
          setIsEnrolled(Boolean(found));
        }
      } catch (err) {
        console.error("Erro ao verificar matrículas:", err);
      } finally {
        setChecking(false);
      }
    }
    void checkEnrollment();
  }, [status, courseId]);

  const handleEnroll = async () => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      if (!isFree) {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId }),
        });
        const data = await response.json();
        if (response.status === 409 && data.enrolled) {
          setIsEnrolled(true);
          toast.info("Você já tem acesso a este curso.");
          return;
        }
        if (!response.ok) throw new Error(data.error || "Não foi possível iniciar o pagamento.");
        if (data.checkoutUrl) {
          toast.success("Abrindo checkout seguro do Stripe...");
          window.open(data.checkoutUrl, "_blank", "noopener,noreferrer");
        }
        return;
      }

      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (response.status === 409) {
        setIsEnrolled(true);
        toast.info("Você já está matriculado neste curso.");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Falha ao se inscrever");
      }

      setIsEnrolled(true);
      toast.success("Inscrição realizada com sucesso!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao se inscrever");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return <div className="h-12 w-40 bg-gray-100 rounded-xl animate-pulse" />;
  }

  if (isEnrolled) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-6 py-3 rounded-xl font-bold text-sm">
          <CheckCircle2 size={18} />
          <span>Matrícula Ativa neste Curso</span>
        </div>
        <Link
          href={resumeLessonId ? `/cursos/${courseId}/aulas/${resumeLessonId}` : `/cursos/${courseId}`}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold text-sm inline-flex items-center gap-2 transition shadow-md shadow-red-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          aria-label={resumeLessonId ? "Continuar na próxima aula pendente" : "Abrir o curso"}
        >
          <PlayCircle size={18} /> Continuar Assistindo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleEnroll}
        disabled={loading || status === "loading"}
        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-bold transition flex items-center gap-2 shadow-md shadow-red-600/20 disabled:opacity-50"
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        {isFree ? <span>Inscrever-se no Curso Gratuitamente</span> : <><CreditCard size={18} /><span>Comprar agora {Number(price) > 0 ? `• R$ ${Number(price).toFixed(2).replace(".", ",")}` : ""}</span></>}
      </button>
      {message && <p className="text-sm text-gray-600 font-medium">{message}</p>}
    </div>
  );
}
