/**
 * Ativos oficiais da marca Anderson Palafoz.
 * Usamos caminhos locais em / para garantir carregamento imediato e infalível
 * em qualquer ambiente (desenvolvimento, staging ou produção).
 */
export const BRAND_ASSETS = {
  horizontal: "/logo-horizontal.png",
  vertical: "/logo-principal.png",
  principal: "/logo-principal.png",
  monochrome: "/logo-monocromatica.png",
  faviconLight: "/favicon-v1.png",
  faviconDark: "/favicon-v1.png",
} as const;

export const BRAND_ASSET_URLS = BRAND_ASSETS;

export const BRAND_LOGO_OPTIONS = [
  {
    name: "Logo horizontal oficial",
    description: "Cabeçalho, rodapé e aplicações institucionais horizontais",
    url: BRAND_ASSETS.horizontal,
    previewUrl: BRAND_ASSETS.horizontal,
  },
  {
    name: "Logo principal vertical",
    description: "Capa, apresentações e aplicações com composição vertical",
    url: BRAND_ASSETS.principal,
    previewUrl: BRAND_ASSETS.principal,
  },
  {
    name: "Logo monocromática",
    description: "Versão oficial para documentos e impressos em escala de cinza",
    url: BRAND_ASSETS.monochrome,
    previewUrl: BRAND_ASSETS.monochrome,
  },
];
