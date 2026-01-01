import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, showPanel, ViewPlugin } from "@codemirror/view";
import type { ViewUpdate, Panel } from "@codemirror/view";
import { getOriginalDoc, unifiedMergeView } from "@codemirror/merge";
import { vim, Vim } from "@replit/codemirror-vim";
import { oneDark } from "@codemirror/theme-one-dark";
import { githubLight } from "@uiw/codemirror-theme-github";

import {
  collectFolds,
  commentFold,
  clangPreprocessorFold,
  clangTypedefFold,
  clangUsingFold,
  clangMultiLineDefineFold,
} from "./fold-services";
import { tabsFacet, tabsField, updateTabsState, type TabItem, type TabsState } from "./tabs";
import { isSupportedLanguage, langSupports, type LangKind } from "./language-supports";
import { ExtMap } from "./extension-map";
import { i18nFacet, tr, type I18nPrases } from "./i18n";
import { basicSetup, editorSetup, viewerSetup } from "./extensions";

export interface ConfigOptions {
  // syntax highlighting language
  lang?: LangKind;
  // whether to enable vim mode
  editMode?: keyof typeof editModeMap;
  // whether to wrap the lines
  lineWrap?: keyof typeof lineWrapMap;
  // color theme
  color?: keyof typeof themeMap;
  // content of the compared source
  comparedContent?: string;
}

export interface StateInitOptions extends ConfigOptions {
  // initial content of the source
  content: string;
  // initial tabs state. undefined means no tabs bar at all
  tabs?: TabsState;
  // whether to show the status panel
  showStatusPanel?: boolean;
  // initial i18n phrases
  i18nPhrases?: I18nPrases;
}

export interface EventHandlerSet {
  // callback when the editor state changes
  onUpdate?: (info: ViewUpdateInfo) => void;
  // callback when the tab is clicked
  onClickTab?: (item: TabItem) => void;
  // callback when the panel is mounted
  onBottomPanelMount?: (this: Panel) => void;
}

export interface InitOptions extends StateInitOptions, EventHandlerSet {
  tabClassList?: string[];
  // whether the editor is readonly
  readonly?: boolean;
}

export interface ViewUpdateInfo {
  editMode?: keyof typeof editModeMap;
  colorMode?: keyof typeof themeMap;
  lineWrap?: keyof typeof lineWrapMap;
  lang: LangKind | undefined;
  update: ViewUpdate;
}

export interface FoldOptions {
  comment?: boolean;
  preprocessor?: boolean;
  using?: boolean;
  typedef?: boolean;
}

const themeMap = {
  light: githubLight,
  dark: oneDark,
};

Vim.map("jj", "<Esc>", "insert"); // in insert mode
const editModeMap = {
  vim: vim(),
  simple: [],
};

const lineWrapMap = {
  wrap: EditorView.lineWrapping,
  nowrap: [],
};

