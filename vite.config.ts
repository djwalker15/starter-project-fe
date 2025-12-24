import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000", // or wherever your backend runs locally
        changeOrigin: true,
      },
      "/info": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  preview: { port: 4173 },
  test: {
    environment: "jsdom",        // DOM APIs for React Testing Library
    globals: true,                // provide global expect/describe/it
    setupFiles: ["./src/setupTests.ts"], // load jest-dom & matchers
    css: true,                    // allow importing CSS in components
  },
});
