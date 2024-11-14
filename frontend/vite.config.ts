import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite({}), react()],
  resolve: {
    alias: {
      "@/share": path.resolve(__dirname, "../share"),
      "@": path.resolve(__dirname, "./src")
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:1000",
        changeOrigin: true,
      }
    }
  }
})
