import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: { '/api': 'http://localhost:5000' },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('react-dom') || id.includes('react-router')) return 'react-vendor';
          if (id.includes('chart.js') || id.includes('react-chartjs')) return 'chart-vendor';
          if (id.includes('react-hot-toast') || id.includes('zustand')) return 'ui-vendor';
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'axios'],
  },
});
