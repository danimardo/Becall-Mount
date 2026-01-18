import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  test: {
    environment: 'jsdom',
    include: ['src/renderer/**/*.test.ts', 'tests/renderer/**/*.test.ts'],
  },
});
