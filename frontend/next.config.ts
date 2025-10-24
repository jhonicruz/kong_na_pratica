import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Generate a standalone build so the Dockerfile can copy the standalone server
  output: "standalone",
  // (optional) other production-safe settings
  reactStrictMode: true,
};

export default nextConfig;
