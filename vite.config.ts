import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Vite build output (dist/) is what gets zipped and uploaded via the
// Longevity Peptides Content Manager WordPress plugin's SPA-takeover
// uploader — see wordpress-plugin/longevity-content-manager/includes/class-uploader.php.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
});
