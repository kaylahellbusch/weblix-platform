import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly expose the Vercel project variables to the Next.js bundle and proxy.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  },
  // Leave multipart overhead above the 1 MiB file limit checked in the action.
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
};

export default nextConfig;
