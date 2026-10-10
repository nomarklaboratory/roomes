import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    localPatterns: [
      { pathname: "/thumbnails/**", search: "?v=1" },
      { pathname: "/thumbnails/**", search: "?v=2" },
      { pathname: "/thumbnails/**", search: "?v=3" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
