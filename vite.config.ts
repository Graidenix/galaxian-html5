import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@game': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // public/assets is copied verbatim; keep hashed bundle output separate.
    assetsDir: 'static',
  },
});
