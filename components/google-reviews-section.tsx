"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Quote, RefreshCw, Star } from "lucide-react";

type GoogleReview = {
  id: string;
  authorName: string;
  authorPhotoUri: string | null;
  authorUri: string | null;
  rating: number;
  comment: string;
  publishTime: string | null;
  relativePublishTimeDescription: string | null;
};

type GoogleReviewsPayload = {
  configured: boolean;
  place: {
    name: string;
    rating: number | null;
    userRatingCount: number | null;
    googleMapsUri: string;
  } | null;
  reviews: GoogleReview[];
  sourceUrl: string;
  message?: string;
};

type GoogleReviewsSectionProps = {
  compact?: boolean;
  limit?: number;
};

const FALLBACK_PROFILE_URL =
  "https://www.google.com/search?q=Anderson+Palafoz+Google+Maps";

function formatReviewDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatCount(value: number | null) {
  if (value === null || !Number.isFinite(value)) return null;
  return new Intl.NumberFormat("pt-BR").format(value);
}

function Stars({ rating, small = false }: { rating: number; small?: boolean }) {
  const roundedRating = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={small ? 14 : 18}
          strokeWidth={1.8}
          className={
            index < roundedRating
              ? "fill-amber-400 text-amber-400"
              : "text-slate-300 dark:text-slate-600"
          }
        />
      ))}
    </span>
  );
}

function ReviewCard({ review }: { review: GoogleReview }) {
  const date = formatReviewDate(review.publishTime);

  return (
    <article className="group flex h-full flex-col rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(15,23,42,0.1)] dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {review.authorPhotoUri ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={review.authorPhotoUri}
              alt=""
              width={44}
              height={44}
              referrerPolicy="no-referrer"
              className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-red-50 dark:ring-red-950/50"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-black text-red-700 dark:bg-red-950/60 dark:text-red-300"
            >
              {review.authorName.trim().charAt(0).toUpperCase() || "G"}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-900 dark:text-white">
              {review.authorName || "Avaliação do Google"}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {review.relativePublishTimeDescription || date || "Avaliação no Google"}
            </p>
          </div>
        </div>
        <Quote className="shrink-0 text-red-200 transition group-hover:text-red-400 dark:text-red-900 dark:group-hover:text-red-500" size={24} />
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Stars rating={review.rating} small />
        <span className="sr-only">Nota {review.rating} de 5 estrelas</span>
      </div>

      <p className="mt-4 flex-1 text-sm leading-7 text-slate-600 dark:text-slate-300">
        {review.comment || "Este avaliador deixou uma nota no Google."}
      </p>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          Google Maps
        </span>
        {date && <time className="text-xs text-slate-400 dark:text-slate-500">{date}</time>}
      </div>
    </article>
  );
}

export function GoogleReviewsSection({
  compact = false,
  limit = 3,
}: GoogleReviewsSectionProps) {
  const [data, setData] = useState<GoogleReviewsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadReviews() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/google-reviews", {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = (await response.json()) as GoogleReviewsPayload;
        if (!response.ok && payload.configured !== false) {
          throw new Error(payload.message || "Não foi possível carregar os depoimentos.");
        }
        if (active) setData(payload);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        if (active) {
          setData(null);
          setError("Os depoimentos estão temporariamente indisponíveis.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadReviews();
    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadToken]);

  const sourceUrl = data?.sourceUrl || FALLBACK_PROFILE_URL;
  const reviews = data?.reviews?.slice(0, compact ? Math.min(limit, 3) : limit) || [];
  const reviewCount = formatCount(data?.place?.userRatingCount ?? null);
  const rating = data?.place?.rating;
  const hasReviews = reviews.length > 0;

  return (
    <section
      id="depoimentos"
      aria-labelledby="google-reviews-heading"
      className={compact ? "public-section page-container py-20" : "page-container py-12 sm:py-16"}
    >
      <div className={compact ? "" : "mx-auto max-w-7xl"}>
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div className="max-w-xl">
            <span className="section-kicker">Experiências reais</span>
            <h2 id="google-reviews-heading" className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              O que os alunos dizem
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
              Depoimentos publicados no Google sobre a experiência de estudar com Anderson Palafoz.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {rating !== null && rating !== undefined ? rating.toFixed(1).replace(".", ",") : "—"}
                  </span>
                  <div>
                    <Stars rating={rating || 0} small />
                    <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      {reviewCount ? `${reviewCount} avaliações` : "Google Maps"}
                    </span>
                  </div>
                </div>
              </div>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-xs font-black text-slate-700 transition hover:-translate-y-0.5 hover:border-red-300 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-red-500 dark:hover:text-red-300"
              >
                Ver no Google <ArrowUpRight size={15} />
              </a>
            </div>
          </div>

          <div className="flex items-center justify-start gap-3 lg:justify-end">
            {loading && (
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400" role="status">
                Carregando depoimentos…
              </p>
            )}
            {!loading && error && (
              <div className="flex flex-wrap items-center gap-3" role="status">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{error}</p>
                <button
                  type="button"
                  onClick={() => setReloadToken((value) => value + 1)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-black text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:bg-white dark:text-slate-900 dark:hover:bg-red-100"
                >
                  <RefreshCw size={14} /> Tentar novamente
                </button>
              </div>
            )}
            {!loading && !error && !hasReviews && (
              <div className="max-w-md rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                Ainda não há depoimentos disponíveis para exibição. Você pode conhecer as avaliações diretamente no Google.
              </div>
            )}
          </div>
        </div>

        {!loading && !error && hasReviews && (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
          </div>
        )}

        <p className="mt-8 text-xs leading-5 text-slate-400 dark:text-slate-500">
          Conteúdo de avaliações fornecido pelo Google Maps. Os nomes e opiniões pertencem aos respectivos autores.
        </p>
      </div>
    </section>
  );
}
