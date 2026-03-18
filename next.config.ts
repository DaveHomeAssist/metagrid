import type { NextConfig } from "next";

const isGitHubPages =
  process.env.GITHUB_ACTIONS === "true" ||
  process.env.GITHUB_PAGES === "true" ||
  process.env.STATIC_EXPORT === "true";

const repoBasePath = "/metagrid";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: isGitHubPages ? repoBasePath : "",
  assetPrefix: isGitHubPages ? `${repoBasePath}/` : undefined,
};

export default nextConfig;
