import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// The app lives in a workspace subdirectory. Explicitly load the app-scoped
// env files before Next evaluates proxy/server modules in that workspace.
loadEnvConfig(process.cwd());

const nextConfig: NextConfig = {
  // Leave multipart overhead above the 1 MiB file limit checked in the action.
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
};

export default nextConfig;
