import { oneDark } from "@codemirror/theme-one-dark";
import { githubLight } from "@uiw/codemirror-theme-github";
import { ExtensionMap } from "./extension-map";
import { EditorView } from "@codemirror/view";

const baseTheme = EditorView.baseTheme({
  "&light": {
    border: "1px solid #ddd",
  },
  ".cm-scroller": {
    fontSize: "13px",
    fontFamily: "var(--oce-font-mono)",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-panel.cm-panel-lint ul": {
    fontSize: "13px",
  },
  "&dark .cm-panel.cm-panel-lint ul:focus [aria-selected]": {
    backgroundColor: "#333945",
    color: "white",
  },
  "&light .cm-panel.cm-panel-lint ul:focus [aria-selected]": {
    backgroundColor: "#ddd",
    color: "black",
  },
  "&dark .cm-panel.cm-panel-lint ul [aria-selected]": { backgroundColor: "#333945" },
  ".cm-foldGutter-marker": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
});

const themeMap = {
  light: [githubLight, baseTheme],
  dark: [oneDark, baseTheme],
};

export function isSupportedColorMode(mode: any): mode is ColorMode {
  return mode in themeMap;
}

export type ColorMode = keyof typeof themeMap;

export const colorModes = new ExtensionMap(themeMap);
