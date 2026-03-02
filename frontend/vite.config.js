// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      // Frontend calls /api/*, Vite proxies to backend service name "api"
      "/api": {
        target: "http://api:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});