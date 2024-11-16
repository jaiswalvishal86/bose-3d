import { defineConfig } from "vite";

export default defineConfig({
  publicDir: "./public/",
  base: "./",
  build: {
    outDir: "dist", // Output directory for the build
  },
});
