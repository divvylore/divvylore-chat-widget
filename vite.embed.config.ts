import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Standalone loader build for drop-in script hosting
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/embed',
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/embed/loader.tsx'),
      name: 'DivvyloreChatLoader',
      fileName: () => 'divvylore-chat-loader.js',
      formats: ['iife'],
    },
    sourcemap: true,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
