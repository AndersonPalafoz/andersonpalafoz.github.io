import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // O preview gerenciado e o builder nativo do Vercel precisam compartilhar o diretório padrão.
  // Artefatos `.next` são ignorados pelo Git e nunca devem ser enviados ao repositório.
  distDir: ".next",
  // O indicador/devtools de segmentos do Next 15.5 pode gerar um Client Manifest inconsistente no preview gerenciado.
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75, 85],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com", pathname: "/**" },
      { protocol: "https", hostname: "img.youtube.com", pathname: "/vi/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
    ],
  },
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons"],
  },
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
        ],
      },
    ];
  },
  skipTrailingSlashRedirect: true,
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  // Disable static generation for error pages to avoid build issues
  staticPageGenerationTimeout: 120,
};

export default nextConfig;
