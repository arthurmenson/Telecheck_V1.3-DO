import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Ensure environment variables are properly defined
  define: {
    "import.meta.env.VITE_WS_URL": JSON.stringify(
      process.env.VITE_WS_URL ||
        (mode === "production"
          ? "wss://telecheckhealth.com"
          : "ws://localhost:8080"),
    ),
    "import.meta.env.MODE": JSON.stringify(mode),
    "import.meta.env.DEV": mode === "development",
    "import.meta.env.PROD": mode === "production",
  },
  server: {
    host: mode === "production" ? "0.0.0.0" : "::",
    port: parseInt(process.env.PORT || "8080"),
    hmr: {
      overlay: false,
    },
    proxy:
      process.env.VITE_MODE === "SANDBOX"
        ? {
            "/api": {
              target: process.env.UAT_API || "https://api-uat.telecheck.health",
              changeOrigin: true,
              secure: true,
            },
          }
        : process.env.VITE_API_URL
          ? {
              "/api": {
                target: process.env.VITE_API_URL.replace("/api", ""),
                changeOrigin: true,
                secure: true,
              },
            }
          : undefined,
    fs: {
      allow: ["./client", "./shared", "./lib", "./mocks"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
    target: "es2022", // Support top-level await and modern JS features
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
          ],
        },
      },
    },
  },
  plugins: [
    react(), // Using standard React plugin instead of SWC
    mode === "development" &&
    process.env.VITE_MODE !== "MOCK" &&
    process.env.ENABLE_EXPRESS === "1"
      ? expressPlugin()
      : undefined,
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      // Lazy import to avoid database connections during build
      import("./server")
        .then(({ createServer }) => {
          let expressApp: any = null;

          // Initialize the Express app asynchronously
          createServer()
            .then((app) => {
              expressApp = app;
              console.log("✅ Express server initialized and ready");
            })
            .catch((error) => {
              console.error("❌ Failed to initialize Express server:", error);
            });

          // Add Express app as middleware to Vite dev server
          server.middlewares.use("/api", (req, res, next) => {
            if (expressApp) {
              expressApp(req, res, next);
            } else {
              // If Express app isn't ready yet, return a temporary response
              res.statusCode = 503;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error:
                    "Server is still initializing, please try again in a moment",
                  code: "SERVER_INITIALIZING",
                }),
              );
            }
          });

          // Also handle non-API requests that should go to Express
          server.middlewares.use((req, res, next) => {
            // Only handle requests that are not for static assets
            if (req.url?.startsWith("/api") && expressApp) {
              expressApp(req, res, next);
            } else {
              next();
            }
          });
        })
        .catch((error) => {
          console.error("❌ Failed to load server module:", error);
        });
    },
  };
}
