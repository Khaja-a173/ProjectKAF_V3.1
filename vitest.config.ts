// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  // Make Vite/Vitest resolve our path aliases used across the app
  resolve: {
    alias: {
      '@': r('./src'),              // Frontend alias used in UI code
      '@server': r('./server/src'), // Optional: server alias if used in tests
    },
  },

  // Ensure TSX/JSX compiles the same as the app (React automatic runtime)
  esbuild: {
    jsx: 'automatic',
  },

  test: {
    reporters: ['dot'],
    hookTimeout: 30_000,
    testTimeout: 30_000,
    include: ['tests/**/*.spec.ts', 'tests/**/*.spec.tsx'],
    // Default to node, override to jsdom for UI tests via glob
    environment: 'node',
    environmentMatchGlobs: [
      ['tests/ui/**', 'jsdom'],
    ],
    environmentOptions: { jsdom: { url: 'http://localhost' } },
    // Use a single lightweight setup; test files can import extras if needed
    setupFiles: ['tests/loadEnv.ts'],
    isolate: true,
    clearMocks: true,
  },
});