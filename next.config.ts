import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serve large GLB without weird transforms
  headers: async () => [
    {
      source: "/models/:path*",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        { key: "Content-Type", value: "model/gltf-binary" },
      ],
    },
  ],
};

export default nextConfig;
