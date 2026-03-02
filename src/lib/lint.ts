import { linter, type Diagnostic, type LintSource } from "@codemirror/lint";
import { RangeSetBuilder, StateEffect, StateField, type TransactionSpec } from "@codemirror/state";
import {
  Decoration,
  ViewPlugin,
  ViewUpdate,
  type DecorationSet,
  type EditorView,
} from "@codemirror/view";

const setStaticDiagnosticsEffect = StateEffect.define<Diagnostic[]>();
export const staticDiagnostics = StateField.define<Diagnostic[]>({
  create: () => [],
  update: (value, transaction) => {
    transaction.effects.forEach((e) => {
      if (e.is(setStaticDiagnosticsEffect)) {
        value = e.value;
      }
    });
    return value;
  },
});

export const updateStaticDiagnostics = (diagnostics: Diagnostic[]): TransactionSpec => {
  return {
    effects: setStaticDiagnosticsEffect.of(diagnostics),
  };
};

const diagnosticLineDecoMap = {
  error: Decoration.line({
    attributes: { class: "cm-lint-error-line" },
  }),
  hint: Decoration.line({
    attributes: { class: "cm-lint-hint-line" },
  }),
  warning: Decoration.line({
    attributes: { class: "cm-lint-warning-line" },
  }),
  info: Decoration.line({
    attributes: { class: "cm-lint-info-line" },
  }),
};

function staticDiagnosticLineDeco(view: EditorView) {
  let diagnostics = view.state.field(staticDiagnostics, false);
  let builder = new RangeSetBuilder<Decoration>();
  if (!diagnostics) return builder.finish();
  const markedLines = diagnostics.map((d) => {
    const line = view.state.doc.lineAt(d.from);
    return { line, severity: d.severity };
  });
  for (let { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to; ) {
      let line = view.state.doc.lineAt(pos);
      const item = markedLines.find((l) => l.line.number === line.number);
      if (item) builder.add(line.from, line.from, diagnosticLineDecoMap[item.severity]);
      pos = line.to + 1;
    }
  }
  return builder.finish();
}

const showLintLineDeco = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = staticDiagnosticLineDeco(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged)
        this.decorations = staticDiagnosticLineDeco(update.view);
    }
  },
  {
    decorations: (v) => v.decorations,
  },
);

const staticLintSource: LintSource = (view) => {
  const diagnostics = view.state.field(staticDiagnostics);
  return diagnostics || [];
};

export const staticLint = (options: Omit<DiagnosticOption, "diagnostics">) => [
  staticDiagnostics,
  showLintLineDeco,
  linter(staticLintSource, {
    delay: options.delay || 250,
    tooltipFilter(diagnostics, _state) {
      return diagnostics.slice();
    },
    autoPanel: options.autoPanel,
  }),
];

export interface DiagnosticOption {
  /** Time to wait (in milliseconds) after a change before running the linter. Defaults to 250ms. */
  delay?: number;
  /** When enabled (defaults to off), this will cause the lint panel to automatically open when diagnostics are found, and close when all diagnostics are resolved or removed. */
  autoPanel?: boolean;
  /** initial diagnostics */
  diagnostics?: Diagnostic[];
}

export { type Diagnostic };
