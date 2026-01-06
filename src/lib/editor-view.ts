import { EditorState, Compartment, type Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import type { ViewUpdate, Panel } from "@codemirror/view";
import { getOriginalDoc, unifiedMergeView } from "@codemirror/merge";

import { type FoldOptions, foldTrans } from "./fold-services";
import { isSupportedLanguage, langSupports, type LangKind } from "./language-supports";
import { i18nFacet, type I18nPrases } from "./i18n";
import { basicSetup, editorSetup, viewerSetup } from "./extensions";
import { editModes, isSupportedEditMode, type EditMode } from "./edit-mode";
import { colorModes, isSupportedColorMode, type ColorMode } from "./color-mode";
import { wrapModes, type WrapMode } from "./wrap-mode";
import { statusPanel } from "./status-panel";

export interface StateInitOptions {
  /** syntax highlighting language */
  lang?: LangKind;
  /** whether to enable vim mode */
  editMode?: EditMode;
  /** whether to wrap the lines */
  lineWrap?: WrapMode;
  /** color theme */
  color?: ColorMode;
  /** content of the compared source */
  comparedContent?: string;
  /** additional editor extensions */
  extensions?: Extension;
  /** initial content of the source */
  content: string;
  /** whether to show the status panel */
  showStatusPanel?: boolean;
  /** initial i18n phrases */
  i18nPhrases?: I18nPrases;
}

export interface EventHandlerSet {
  // callback when the editor state changes
  onUpdate?: (info: ViewUpdateInfo) => void;
  // callback when the panel is mounted
  onStatusPanelMount?: (this: Panel) => void;
}

export interface InitOptions extends StateInitOptions, EventHandlerSet {
  // whether the editor is readonly
  readonly?: boolean;
}

export interface ViewUpdateInfo {
  editMode?: EditMode;
  colorMode?: ColorMode;
  lineWrap?: WrapMode;
  lang: LangKind | undefined;
  update: ViewUpdate;
}

function createMergeView(content?: string) {
  if (content === undefined) return [];
  return unifiedMergeView({
    original: content,
    mergeControls: false,
  });
}

const watchUpdate = (fn: (info: ViewUpdateInfo) => void) =>
  EditorView.updateListener.of((update: ViewUpdate) => {
    const info: ViewUpdateInfo = {
      colorMode: colorModes.read(update.state),
      editMode: editModes.read(update.state),
      lineWrap: wrapModes.read(update.state),
      lang: langSupports.read(update.state),
      update,
    };
    fn(info);
  });

const mergeViewCompart = new Compartment();

// Create a code editor view on the given element and items.
export function useEditorView(el: Element, init: InitOptions) {
  const extraExt = init.readonly
    ? viewerSetup
    : [editorSetup, init.onUpdate ? watchUpdate(init.onUpdate) : []];

  const onStatusPanelMount = init.onStatusPanelMount;
  const createState = (init: StateInitOptions): EditorState => {
    let startState = EditorState.create({
      doc: init.content,
      extensions: [
        basicSetup,
        colorModes.of(init.color || "light"),
        // make sure vim is included before other keymaps
        editModes.of(init.editMode || "simple"),
        wrapModes.of(init.lineWrap || "nowrap"),
        mergeViewCompart.of(createMergeView(init.comparedContent)),
        langSupports.of(init.lang || "text"),
        extraExt,
        init.showStatusPanel !== false ? statusPanel({ onMount: onStatusPanelMount }) : [],
        init.i18nPhrases ? i18nFacet.of(init.i18nPhrases) : [],
        init.extensions || [],
      ],
    });

    return startState;
  };

  const initState = createState(init);

  const view = new EditorView({
    state: initState,
    parent: el,
  });

  return {
    view,
    get doc() {
      return view.state.doc;
    },
    get colorMode() {
      return colorModes.read(view.state);
    },
    set colorMode(color: ColorMode | undefined) {
      if (isSupportedColorMode(color)) {
        view.dispatch({
          effects: colorModes.reconfigure(color),
        });
      } else {
        console.warn(`Invalid color mode: ${color}`);
      }
    },
    get lineWrap() {
      return wrapModes.read(view.state);
    },
    get editMode() {
      return editModes.read(view.state);
    },
    set editMode(editMode: EditMode | undefined) {
      if (isSupportedEditMode(editMode)) {
        view.dispatch({
          effects: editModes.reconfigure(editMode),
        });
      } else {
        console.warn(`Invalid edit mode: ${editMode}`);
      }
    },
    get lang() {
      return langSupports.read(view.state);
    },
    set lang(lang: LangKind | undefined) {
      if (isSupportedLanguage(lang)) {
        view.dispatch({
          effects: langSupports.reconfigure(lang),
        });
      } else {
        console.warn(`Invalid language: ${lang}`);
      }
    },
    // get the original document being compared
    get originalDoc() {
      return getOriginalDoc(view.state);
    },
    setOriginalDoc(content?: string) {
      view.dispatch({
        effects: mergeViewCompart.reconfigure(createMergeView(content)),
      });
    },
    setState(init: StateInitOptions) {
      view.setState(createState(init));
    },
    fold(options?: FoldOptions) {
      const state = view.state;
      view.dispatch(
        foldTrans(
          state,
          options || {
            comment: true,
            preprocessor: true,
            using: true,
            typedef: true,
          },
        ),
      );
    },
  };
}

export type EditorInstance = ReturnType<typeof useEditorView>;
