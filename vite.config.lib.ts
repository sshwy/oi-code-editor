import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

const codemirrorGlobals = {
  "@codemirror/commands": "CodeMirrorCommands",
  "@codemirror/lang-cpp": "CodeMirrorLangCpp",
  "@codemirror/lang-json": "CodeMirrorLangJson",
  "@codemirror/lang-markdown": "CodeMirrorLangMarkdown",
  "@codemirror/lang-python": "CodeMirrorLangPython",
  "@codemirror/lang-rust": "CodeMirrorLangRust",
  "@codemirror/language": "CodeMirrorLanguage",
  "@codemirror/merge": "CodeMirrorMerge",
  "@codemirror/state": "CodeMirrorState",
  "@codemirror/theme-one-dark": "CodeMirrorThemeOneDark",
  "@codemirror/view": "CodeMirrorView",
};

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "~": resolve(__dirname, "./src"),
    },
  },
  publicDir: false,
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "OiCodeEditor",
      fileName: "oi-code-editor",
    },
    rollupOptions: {
      external: ["vue", ...Object.keys(codemirrorGlobals)],
      output: {
        globals: {
          vue: "Vue",
          ...codemirrorGlobals,
        },
      },
    },
  },
});
