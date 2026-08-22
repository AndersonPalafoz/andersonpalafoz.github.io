import { describe, expect, it } from "vitest";
import { BRAND_ASSET_URLS, BRAND_LOGO_OPTIONS } from "@/lib/brand-assets";

describe("ativos oficiais da marca", () => {
  it("mantém as seis variações publicadas no armazenamento persistente", () => {
    expect(BRAND_ASSET_URLS.horizontal).toBe("/manus-storage/logo-horizontal-v1_559f385e.png");
    expect(BRAND_ASSET_URLS.vertical).toBe("/manus-storage/logo-vertical_ebd4fea3.png");
    expect(BRAND_ASSET_URLS.principal).toBe("/manus-storage/logo-principal_0a8654fa.png");
    expect(BRAND_ASSET_URLS.monochrome).toBe("/manus-storage/logo-monocromatica_6feac532.png");
    expect(BRAND_ASSET_URLS.faviconLight).toBe("/manus-storage/favicon-v1_4e655c1f.png");
    expect(BRAND_ASSET_URLS.faviconDark).toBe("/manus-storage/favicon-v2_2d331d20.png");
  });

  it("expõe opções nomeadas sem caminhos locais do projeto", () => {
    expect(BRAND_LOGO_OPTIONS).toHaveLength(6);
    expect(BRAND_LOGO_OPTIONS.every(option => option.url.startsWith("/manus-storage/"))).toBe(true);
  });
});
