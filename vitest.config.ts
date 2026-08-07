/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Separate from vite.config.ts so the production build is never affected.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // This suite is the frontend's only — the backend has its own vitest.config.ts,
    // its own node environment, and its own `npm test` in server/. Without this,
    // vitest's default file discovery also picks up server/src/**/*.test.ts and
    // tries to run Node-only, MongoDB-backed tests inside a jsdom environment.
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
