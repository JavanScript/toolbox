import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      fs: "./lib/fs-browser-stub.js",
      "curlconverter/dist/src/shell/Parser.js": "./node_modules/curlconverter/dist/src/shell/webParser.js",
      "curlconverter/dist/src/shell/Parser.ts": "./node_modules/curlconverter/dist/src/shell/webParser.js",
      "curlconverter/dist/src/shell/Parser": "./node_modules/curlconverter/dist/src/shell/webParser.js",
    },
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      fs: path.resolve(__dirname, "lib/fs-browser-stub.js"),
      "curlconverter/dist/src/shell/Parser.js": path.resolve(
        __dirname,
        "node_modules/curlconverter/dist/src/shell/webParser.js"
      ),
      "curlconverter/dist/src/shell/Parser.ts": path.resolve(
        __dirname,
        "node_modules/curlconverter/dist/src/shell/webParser.js"
      ),
      "curlconverter/dist/src/shell/Parser": path.resolve(
        __dirname,
        "node_modules/curlconverter/dist/src/shell/webParser.js"
      ),
    };
    return config;
  },
};

export default nextConfig;
