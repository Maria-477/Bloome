import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the project root so a stray package-lock.json in a parent folder
  // (e.g. C:\\Users\\<you>) is ignored.
  turbopack: { root: process.cwd() },
};

export default nextConfig;
