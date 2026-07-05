import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  server: {
    proxy: {
      '/api': 'http://localhost:8901',
      '/logout': 'http://localhost:8901',
      '/login': 'http://localhost:8901',
      '/css': 'http://localhost:8901',
      '/fonts': 'http://localhost:8901',
      '/images': 'http://localhost:8901',
      '/favicon.png': 'http://localhost:8901',
    },
  },
  build: {
    outDir: '../public/app',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/main.js',
      output: {
        entryFileNames: 'notes.js',
        assetFileNames: 'notes.[ext]',
      },
    },
  },
});