function createMergeView(content: string) {
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
  el.classList.add(
    "px-1",
    "py-0.5",
    "hover:bg-black/5",
    "cursor-pointer",
    "select-none",
    "dark:hover:bg-white/10",
  );

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

const colorModes = new ExtMap(themeMap);
const editModes = new ExtMap(editModeMap);
const lineWraps = new ExtMap(lineWrapMap);

const mergeViewCompart = new Compartment();

// Create a code editor view on the given element and items.
export function useEditorView(el: Element, init: InitOptions) {
  const baseExt = (init: ConfigOptions) => [
    basicSetup,
    colorModes.of(init.color || "light"),
    // make sure vim is included before other keymaps
    editModes.of(init.editMode || "simple"),
    lineWraps.of(init.lineWrap || "nowrap"),
    mergeViewCompart.of(
      init.comparedContent === undefined ? [] : createMergeView(init.comparedContent),
    ),
    langSupports.of(init.lang || "text"),
  ];

  const WatchUpdate = ViewPlugin.fromClass(
    class {
      update(update: ViewUpdate) {
        const f = init.onUpdate;
        if (f) {
          const info: ViewUpdateInfo = {
            colorMode: colorModes.read(update.state),
            editMode: editModes.read(update.state),
            lineWrap: lineWraps.read(update.state),
            lang: langSupports.read(update.state),
            update,
          };
          f(info);
        }
      }
      destroy() {}
    },
  );

  const extraExt = init.readonly ? viewerSetup : [editorSetup, WatchUpdate];

  const bottomPanel = (view: EditorView): Panel => {
    const dom = document.createElement("div");
    dom.classList.add("flex", "gap-1", "text-[12px]");

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
          lineWraps.read(view.state) === "wrap"
            ? tr(view.state, "line_wrap")
            : tr(view.state, "line_nowrap");
      },
      {
        click: function (view) {
          view.dispatch({
            effects: lineWraps.reconfigure(
              lineWraps.read(view.state) === "wrap" ? "nowrap" : "wrap",
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
        init.onBottomPanelMount?.call(this);
      },
    };
  };

  const onClickTab = init.onClickTab;
  const commonTabClassList = init.tabClassList || [];
  const tabsBar = (view: EditorView): Panel => {
    const dom = document.createElement("div");
    dom.classList.add("flex", "overflow-x-auto", "text-[13px]");

    const init = view.state.facet(tabsFacet);
    if (!init) throw new Error("TabsField not initialized");

    const updateTabEl = (el: Element, label: string, active: boolean, classList: string[]) => {
      const activeClassList = ["bg-white/90", "dark:bg-white/10", "text-highlighted"];
      el.classList.value = "";
      el.classList.add(...classList);
      if (active) {
        el.classList.add(...activeClassList);
      }
      el.textContent = label;
    };
    const createChildren = (items: TabItem[], activeId?: string) =>
      items.map((item) => {
        const tabEl = document.createElement("div");
        tabEl.setAttribute("data-id", item.id);
        updateTabEl(tabEl, item.label || item.id, item.id === activeId, [
          ...commonTabClassList,
          ...(item.classList || []),
        ]);

        tabEl.addEventListener("click", () => {
          onClickTab?.(item);
        });

        return tabEl;
      });

    const render = (state: TabsState, old?: TabsState) => {
      if (
        old &&
        state.tabs.length === old.tabs.length &&
        state.tabs.every((tab, i) => tab.id === old.tabs[i]?.id)
      ) {
        for (const child of dom.children) {
          const id = child.getAttribute("data-id");
          const item = state.tabs.find((tab) => tab.id === id);
          if (item) {
            updateTabEl(child, item.label || item.id, item.id === state.activeId, [
              ...commonTabClassList,
              ...(item.classList || []),
            ]);
          }
        }
      } else {
        console.log(
          "replace tabs",
          state.tabs.map((t) => t.id),
          old?.tabs.map((t) => t.id),
        );
        dom.replaceChildren(...createChildren(state.tabs, state.activeId));
      }
      dom.style.display = state.activeId === undefined ? "none" : "flex";
    };

    render(init);

    return {
      dom,
      top: true,
      update: (update) => {
        const cur = update.state.facet(tabsFacet);
        const old = update.startState.facet(tabsFacet);
        if (!cur || cur === old) {
          return;
        }
        render(cur, old);
      },
      mount() {
        const pannelWrapper = this.dom.parentElement;
        if (!pannelWrapper) return;
        pannelWrapper.style.zIndex = "10";
      },
    };
  };

  const createState = (init: StateInitOptions): EditorState => {
    const startState = EditorState.create({
      doc: init.content,
      extensions: [
        baseExt(init),
        extraExt,
        init.showStatusPanel !== false ? showPanel.of(bottomPanel) : [],
        init.tabs ? [tabsField(init.tabs), showPanel.of(tabsBar)] : [],
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
    set colorMode(color: keyof typeof themeMap | undefined) {
      if (color && color in themeMap) {
        view.dispatch({
          effects: colorModes.reconfigure(color),
        });
      } else {
        console.warn(`Invalid color mode: ${color}`);
      }
    },
    get lineWrap() {
      return lineWraps.read(view.state);
    },
    get editMode() {
      return editModes.read(view.state);
    },
    set editMode(editMode: keyof typeof editModeMap | undefined) {
      if (editMode && editMode in editModeMap) {
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
        effects: mergeViewCompart.reconfigure(
          content === undefined ? [] : createMergeView(content),
        ),
      });
    },
    setState(init: StateInitOptions) {
      view.setState(createState(init));
    },
    // get the tabs state
    get tabs() {
      return view.state.facet(tabsFacet);
    },
    updateTabs(tabs: Partial<TabsState>) {
      view.dispatch({
        effects: updateTabsState.of(tabs),
      });
    },
    fold(options?: FoldOptions) {
      const state = view.state;
      view.dispatch({
        effects: [
          ...(options?.comment ? collectFolds(state, commentFold) : []),
          ...(options?.preprocessor ? collectFolds(state, clangPreprocessorFold) : []),
          ...(options?.preprocessor ? collectFolds(state, clangMultiLineDefineFold) : []),
          ...(options?.using ? collectFolds(state, clangUsingFold) : []),
          ...(options?.typedef ? collectFolds(state, clangTypedefFold) : []),
        ],
      });
    },
  };
}

export type EditorInstance = ReturnType<typeof useEditorView>;
