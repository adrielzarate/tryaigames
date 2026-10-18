import { defineConfig } from "vite";
import { realpathSync } from "node:fs";
import path from "node:path";
import { root } from "./scripts/paths";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { contentPlugin } from "./scripts/content-plugin";
export default defineConfig({
  base: "./",
  plugins: [react(), tailwind(), contentPlugin()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    fs: { allow: [root, realpathSync(path.join(root, "node_modules"))] },
  },
  build: { outDir: "dist" },
});
