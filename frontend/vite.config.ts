  import react from "@vitejs/plugin-react-swc";
  import path from "path";
  import { defineConfig } from "vite";

  // https://vitejs.dev/config/

  export default defineConfig(({ mode }) => ({
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: mode === 'development' ? {
        "/api": {
          target: "http://localhost:8000",
        },

      } : undefined,
    },

  }));
