import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'next/navigation': path.resolve(import.meta.dirname, './src/compat/next-navigation.ts'),
      'next/headers': path.resolve(import.meta.dirname, './src/compat/next-headers.ts'),
      'next/server': path.resolve(import.meta.dirname, './src/compat/next-server.ts'),
      'next/font/google': path.resolve(import.meta.dirname, './src/compat/next-font.ts'),
      'next/link': path.resolve(import.meta.dirname, './src/compat/Link.tsx'),
      'next/image': path.resolve(import.meta.dirname, './src/compat/Image.tsx'),
      'next': path.resolve(import.meta.dirname, './src/compat/next.ts'),
      '@/src': path.resolve(import.meta.dirname, './src'),
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
