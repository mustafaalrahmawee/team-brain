import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Im Docker-Bind-Mount (WSL) kommen Dateiänderungen nicht zuverlässig als Events an
    watch: { usePolling: true },
    // Falls die SPA direkt über :5173 statt über nginx (:80) geöffnet wird
    proxy: {
      '/api': 'http://nginx',
      '/broadcasting': 'http://nginx',
    },
  },
})
