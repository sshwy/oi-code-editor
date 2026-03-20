import { EditorState, Compartment, type Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import type { ViewUpdate } from "@codemirror/view";
import { getOriginalDoc, unifiedMergeView } from "@codemirror/merge";

import { type FoldOptions, foldTrans } from "./fold-services";
import { isSupportedLanguage, langSupports, type LangKind } from "./language-supports";
import { i18nFacet, type I18nPhrases } from "./i18n";
import { basicSetup, editorSetup, viewerSetup } from "./extensions";
import { editModes, isSupportedEditMode, type EditMode } from "./edit-mode";
import { colorModes, isSupportedColorMode, type ColorMode } from "./color-mode";
import { wrapModes, type WrapMode } from "./wrap-mode";
import { statusPanel, type StatusPanelOptions } from "./status-panel";
import { foldGutter } from "@codemirror/language";
import {
  staticDiagnostics,
  staticLint,
  updateStaticDiagnostics,
  type Diagnostic,
  type DiagnosticOption,
} from "./lint";
import { forceLinting } from "@codemirror/lint";

export interface StateInitOptions {
  /** syntax highlighting language */
  lang?: LangKind;
  /** whether the editor is readonly */
  readonly?: boolean;
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
  /** status panel options. hide the status panel if undefined */
  statusPanel?: StatusPanelOptions;
  /** initial i18n phrases */
  i18nPhrases?: I18nPhrases;
  /** default folding options. hide the folding gutter if undefined */
  fold?: FoldOptions;
  diagnostic?: DiagnosticOption;
}

export interface InitOptions extends StateInitOptions {
  /** callback when the editor state changes */
  onUpdate?: (info: ViewUpdateInfo) => void;
}

export interface ViewUpdateInfo {
  editMode?: EditMode;
  colorMode?: ColorMode;
  lineWrap?: WrapMode;
  lang: LangKind | undefined;
  update: ViewUpdate;
}

/**
 * Creates a merge view extension if compared content is provided; otherwise
 * returns an empty array.
 */
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
  const readonlyModeCompart = new Compartment();

  const getReadonlyModeExt = (readonly: boolean): Extension =>
    readonly
      ? viewerSetup
      : [...editorSetup, ...(init.onUpdate ? [watchUpdate(init.onUpdate)] : [])];

  const createState = (init: StateInitOptions): EditorState => {
    let startState = EditorState.create({
      doc: init.content,
      extensions: [
        basicSetup,
        init.fold
          ? foldGutter({
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
            })
          : [],
        init.diagnostic ? staticLint({ autoPanel: init.diagnostic.autoPanel }) : [],
        colorModes.of(init.color || "light"),
        // make sure vim is included before other keymaps
        editModes.of(init.editMode || "simple"),
        wrapModes.of(init.lineWrap || "nowrap"),
        mergeViewCompart.of(createMergeView(init.comparedContent)),
        langSupports.of(init.lang || "text"),
        readonlyModeCompart.of(getReadonlyModeExt(!!init.readonly)),
        init.statusPanel ? statusPanel(init.statusPanel) : [],
        init.i18nPhrases ? i18nFacet.of(init.i18nPhrases) : [],
        init.extensions || [],
      ],
    });

    if (init.fold) {
      startState = startState.update(foldTrans(startState, init.fold)).state;
    }
    if (init.diagnostic) {
      startState = startState.update(
        updateStaticDiagnostics(init.diagnostic.diagnostics || []),
      ).state;
    }

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
    get readonly() {
      return view.state.readOnly;
    },
    set readonly(readonly: boolean) {
      if (view.state.readOnly === readonly) return;
      view.dispatch({
        effects: readonlyModeCompart.reconfigure(getReadonlyModeExt(readonly)),
      });
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
      console.debug("set lang", lang);
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
    get state() {
      return view.state;
    },
    set state(state: EditorState) {
      console.debug("set state", state);
      view.setState(state);
    },
    get diagnostics() {
      if (!init.diagnostic) undefined;
      return view.state.field(staticDiagnostics);
    },
    set diagnostics(diagnostics: Diagnostic[]) {
      if (!init.diagnostic) return;
      view.dispatch(updateStaticDiagnostics(diagnostics));
      forceLinting(view);
    },
    recreateState(init: StateInitOptions) {
      view.setState(createState(init));
    },
    fold(options: FoldOptions) {
      const state = view.state;
      view.dispatch(foldTrans(state, options));
    },
  };
}

export type EditorInstance = ReturnType<typeof useEditorView>;
