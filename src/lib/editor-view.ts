import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, showPanel } from "@codemirror/view";
import type { ViewUpdate, Panel } from "@codemirror/view";
import { getOriginalDoc, unifiedMergeView } from "@codemirror/merge";

import { type FoldOptions, foldTrans } from "./fold-services";
import { isSupportedLanguage, langSupports, type LangKind } from "./language-supports";
import { i18nFacet, tr, type I18nPrases } from "./i18n";
import { basicSetup, editorSetup, viewerSetup } from "./extensions";
import { editModes, isSupportedEditMode, type EditMode } from "./edit-mode";
import { colorModes, isSupportedColorMode, type ColorMode } from "./color-mode";
import { wrapModes, type WrapMode } from "./wrap-mode";

export interface ConfigOptions {
  // syntax highlighting language
  lang?: LangKind;
  // whether to enable vim mode
  editMode?: EditMode;
  // whether to wrap the lines
  lineWrap?: WrapMode;
  // color theme
  color?: ColorMode;
  // content of the compared source
  comparedContent?: string;
}

export interface StateInitOptions extends ConfigOptions {
  // initial content of the source
  content: string;
  // whether to show the status panel
  showStatusPanel?: boolean;
  // initial i18n phrases
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

function createBottomPanelItem(
  view: EditorView,
  renderer: (this: HTMLDivElement, view: EditorView) => void,
  mutators?: {
    // called when the item is clicked
    click?: (this: HTMLDivElement, view: EditorView, ev: PointerEvent) => void;
  },
) {
  const el = document.createElement("div");
  el.classList.add("cm-panel-item");

  // initialization
  renderer.call(el, view);

  const clickFn = mutators?.click;
  if (clickFn) {
    el.addEventListener("click", function (ev) {
      clickFn.call(this, view, ev);
    });
  }

  return {
    dom: el,
    update(update: ViewUpdate) {
      renderer.call(el, update.view);
    },
  };
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

const statusPanelTheme = EditorView.baseTheme({
  ".cm-status-panel": { display: "flex", fontSize: "12px", gap: "4px" },
  ".cm-status-panel > .cm-panel-item": {
    padding: "2px 4px",
    cursor: "pointer",
    userSelect: "none",
  },
  // "hover:bg-black/5"
  "&light .cm-status-panel > .cm-panel-item:hover": { backgroundColor: "#0000000d" },
  // "dark:hover:bg-white/10"
  "&dark .cm-status-panel > .cm-panel-item:hover": { backgroundColor: "#ffffff1a" },
});

const statusPanel =
  (cb?: (this: Panel) => void) =>
  (view: EditorView): Panel => {
    const dom = document.createElement("div");
    dom.classList.add("cm-status-panel");

    const charCount = createBottomPanelItem(view, function (view) {
      this.textContent = view.state.doc.length + " " + tr(view.state, "characters");
    });

    const vimStatus = createBottomPanelItem(
      view,
      function (view) {
        this.textContent =
          editModes.read(view.state) === "vim"
            ? tr(view.state, "vim_mode")
            : tr(view.state, "simple_mode");
      },
      {
        click: function (view) {
          view.dispatch({
            effects: editModes.reconfigure(editModes.read(view.state) === "vim" ? "simple" : "vim"),
          });
        },
      },
    );

    const lineWrapStatus = createBottomPanelItem(
      view,
      function (view) {
        this.textContent =
          wrapModes.read(view.state) === "wrap"
            ? tr(view.state, "line_wrap")
            : tr(view.state, "line_nowrap");
      },
      {
        click: function (view) {
          view.dispatch({
            effects: wrapModes.reconfigure(
              wrapModes.read(view.state) === "wrap" ? "nowrap" : "wrap",
            ),
          });
        },
      },
    );

    const items = [charCount, vimStatus, lineWrapStatus];

    items.forEach((item) => {
      dom.appendChild(item.dom);
    });

    return {
      dom,
      update(update) {
        items.forEach((item) => {
          item.update(update);
        });
      },
      mount() {
        cb?.call(this);
      },
    };
  };

const baseExt = (init: ConfigOptions) => [
  basicSetup,
  colorModes.of(init.color || "light"),
  // make sure vim is included before other keymaps
  editModes.of(init.editMode || "simple"),
  wrapModes.of(init.lineWrap || "nowrap"),
  mergeViewCompart.of(createMergeView(init.comparedContent)),
  langSupports.of(init.lang || "text"),
];

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
        baseExt(init),
        extraExt,
        init.showStatusPanel !== false
          ? [statusPanelTheme, showPanel.of(statusPanel(onStatusPanelMount))]
          : [],
        init.i18nPhrases ? i18nFacet.of(init.i18nPhrases) : [],
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
