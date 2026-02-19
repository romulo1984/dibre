import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // No build SSR, substitui o Clerk pelo mock (estado "deslogado")
      ...(isSsrBuild
        ? { '@clerk/clerk-react': resolve(__dirname, './src/ssr/clerk-mock.tsx') }
        : {}),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
}))
