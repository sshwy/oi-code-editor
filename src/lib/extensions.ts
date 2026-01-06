import {
  defaultKeymap,
  historyKeymap,
  indentWithTab,
  insertBlankLine,
  history,
} from "@codemirror/commands";
import {
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
