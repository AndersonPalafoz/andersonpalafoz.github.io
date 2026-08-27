export type CourseOfferFeatureContext = {
  enabled?: boolean | null;
  hasOffers?: boolean;
};

/**
 * A flag pública só controla exposição de UI; autorização continua no servidor.
 * O fallback por ofertas mantém a primeira etapa compatível com páginas já integradas.
 */
export function isCourseOffersEnabled(context: CourseOfferFeatureContext = {}): boolean {
  if (typeof context.enabled === "boolean") return context.enabled;
  if (process.env.NEXT_PUBLIC_COURSE_OFFERS_ENABLED === "true") return true;
  if (process.env.NEXT_PUBLIC_COURSE_OFFERS_ENABLED === "false") return false;
  return context.hasOffers === true;
}
