import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Permite que o build local use uma pasta própria sem sobrescrever o `.next` do preview.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // O indicador/devtools de segmentos do Next 15.5 pode gerar um Client Manifest inconsistente no preview gerenciado.
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons"],
    // O Next 15.5 pode ativar o Segment Explorer no preview; o módulo é incompatível com o bundle gerenciado atual.
    devtoolSegmentExplorer: false,
  },
  typescript: {
    tsconfigPath: "./tsconfig.json",
    ignoreBuildErrors: true,
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
