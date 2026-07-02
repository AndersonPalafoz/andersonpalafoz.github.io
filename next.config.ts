import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
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
  },
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
};

export default nextConfig;
