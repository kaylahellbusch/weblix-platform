import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Leave multipart overhead above the 1 MiB file limit checked in the action.
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
};

export default nextConfig;
