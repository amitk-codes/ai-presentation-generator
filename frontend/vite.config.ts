import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// For local dev (`npm run dev`), proxy the same paths nginx handles in Docker,
// so the browser stays same-origin against the running backend containers.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/webhook": { target: "http://localhost:5678", changeOrigin: true },
      "/files": { target: "http://localhost:4000", changeOrigin: true },
    },
  },
});
