import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import pkg from './package.json';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        splash: path.resolve(__dirname, 'splash.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/renderer/**/*.test.ts', 'tests/renderer/**/*.test.ts'],
  },
});
