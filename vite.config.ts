import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "/oi-code-editor/",
  resolve: {
    alias: {
      "~": resolve(__dirname, "./src"),
    },
  },
});
