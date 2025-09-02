import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Helper for ESM-friendly path resolution
const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react()],

  // Path aliases used across the app (matches tsconfig.json)
  resolve: {
    alias: {
      '@': r('./src'),
    },
  },

  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: false,
  },

  server: {
  host: '0.0.0.0',
  port: 5173,
  proxy: {
    // Ensure the magic-link callback is handled by the React app, not proxied to the API
    '/auth/callback': {
      bypass(req) {
        if (req.url && req.url.startsWith('/auth/callback')) {
          return '/index.html';
        }
      },
    },
    // Forward UI requests to Fastify API (8090) during dev
    '/auth': {
      target: 'http://localhost:8090',
      changeOrigin: true,
    },
    '/tenants': {
      target: 'http://localhost:8090',
      changeOrigin: true,
    },
    '/analytics': {
      target: 'http://localhost:8090',
      changeOrigin: true,
    },
    '/qr': {
      target: 'http://localhost:8090',
      changeOrigin: true,
    },
    '/menu': {
      target: 'http://localhost:8090',
      changeOrigin: true,
    },
    '/cart': {
      target: 'http://localhost:8090',
      changeOrigin: true,
    },
    '/checkout': {
      target: 'http://localhost:8090',
      changeOrigin: true,
    },
    '/kds': {
      target: 'http://localhost:8090',
      changeOrigin: true,
    },
    '/receipts': {
      target: 'http://localhost:8090',
      changeOrigin: true,
    },
    '/orders': {
      target: 'http://localhost:8090',
      changeOrigin: true,
    },
    '/tables': {
      target: 'http://localhost:8090',
      changeOrigin: true,
    },
    '/payments': {
      target: 'http://localhost:8090',
      changeOrigin: true,
    },
    '/health': {
      target: 'http://localhost:8090',
      changeOrigin: true,
    },
  },
},

  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});