/**
 * Ativos oficiais da marca Anderson Palafoz.
 *
 * Estes caminhos apontam para arquivos publicados no armazenamento persistente
 * do webdev. Não recriar, converter ou redimensionar a arte fora do CSS;
 * preservar a proporção original em cada aplicação.
 */
const PERSISTENT_BRAND_ASSETS = {
  horizontal: "/manus-storage/logo-horizontal-v1_559f385e.png",
  vertical: "/manus-storage/logo-vertical_ebd4fea3.png",
  principal: "/manus-storage/logo-principal_0a8654fa.png",
  monochrome: "/manus-storage/logo-monocromatica_6feac532.png",
  faviconLight: "/manus-storage/favicon-v1_4e655c1f.png",
  faviconDark: "/manus-storage/favicon-v2_2d331d20.png",
} as const;

/**
 * O proxy /manus-storage é o caminho oficial em produção. O preview local
 * pode não expor esse proxy durante a inicialização; por isso, usamos somente
 * os arquivos legados já presentes como fallback de desenvolvimento.
 */
export const BRAND_ASSET_URLS = PERSISTENT_BRAND_ASSETS;

const DEVELOPMENT_FALLBACK_ASSETS = {
  horizontal: "/logo-horizontal.png",
  vertical: "/logo-principal.png",
  principal: "/logo-principal.png",
  monochrome: "/logo-principal.png",
  faviconLight: "/favicon.ico",
  faviconDark: "/favicon.ico",
} as const;

export const BRAND_ASSETS =
  process.env.NODE_ENV === "development"
    ? DEVELOPMENT_FALLBACK_ASSETS
    : PERSISTENT_BRAND_ASSETS;

export const BRAND_LOGO_OPTIONS = [
  {
    name: "Logo horizontal oficial",
    description: "Cabeçalho, rodapé e aplicações institucionais horizontais",
    url: PERSISTENT_BRAND_ASSETS.horizontal,
    previewUrl: BRAND_ASSETS.horizontal,
  },
  {
    name: "Logo principal vertical",
    description: "Capa, apresentações e aplicações com composição vertical",
    url: PERSISTENT_BRAND_ASSETS.principal,
    previewUrl: BRAND_ASSETS.principal,
  },
  {
    name: "Logo vertical compacta",
    description: "Espaços reduzidos e aplicações editoriais",
    url: PERSISTENT_BRAND_ASSETS.vertical,
    previewUrl: BRAND_ASSETS.vertical,
  },
  {
    name: "Logo monocromática",
    description: "Certificados e materiais didáticos",
    url: PERSISTENT_BRAND_ASSETS.monochrome,
    previewUrl: BRAND_ASSETS.monochrome,
  },
  {
    name: "Favicon vermelho",
    description: "Ícone para abas e favoritos em fundos claros",
    url: PERSISTENT_BRAND_ASSETS.faviconLight,
    previewUrl: BRAND_ASSETS.faviconLight,
  },
  {
    name: "Favicon alternativo",
    description: "Ícone alternativo para contextos de maior contraste",
    url: PERSISTENT_BRAND_ASSETS.faviconDark,
    previewUrl: BRAND_ASSETS.faviconDark,
  },
] as const;
