import { EditorView } from "@codemirror/view";
import { ExtensionMap } from "./extension-map";

const lineWrapMap = {
  wrap: EditorView.lineWrapping,
  nowrap: [],
};

export type WrapMode = keyof typeof lineWrapMap;

export const wrapModes = new ExtensionMap(lineWrapMap);
