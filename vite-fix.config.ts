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
          ? "ws://137.184.62.90:8080"
          : "ws://localhost:8080"),
    ),

    "import.meta.env.MODE": JSON.stringify(mode),
    "import.meta.env.DEV": mode === "development",
    "import.meta.env.PROD": mode === "production",
  },
  server: {
    host: mode === "production" ? "0.0.0.0" : "::",
    port: parseInt(process.env.PORT || "8080"),
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
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
    mode === "development" ? expressPlugin() : undefined,
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
              res.status(503).json({
                error:
                  "Server is still initializing, please try again in a moment",
                code: "SERVER_INITIALIZING",
              });
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
