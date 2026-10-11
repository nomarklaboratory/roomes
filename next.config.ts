import type { NextConfig } from "next";
import { withCn } from "cn/next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    localPatterns: [
      { pathname: "/product-media/**", search: "" },
      { pathname: "/thumbnails/**", search: "?v=1" },
      { pathname: "/thumbnails/**", search: "?v=2" },
      { pathname: "/thumbnails/**", search: "?v=3" },
      { pathname: "/thumbnails/**", search: "?v=4" },
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

export default withCn(nextConfig, {
  content: ["{app,components,hooks,lib,types}/**/*.{ts,tsx}"],
  out: "lib/cn-tables.ts",
});
