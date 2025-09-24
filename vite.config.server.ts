import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const configUrl = new URL(import.meta.url);
const rootDir = dirname(fileURLToPath(configUrl));
const serverEntry = fileURLToPath(new URL("./server/node-build.ts", configUrl));
const clientDir = fileURLToPath(new URL("./client", configUrl));
const sharedDir = fileURLToPath(new URL("./shared", configUrl));

// Server build configuration
export default defineConfig({
  build: {
    lib: {
      entry: serverEntry,
      name: "server",
      fileName: "production",
      formats: ["es"],
    },
    outDir: "dist/server",
    target: "node22",
    ssr: true,
    rollupOptions: {
      external: [
        // Node.js built-ins
        "fs",
        "path",
        "url",
        "http",
        "https",
        "os",
        "crypto",
        "stream",
        "util",
        "events",
        "buffer",
        "querystring",
        "child_process",
        // External dependencies that should not be bundled
        "express",
        "cors",
      ],
      output: {
        format: "es",
        entryFileNames: "[name].mjs",
      },
    },
    minify: false, // Keep readable for debugging
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": clientDir,
      "@shared": sharedDir,
    },
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
