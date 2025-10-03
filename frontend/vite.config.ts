import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router", "react-router-dom"],
          ui: ["@chakra-ui/react", "@emotion/react", "@emotion/styled"],
          charts: ["recharts", "@chakra-ui/charts"],
          utils: ["axios", "yup", "@reduxjs/toolkit"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
