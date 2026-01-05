import { EditorView, ViewUpdate, type Panel } from "@codemirror/view";
import { editModes } from "./edit-mode";
import { tr } from "./i18n";
import { wrapModes } from "./wrap-mode";

function createStatusPanelItem(
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

export const statusPanelTheme = EditorView.baseTheme({
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

export const statusPanel =
  (cb?: (this: Panel) => void) =>
  (view: EditorView): Panel => {
    const dom = document.createElement("div");
    dom.classList.add("cm-status-panel");

    const charCount = createStatusPanelItem(view, function (view) {
      this.textContent = view.state.doc.length + " " + tr(view.state, "characters");
    });

    const vimStatus = createStatusPanelItem(
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

    const lineWrapStatus = createStatusPanelItem(
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
