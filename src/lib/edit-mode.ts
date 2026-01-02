import { vim, Vim } from "@replit/codemirror-vim";
import { ExtMap } from "./extension-map";

Vim.map("jj", "<Esc>", "insert"); // in insert mode
const editModeMap = {
  vim: vim(),
  simple: [],
};

export function isSupportedEditMode(mode: any): mode is EditMode {
  return mode in editModeMap;
}

export type EditMode = keyof typeof editModeMap;

export const editModes = new ExtMap(editModeMap);
