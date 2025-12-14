import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: parseInt(env.VITE_PORT || "5173"),
      allowedHosts: ["scorpioid-municipal-maude.ngrok-free.dev"],
      host: true,
      // Allow CORS for development (accept requests from tunnel/ngrok origins)
      // `cors` accepts boolean or CorsOptions passed to the `cors` middleware.
      cors: {
        origin: true,
        credentials: true,
      },
      proxy: {
        "/api": "http://localhost:5000",
      },
    },
  };
});
