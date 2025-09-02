// vitest.api.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    hookTimeout: 60_000,
    testTimeout: 60_000,
    include: ['tests/orders.spec.ts', 'tests/table-session.spec.ts'],
    setupFiles: ['tests/loadEnv.ts', 'tests/setupServer.ts'], // start server globally
    reporters: ['dot'],
    clearMocks: true,
  },
});