import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config
export default defineConfig({
  root: 'src/renderer',
  base: './',
  plugins: [svelte(), tailwindcss()],
  test: {
    environment: 'jsdom',
    include: ['src/renderer/**/*.test.ts', 'tests/renderer/**/*.test.ts'],
  },
});