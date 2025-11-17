import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ["buffer", "process", "util", "crypto", "stream", "vm"],
      globals: { global: true, process: true },
    }),
  ],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@api": path.resolve(__dirname, "./src/api"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@redux": path.resolve(__dirname, "./src/redux"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@docs": path.resolve(__dirname, "./src/docs"),
    },
  },
  define: {
    global: "globalThis",
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },
  server: {
    port: 3006,
    open: true,
    middlewareMode: false,
    fs: { strict: false },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Add any SCSS options if needed
      },
    },
  },
  optimizeDeps: {
    include: [
      "buffer",
      "process",
      "stream-browserify",
      "util",
      "crypto-browserify",
      "vm-browserify",
    ],
  },
});
