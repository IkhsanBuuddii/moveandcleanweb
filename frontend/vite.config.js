import { defineConfig } from 'vite'

// Vite config: proxy /api to local backend during development
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: false,
      },
    },
  },
})
