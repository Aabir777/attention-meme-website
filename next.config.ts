import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow LAN access to HMR in development (phones / other devices)
  allowedDevOrigins: ["192.168.1.2", "localhost", "127.0.0.1"],
  // Serve large GLB + media with long cache (immutable asset hashes in filenames when used)
  headers: async () => [
    {
      source: "/models/:path*",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        { key: "Content-Type", value: "model/gltf-binary" },
      ],
    },
    {
      source: "/mascot/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=86400, stale-while-revalidate=604800",
        },
      ],
    },
    {
      source: "/pfp-bg/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=604800, stale-while-revalidate=2592000",
        },
      ],
    },
  ],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
