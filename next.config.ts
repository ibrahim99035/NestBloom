import type { NextConfig } from "next";

// NextAuth v4 falls back to http://localhost:3000 when NEXTAUTH_URL is not
// set, which breaks cookies and redirects in production. Vercel exposes the
// canonical domain at build time, so use it as a fallback.
const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : undefined;

const nextConfig: NextConfig = {
  env: {
    ...(process.env.NEXTAUTH_URL
      ? { NEXTAUTH_URL: process.env.NEXTAUTH_URL }
      : productionUrl
        ? { NEXTAUTH_URL: productionUrl }
        : {}),
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
