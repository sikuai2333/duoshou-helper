import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const hasExplicitBasePath = process.env.NEXT_PUBLIC_BASE_PATH !== undefined;
const explicitBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const isUserSite = repositoryName.endsWith(".github.io");
const hasCustomDomain = fs.existsSync(path.join(process.cwd(), "public", "CNAME"));

const basePath =
  hasExplicitBasePath
    ? explicitBasePath
    : hasCustomDomain
      ? ""
      : process.env.GITHUB_ACTIONS === "true" && repositoryName && !isUserSite
    ? `/${repositoryName}`
        : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath || undefined,
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
