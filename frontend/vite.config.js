import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // permite acceder desde tu red o ngrok
    allowedHosts: ["6811da40ffb5.ngrok-free.app"], // dominio generado por ngrok
    port: 5173, // mismo puerto donde corre tu app
  },
});
