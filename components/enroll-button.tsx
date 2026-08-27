"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, Loader2, PlayCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { enrollInCourse, startCourseCheckout } from "@/lib/course-offer-client";
import { CourseOfferApiError } from "@/lib/course-offer-types";
import { isCourseOffersEnabled } from "@/lib/course-offer-feature";

type CourseOfferOption = {
  id: number;
  offerName: string;
  academicTerm: string;
  institution?: string | null;
  modality?: string | null;
  classDays?: string | null;
  classTime?: string | null;
  status?: string | null;
  deletedAt?: string | Date | null;
};

type EnrollmentRecord = {
  courseId?: number | null;
  offerId?: number | null;
  courseOfferId?: number | null;
  offerIds?: number[];
  status?: string | null;
  course?: { id?: number | null } | null;
};

export function EnrollButton({
  courseId,
  isFree = true,
  price = 0,
  resumeLessonId = null,
  offers = [],
  offerId: initialOfferId = null,
  requireOfferSelection = offers.length > 0,
}: {
  courseId: number;
  isFree?: boolean;
  price?: number | string | null;
  resumeLessonId?: number | null;
  /** Ofertas/coortes ativas já carregadas pelo Server Component pai. */
  offers?: CourseOfferOption[];
  /** Oferta pré-selecionada pelo contexto da página ou por query string. */
  offerId?: number | null;
  /** Quando há ofertas, impede matrícula sem uma oferta escolhida. */
  requireOfferSelection?: boolean;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(initialOfferId);

  const offersEnabled = isCourseOffersEnabled({ hasOffers: offers.length > 0 });
  const availableOffers = useMemo(
    () => offersEnabled
      ? offers.filter((offer) => !offer.deletedAt && !["archived", "closed", "cancelled"].includes(String(offer.status ?? "").toLowerCase()))
      : [],
    [offers, offersEnabled]
  );
  const selectedOffer = availableOffers.find((offer) => offer.id === selectedOfferId) ?? null;
  const hasOfferContext = availableOffers.length > 0;

  useEffect(() => {
    if (initialOfferId && availableOffers.some((offer) => offer.id === initialOfferId)) {
      setSelectedOfferId(initialOfferId);
    } else if (selectedOfferId && !availableOffers.some((offer) => offer.id === selectedOfferId)) {
      setSelectedOfferId(null);
    }
  }, [availableOffers, initialOfferId, selectedOfferId]);

  useEffect(() => {
    async function checkEnrollment() {
      if (status !== "authenticated") {
        setChecking(false);
        return;
      }
      try {
        const res = await fetch("/api/enrollments", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const list: EnrollmentRecord[] = Array.isArray(data) ? data : data.enrollments || [];
          const found = list.some((item) => {
            const sameCourse = item.courseId === courseId || item.course?.id === courseId;
            if (!sameCourse) return false;
            if (!selectedOfferId) return true;
            return item.offerId === selectedOfferId || item.courseOfferId === selectedOfferId || item.offerIds?.includes(selectedOfferId) === true;
          });
          setIsEnrolled(Boolean(found));
        }
      } catch (err) {
        console.error("Erro ao verificar matrículas:", err);
      } finally {
        setChecking(false);
      }
    }
    void checkEnrollment();
  }, [status, courseId, selectedOfferId]);

  const handleEnroll = async () => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;
    if (requireOfferSelection && hasOfferContext && !selectedOfferId) {
      setMessage("Selecione uma oferta/coorte antes de continuar.");
      toast.error("Selecione uma oferta antes de continuar.");
      return;
    }

    const enrollmentPayload = {
      courseId,
      ...(selectedOfferId ? { offerId: selectedOfferId } : {}),
    };

    try {
      setLoading(true);
      setMessage(null);
      if (!isFree) {
        const data = await startCourseCheckout(enrollmentPayload);
        if (data.enrolled) {
          setIsEnrolled(true);
          toast.info("Você já tem acesso a este curso.");
          return;
        }
        if (data.checkoutUrl) {
          toast.success("Abrindo checkout seguro do Stripe...");
          window.open(data.checkoutUrl, "_blank", "noopener,noreferrer");
        }
        return;
      }

      await enrollInCourse(enrollmentPayload);
      setIsEnrolled(true);
      toast.success(selectedOffer ? "Matrícula realizada na oferta com sucesso!" : "Inscrição realizada com sucesso!");
      router.refresh();
    } catch (err) {
      if (err instanceof CourseOfferApiError && err.status === 409) {
        setIsEnrolled(true);
        toast.info(isFree ? "Você já está matriculado nesta oferta." : "Você já tem acesso a este curso.");
        return;
      }
      toast.error(err instanceof Error ? err.message : "Erro ao se inscrever");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return <div className="h-12 w-40 animate-pulse rounded-xl bg-gray-100" aria-label="Verificando matrícula" />;
  }

  if (isEnrolled) {
    return (
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-bold text-emerald-700">
          <CheckCircle2 size={18} />
          <span>{selectedOffer ? "Matrícula Ativa nesta Oferta" : "Matrícula Ativa neste Curso"}</span>
        </div>
        <Link
          href={resumeLessonId ? `/cursos/${courseId}/aulas/${resumeLessonId}${selectedOfferId ? `?offerId=${selectedOfferId}` : ""}` : `/cursos/${courseId}${selectedOfferId ? `?offerId=${selectedOfferId}` : ""}`}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          aria-label={resumeLessonId ? "Continuar na próxima aula pendente" : "Abrir o curso"}
        >
          <PlayCircle size={18} /> Continuar Assistindo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hasOfferContext && (
        <div className="space-y-2">
          <label htmlFor={`course-offer-${courseId}`} className="text-xs font-black uppercase tracking-wide text-gray-600">
            Escolha a oferta ou turma
          </label>
          <div className="relative">
            <select
              id={`course-offer-${courseId}`}
              value={selectedOfferId ?? ""}
              onChange={(event) => setSelectedOfferId(event.target.value ? Number(event.target.value) : null)}
              disabled={loading}
              className="min-h-12 w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-11 text-sm font-semibold text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              aria-describedby={message ? `course-offer-message-${courseId}` : undefined}
            >
              <option value="">Selecione uma oferta</option>
              {availableOffers.map((offer) => (
                <option key={offer.id} value={offer.id}>
                  {offer.offerName} · {offer.academicTerm}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} aria-hidden="true" />
          </div>
          {selectedOffer && (
            <p className="text-xs leading-5 text-gray-600">
              {[selectedOffer.institution, selectedOffer.modality, selectedOffer.classDays, selectedOffer.classTime].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={handleEnroll}
        disabled={loading || status === "loading" || (requireOfferSelection && hasOfferContext && !selectedOfferId)}
        className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-red-600 px-8 py-3.5 font-bold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
        {!loading && !isFree && <CreditCard size={18} aria-hidden="true" />}
        {isFree ? <span>Inscrever-se no Curso Gratuitamente</span> : <span>Comprar agora {Number(price) > 0 ? `• R$ ${Number(price).toFixed(2).replace(".", ",")}` : ""}</span>}
      </button>
      {message && <p id={`course-offer-message-${courseId}`} className="text-sm font-medium text-red-700" role="alert">{message}</p>}
    </div>
  );
}
