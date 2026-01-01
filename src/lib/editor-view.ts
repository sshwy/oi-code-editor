import { EditorState, Compartment, StateField, StateEffect, Facet } from "@codemirror/state";
import type { Extension, StateEffectType } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  gutter,
  drawSelection,
  rectangularSelection,
  showPanel,
  ViewPlugin,
} from "@codemirror/view";
import type { ViewUpdate, Panel } from "@codemirror/view";
import { getOriginalDoc, unifiedMergeView } from "@codemirror/merge";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  insertBlankLine,
} from "@codemirror/commands";
import { vim, Vim } from "@replit/codemirror-vim";
import { foldGutter } from "@codemirror/language";
import {
  defaultHighlightStyle,
  syntaxHighlighting,
  bracketMatching,
  indentOnInput,
} from "@codemirror/language";
import { oneDark } from "@codemirror/theme-one-dark";
import { githubLight } from "@uiw/codemirror-themes-all";

import { cpp } from "@codemirror/lang-cpp";
import { rust } from "@codemirror/lang-rust";
import { markdown } from "@codemirror/lang-markdown";
import { json } from "@codemirror/lang-json";
import {
  collectFolds,
  commentFold,
  commentFoldService,
  clangPreprocessorFold,
  clangPreprocessorFoldService,
  clangTypedefFold,
  clangTypedefFoldService,
  clangUsingFold,
  clangUsingFoldService,
  clangMultiLineDefineFoldService,
  clangMultiLineDefineFold,
} from "./fold-services";
import { tabsFacet, tabsField, updateTabsState, type TabItem, type TabsState } from "./tabs";

// Syntax highlighting supported by the code editor
export type LangKind = "cpp" | "markdown" | "rust" | "text" | "json";

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
}

export interface InitOptions extends StateInitOptions {
  tabClassList?: string[];
  // whether the editor is readonly
  readonly?: boolean;
  // callback when the editor state changes
  onUpdate?: (info: ViewUpdateInfo) => void;
  onClickTab?: (item: TabItem) => void;
  // callback when the panel is mounted
  onBottomPanelMount?: (this: Panel) => void;
  // function to translate messages
  translate?: (msg: string) => string;
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

const cppSupp = cpp();
const rustSupp = rust();
const jsonSupp = json();
const markdownSupp = markdown({
  codeLanguages(info) {
    if (["cpp", "c", "cxx"].includes(info)) {
      return cppSupp.language;
    }
    if (["rust", "rs"].includes(info)) {
      return rustSupp.language;
    }
    if (["json"].includes(info)) {
      return jsonSupp.language;
    }
    return null;
  },
});
const langSuppMap: Record<LangKind, Extension> = {
  cpp: [
    cppSupp,
    clangPreprocessorFoldService,
    clangUsingFoldService,
    clangTypedefFoldService,
    clangMultiLineDefineFoldService,
  ],
  rust: rustSupp,
  text: [],
  markdown: markdownSupp,
  json: jsonSupp,
};

const supportedLanguages: LangKind[] = Object.keys(langSuppMap) as LangKind[];
export function isSupportedLanguage(lang: any): lang is LangKind {
  return supportedLanguages.includes(lang as LangKind);
}

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
  el.style.padding = "2px 4px";
  el.classList.add("hover:bg-black/5", "cursor-pointer", "select-none", "dark:hover:bg-white/10");

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

class ExtMap<T extends Record<string, Extension>> {
  private extensions: T;
  private facet: Facet<keyof T, keyof T | undefined>;
  private setKey: StateEffectType<keyof T>;
  private compartment: Compartment;

  constructor(extensions: T) {
    this.extensions = extensions;
    this.facet = Facet.define({
      combine(value) {
        return value[0];
      },
    });
    this.setKey = StateEffect.define<keyof T>();
    this.compartment = new Compartment();
  }

  of(key: keyof T): Extension {
    const initExt = this.extensions[key];
    if (!initExt) {
      throw new Error(`Extension key ${String(key)} not found`);
    }
    const field = StateField.define<keyof T>({
      create() {
        return key;
      },
      update: (value, tr) => {
        for (const e of tr.effects) {
          if (e.is(this.setKey)) {
            value = e.value;
          }
        }
        return value;
      },
      provide: (field) => this.facet.from(field),
    });

    return [field, this.compartment.of(initExt)];
  }

  reconfigure(key: keyof T) {
    return [this.compartment.reconfigure(this.extensions[key] || []), this.setKey.of(key)];
  }

  read(state: EditorState) {
    return state.facet(this.facet);
  }
}

const colorModes = new ExtMap(themeMap);
const editModes = new ExtMap(editModeMap);
const lineWraps = new ExtMap(lineWrapMap);
const langSupports = new ExtMap(langSuppMap);

const mergeViewCompart = new Compartment();

// Create a code editor view on the given element and items.
export function useEditorView(el: Element, init: InitOptions) {
  const t = init.translate || ((msg) => msg);

  const staticExtensions = {
    common: [
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
          div.className = "flex items-center justify-center h-full";
          return div;
        },
      }),
      commentFoldService,
      gutter({ class: "cm-gutters" }),
      bracketMatching(),
      drawSelection({}),
      rectangularSelection(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    ],
    // extensions for readonly mode
    readonly: [
      EditorState.readOnly.of(true),
      EditorView.editable.of(false),
      EditorView.contentAttributes.of({ tabindex: "0" }),
      // shortcuts like ctrl-a/c/v are allowed
      keymap.of(defaultKeymap),
    ],
    edit: [
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
    ],
  };

  const baseExt = (init: ConfigOptions) => [
    staticExtensions.common,
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
        const info: ViewUpdateInfo = {
          colorMode: colorModes.read(update.state),
          editMode: editModes.read(update.state),
          lineWrap: lineWraps.read(update.state),
          lang: langSupports.read(update.state),
          update,
        };
        init.onUpdate?.(info);
      }
      destroy() {}
    },
  );

  const extraExt = init.readonly ? staticExtensions.readonly : [staticExtensions.edit, WatchUpdate];

  const bottomPanel = (view: EditorView): Panel => {
    const dom = document.createElement("div");
    dom.classList.add("flex", "gap-1", "text-[12px]");

    const charCount = createBottomPanelItem(view, function (view) {
      this.textContent = view.state.doc.length + " " + t("num_characters");
    });

    const vimStatus = createBottomPanelItem(
      view,
      function (view) {
        this.textContent = editModes.read(view.state) === "vim" ? t("vim_mode") : t("simple_mode");
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
          lineWraps.read(view.state) === "wrap" ? t("line_wrap") : t("line_nowrap");
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
      if (lang && lang in langSuppMap) {
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
