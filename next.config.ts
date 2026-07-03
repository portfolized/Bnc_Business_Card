import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Canonicalize the domain: any request that arrives on a *.vercel.app host is
  // sent to bncsmartcard.com, keeping the same path/query. This runs before the
  // middleware and before NextAuth derives its base URL from the request host
  // (trustHost: true in auth.config.ts), so in-app redirects and OAuth callbacks
  // all stay on bncsmartcard.com instead of leaking the deployment URL.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        destination: "https://bncsmartcard.com/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
