import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const deployBase = process.env.VITE_DEPLOY_BASE || "/";

export default defineConfig({
  base: deployBase,
  plugins: [react()],
  build: {
    outDir: "pages-dist",
    emptyOutDir: true,
  },
});
