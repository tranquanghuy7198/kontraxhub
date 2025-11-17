import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ["buffer", "process", "util", "crypto", "stream", "vm"],
      globals: { global: true, process: true },
    }),
    ...(process.env.ANALYZE
      ? [
          visualizer({
            open: true,
            gzipSize: true,
            brotliSize: true,
            filename: "dist/stats.html",
          }),
        ]
      : []),
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
    sourcemap: process.env.NODE_ENV !== "production",
    chunkSizeWarningLimit: 1000,
    minify: "esbuild",
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return "assets/[name]-[hash][extname]";
          const info = assetInfo.name.split(".");
          let extType = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = "images";
          } else if (/woff|woff2|ttf|eot/i.test(extType)) {
            extType = "fonts";
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },

        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
      },
    },
    target: "es2015",
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // 4kb
  },

  css: {
    preprocessorOptions: {
      scss: {
        // Add any SCSS options if needed
      },
    },
    modules: {
      localsConvention: "camelCase",
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
      "react",
      "react-dom",
      "react-router-dom",
    ],
    force: false,
  },
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
  },
});
