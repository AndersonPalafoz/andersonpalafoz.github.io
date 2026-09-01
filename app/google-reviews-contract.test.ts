import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const route = readFileSync(new URL("./api/google-reviews/route.ts", import.meta.url), "utf8");
const page = readFileSync(new URL("./depoimentos/page.tsx", import.meta.url), "utf8");
const component = readFileSync(new URL("../components/google-reviews-section.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
const footer = readFileSync(new URL("../components/footer.tsx", import.meta.url), "utf8");

describe("Google reviews integration contract", () => {
  it("keeps the API key server-side and handles an unconfigured integration", () => {
    expect(route).toContain("process.env.GOOGLE_PLACES_API_KEY");
    expect(route).toContain("process.env.GOOGLE_PLACE_ID");
    expect(route).not.toContain("NEXT_PUBLIC_GOOGLE_PLACES_API_KEY");
    expect(route).toContain("configured: false");
    expect(route).toContain('"Cache-Control": "no-store"');
  });

  it("requests only the fields required by the reviews UI", () => {
    expect(route).toContain("X-Goog-FieldMask");
    expect(route).toContain("reviews,googleMapsUri");
    expect(route).toContain("languageCode=pt-BR");
  });

  it("exposes the public page, home preview, and footer navigation", () => {
    expect(page).toContain('title: "Depoimentos | Anderson Palafoz"');
    expect(page).toContain("Avaliar no Google");
    expect(page).toContain("GoogleReviewsSection");
    expect(home).toContain("<GoogleReviewsSection compact limit={3} />");
    expect(footer).toContain('["Depoimentos", "/depoimentos"]');
  });

  it("provides accessible loading, error, empty, and retry states", () => {
    expect(component).toContain('role="status"');
    expect(component).toContain("Tentar novamente");
    expect(component).toContain("Ainda não há depoimentos disponíveis");
    expect(component).toContain("aria-labelledby=\"google-reviews-heading\"");
  });
});
