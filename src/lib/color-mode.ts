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
    fontFamily: "var(--oce-font-mono, monospace)",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-panel.cm-panel-lint ul": {
    fontSize: "13px",
  },
  ".cm-panels.cm-panels-bottom": {
    bottom: "var(--oce-status-panel-bottom, 0px)",
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
  ".cm-lintRange-active": {
    backgroundColor: "#acacac40",
  },
  ".cm-foldGutter-marker": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  ".cm-lintRange.cm-lintRange-error": {
    // a thicker line than the original one
    // use https://yqnn.github.io/svg-path-editor/ and https://www.svgbackgrounds.com/tools/svg-to-css/ to edit it.
    backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="4"><path d="m 0 2.5 l 3 -2 l 1 0 l 3 2 l 1 0" stroke="%23d11" fill="none" stroke-width="2"/></svg>')`,
    paddingBottom: "2px",
  },
  ".cm-lintRange.cm-lintRange-warning": {
    backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="4"><path d="m 0 2.5 l 3 -2 l 1 0 l 3 2 l 1 0" stroke="orange" fill="none" stroke-width="2"/></svg>')`,
    paddingBottom: "2px",
  },
  ".cm-lintRange.cm-lintRange-hint": {
    backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="4"><path d="m 0 2.5 l 3 -2 l 1 0 l 3 2 l 1 0" stroke="%2366d" fill="none" stroke-width="2"/></svg>')`,
    paddingBottom: "2px",
  },
  ".cm-lintRange.cm-lintRange-info": {
    backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="4"><path d="m 0 2.5 l 3 -2 l 1 0 l 3 2 l 1 0" stroke="%23999" fill="none" stroke-width="2"/></svg>')`,
    paddingBottom: "2px",
  },
  ".cm-lint-error-line": {
    backgroundColor: "#dd111140",
  },
  ".cm-lint-warning-line": {
    backgroundColor: "#ffa60040",
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
