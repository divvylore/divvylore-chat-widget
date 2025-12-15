import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for the internal demo app
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'demo-dist',
    emptyOutDir: true,
  },
});
