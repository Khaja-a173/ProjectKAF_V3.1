import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['dot'],
    hookTimeout: 30_000,
    testTimeout: 30_000,
    include: ['tests/ui/**/*.spec.ts', 'tests/ui/**/*.spec.tsx'],
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'http://localhost' } },
    setupFiles: ['tests/loadEnv.ts', 'tests/ui/setupJSDOM.ts'],
    clearMocks: true,
  },
});