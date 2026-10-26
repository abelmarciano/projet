// Build autonome (un seul fichier HTML, images inlinées) pour la preview Artifact
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: { outDir: "dist-artifact", assetsInlineLimit: 100_000_000 },
});
