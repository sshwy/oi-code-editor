import {
  defaultKeymap,
  historyKeymap,
  indentWithTab,
  insertBlankLine,
  history,
} from "@codemirror/commands";
import {
  foldGutter,
  bracketMatching,
  syntaxHighlighting,
  defaultHighlightStyle,
  indentOnInput,
} from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import {
  lineNumbers,
  gutter,
  drawSelection,
  rectangularSelection,
  EditorView,
  keymap,
} from "@codemirror/view";
import { commentFoldService } from "./fold-services";

export const basicSetup = [
  lineNumbers({}),
  foldGutter({
    markerDOM(open) {
      const div = document.createElement("div");
      if (!open) {
        div.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>';
      } else {
        div.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>';
      }
      div.className = "cm-foldGutter-marker";
      return div;
    },
  }),
  commentFoldService,
  gutter({ class: "cm-gutters" }),
  bracketMatching(),
  drawSelection({}),
  rectangularSelection(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
];

// extensions for readonly mode
export const viewerSetup = [
  EditorState.readOnly.of(true),
  EditorView.editable.of(false),
  EditorView.contentAttributes.of({ tabindex: "0" }),
  // shortcuts like ctrl-a/c/v are allowed
  keymap.of(defaultKeymap),
];

export const editorSetup = [
  history({ minDepth: 100, newGroupDelay: 100 }),
  indentOnInput(),
  keymap.of([
    ...defaultKeymap,
    ...historyKeymap,
    indentWithTab,
    {
      key: "Shift-Enter",
      run: insertBlankLine,
    },
  ]),
];
