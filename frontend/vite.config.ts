import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      // Keep the initial bundle small: heavy chart/animation vendors load as
      // separate chunks instead of bloating the main entry (silences the
      // 500KB chunk-size warning and speeds up first paint).
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-charts': ['recharts', 'd3'],
            'vendor-motion': ['motion', 'gsap', '@gsap/react'],
          },
        },
      },
    },
  };
});
