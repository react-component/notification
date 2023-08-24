import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/tests/*.test.*'],
    globals: true,
    setupFiles: './vitest-setup.ts',
    environment: 'jsdom',
  },
});
