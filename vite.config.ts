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
    mode === "development" && process.env.VITE_MODE === "MOCK"
      ? mockApiPlugin()
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

function mockApiPlugin(): Plugin {
  return {
    name: "mock-api-plugin",
    enforce: "pre",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api", async (req, res, next) => {
        try {
          const url = new URL(req.url || "", "http://localhost");
          const pathname = url.pathname;
          const method = (req.method || "GET").toUpperCase();
          res.setHeader("Content-Type", "application/json");

          // Labs
          if (method === "GET" && pathname === "/api/labs/results") {
            const chaos = url.searchParams.get("chaos");
            if (chaos === "1") {
              res.statusCode = Math.random() < 0.5 ? 500 : 401;
              return res.end(JSON.stringify({ message: "chaos" }));
            }
            return res.end(JSON.stringify({ results: [] }));
          }
          if (method === "POST" && pathname === "/api/labs/analyze") {
            const chaos = url.searchParams.get("chaos");
            if (chaos === "1") {
              res.statusCode = Math.random() < 0.5 ? 500 : 401;
              return res.end(JSON.stringify({ message: "chaos" }));
            }
            return res.end(JSON.stringify({ analysisId: "a1", status: "ok" }));
          }
          if (method === "POST" && pathname === "/api/analyze-lab") {
            const chaos = url.searchParams.get("chaos");
            if (chaos === "1") {
              res.statusCode = Math.random() < 0.5 ? 500 : 401;
              return res.end(JSON.stringify({ message: "chaos" }));
            }
            return res.end(JSON.stringify({ analysisId: "a1", status: "ok" }));
          }
          if (method === "GET" && pathname === "/api/labs/trends") {
            const chaos = url.searchParams.get("chaos");
            if (chaos === "1") {
              res.statusCode = Math.random() < 0.5 ? 500 : 401;
              return res.end(JSON.stringify({ message: "chaos" }));
            }
            return res.end(JSON.stringify({ series: [] }));
          }

          // Scheduling
          if (method === "GET" && pathname === "/api/ehr/scheduling/slots") {
            const chaos = url.searchParams.get("chaos");
            if (chaos === "1") {
              res.statusCode = Math.random() < 0.5 ? 500 : 401;
              return res.end(JSON.stringify({ message: "chaos" }));
            }
            return res.end(
              JSON.stringify({
                slots: [
                  {
                    id: "s1",
                    start: "2025-01-02T09:00:00Z",
                    end: "2025-01-02T09:30:00Z",
                  },
                ],
              }),
            );
          }
          if (method === "POST" && pathname === "/api/ehr/scheduling/book") {
            const chaos = url.searchParams.get("chaos");
            if (chaos === "1") {
              res.statusCode = Math.random() < 0.5 ? 500 : 401;
              return res.end(JSON.stringify({ message: "chaos" }));
            }
            return res.end(JSON.stringify({ id: "apt1", status: "booked" }));
          }
          if (
            method === "POST" &&
            pathname.match(/^\/api\/ehr\/scheduling\/.+\/(cancel|reschedule)$/)
          ) {
            const id = pathname.split("/").slice(-2)[0];
            const action = pathname.split("/").pop();
            const chaos = url.searchParams.get("chaos");
            if (chaos === "1") {
              res.statusCode = Math.random() < 0.5 ? 500 : 401;
              return res.end(JSON.stringify({ message: "chaos" }));
            }
            const status = action === "cancel" ? "canceled" : "rescheduled";
            return res.end(JSON.stringify({ id, status }));
          }

          // Medications
          if (method === "GET" && pathname === "/api/medications/search") {
            const q = url.searchParams.get("q")?.toLowerCase() || "";
            if (q.includes("lipitor")) {
              return res.end(
                JSON.stringify({
                  items: [
                    { id: "lipitor", name: "Lipitor", generic: "atorvastatin" },
                  ],
                  q,
                }),
              );
            }
            return res.end(JSON.stringify({ items: [], q }));
          }

          // RPM minimal endpoints
          if (method === "GET" && pathname === "/api/vitals") {
            return res.end(JSON.stringify({ items: [] }));
          }
          if (method === "GET" && pathname === "/api/vitals/trends") {
            return res.end(
              JSON.stringify({ series: [{ name: "glucose", data: [] }] }),
            );
          }

          return next();
        } catch (e) {
          return next();
        }
      });
    },
  };
}
