import { oneDark } from "@codemirror/theme-one-dark";
import { githubLight } from "@uiw/codemirror-theme-github";
import { ExtensionMap } from "./extension-map";

const themeMap = {
  light: githubLight,
  dark: oneDark,
};

export function isSupportedColorMode(mode: any): mode is ColorMode {
  return mode in themeMap;
}

export type ColorMode = keyof typeof themeMap;

export const colorModes = new ExtensionMap(themeMap);
