import { describe, expect, it } from "vitest";
import { BRAND_ASSET_URLS, BRAND_LOGO_OPTIONS } from "@/lib/brand-assets";

describe("ativos oficiais da marca", () => {
  it("mantém as variações oficiais em caminhos estáticos públicos", () => {
    expect(BRAND_ASSET_URLS.horizontal).toBe("/logo-horizontal.png");
    expect(BRAND_ASSET_URLS.vertical).toBe("/logo-principal.png");
    expect(BRAND_ASSET_URLS.principal).toBe("/logo-principal.png");
    expect(BRAND_ASSET_URLS.monochrome).toBe("/logo-monocromatica.png");
    expect(BRAND_ASSET_URLS.faviconLight).toBe("/favicon-v1.png");
    expect(BRAND_ASSET_URLS.faviconDark).toBe("/favicon-v1.png");
  });

  it("expõe opções nomeadas apontando para ativos públicos", () => {
    expect(BRAND_LOGO_OPTIONS).toHaveLength(3);
    expect(BRAND_LOGO_OPTIONS.every(option => option.url.startsWith("/"))).toBe(true);
    expect(BRAND_LOGO_OPTIONS.every(option => !option.url.includes("/home/"))).toBe(true);
  });
});
