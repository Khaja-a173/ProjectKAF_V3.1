// server/index.ts
// ESM-safe environment loading + Fastify bootstrap (no TLA; safe for all Node runtimes)

import { config as loadEnv } from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve candidate .env locations (repo root and server folder)
const repoRoot = path.resolve(__dirname, "..");
const serverDir = __dirname;
const envCandidates = [
  path.join(repoRoot, ".env"),
  path.join(serverDir, ".env")
];

// Load the first existing .env file; if both exist, load repo root first then server to allow overrides
const existingEnvFiles = envCandidates.filter((p) => fs.existsSync(p));
if (existingEnvFiles.length) {
  // load in order, repo root first, then server/.env to allow local overrides
  for (const p of existingEnvFiles) {
    loadEnv({ path: p });
  }
} else {
  // Fallback: load default resolution if present
  loadEnv();
}

// --- Imports after env load ---
import Fastify from "fastify";
import cors from "@fastify/cors";         // @fastify/cors v8 (Fastify v4)
import sensible from "@fastify/sensible"; // @fastify/sensible v5 (Fastify v4)

import supabasePlugin from "./src/plugins/supabase";
import tenantRoutes from "./src/routes/tenants";

function start() {
  const app = Fastify({
    logger: true
  });

  // Health endpoint (namespaced)
  app.get("/_health", async () => ({ ok: true }));

  // Core plugins
  app.register(cors, { origin: true, credentials: true });
  app.register(sensible);

  // App plugins & routes
  app.register(supabasePlugin);
  app.register(tenantRoutes);

  // Diagnostics (only in non-production)
  app.ready((err) => {
    if (err) {
      app.log.error(err);
      return;
    }
    if (process.env.NODE_ENV !== "production") {
      const loaded = existingEnvFiles.length ? existingEnvFiles.join(", ") : "(default dotenv resolution)";
      app.log.info({ envFiles: loaded, SUPABASE_URL: process.env.SUPABASE_URL ? "***set***" : "missing" }, "Environment loaded");
      app.log.info("\n--- ROUTES ---\n" + app.printRoutes());
    }
  });

  const port = Number(process.env.PORT ?? 8080);
  const host = process.env.HOST ?? "0.0.0.0";

  app
    .listen({ port, host })
    .then(() => {
      app.log.info(`API listening on http://${host}:${port}`);
    })
    .catch((err) => {
      app.log.error(err);
      process.exit(1);
    });

  // Hardening: log unexpected async errors
  process.on("unhandledRejection", (reason) => {
    app.log.error({ reason }, "Unhandled promise rejection");
  });
  process.on("uncaughtException", (err) => {
    app.log.error(err, "Uncaught exception");
    process.exit(1);
  });
}

// Start server
start();