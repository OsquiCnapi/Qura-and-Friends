import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Los paquetes internos se consumen como fuente TS; Next los transpila.
  transpilePackages: [
    "@quantum-party/quantum-engine",
    "@quantum-party/game-core",
    "@quantum-party/quantum-viz",
    "@quantum-party/curriculum",
    "@quantum-party/schemas",
    "@quantum-party/ui",
  ],
  // Los imports usan extensión ".js" (estilo ESM/verbatimModuleSyntax). Enseñamos a webpack a
  // resolverla como fuente ".ts/.tsx" (usar `next dev`/`next build`, que van por webpack).
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".jsx": [".tsx", ".jsx"],
    };
    return config;
  },
};

export default withNextIntl(nextConfig);
