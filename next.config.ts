import type { NextConfig } from "next";
import { isIndexingEnabled } from "./src/lib/seo/indexing";

const indexingEnabled = isIndexingEnabled();

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Defense-in-depth: submission photos never pass through a Server
      // Action (they upload directly to S3 via presigned URLs — see
      // src/lib/submissions/upload-action.ts). If a future change
      // accidentally routes file bytes through a Server Action again,
      // this small explicit limit makes it fail fast and cheaply instead
      // of silently reintroducing the 413 this app hit before.
      bodySizeLimit: "256kb",
    },
  },
  async headers() {
    if (indexingEnabled) return [];

    // Defense-in-depth for non-production deployments (dev subdomain,
    // previews, local): robots.txt and the meta tag are advisory, some
    // crawlers ignore both, so also send the header on every response.
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
