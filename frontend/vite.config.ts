import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target:
          "https://ddb4-2402-e280-231b-1dc-8cfd-bce6-1b83-1657.ngrok-free.app",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
