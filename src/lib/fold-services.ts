import { foldEffect, foldService } from "@codemirror/language";
import type { EditorState, TransactionSpec } from "@codemirror/state";

export const commentFold = (state: EditorState, lineStart: number) => {
  const doc = state.doc;
  const line = doc.lineAt(lineStart);

  /* ---------- 1. 连续 // 注释 ---------- */
  if (
    line.text.trim().startsWith("//") &&
    (line.number === 1 ||
      !doc
        .line(line.number - 1)
        .text.trim()
        .startsWith("//"))
  ) {
    let from = line.to;
    let to = line.to;

    let lineNo = line.number + 1;
    while (lineNo <= doc.lines) {
      const l = doc.line(lineNo);
      if (!l.text.trim().startsWith("//")) break;
      to = l.to;
      lineNo++;
    }

    // 至少两行才折叠
    if (to > from) {
      return { from, to };
    }
  }

  /* ---------- 2. 块注释 ---------- */
  const blockStart = line.text.indexOf("/*");
  if (blockStart !== -1) {
    let from = line.from + blockStart + 2;

    // 同一行就结束，不折叠
    if (line.text.includes("*/", blockStart + 2)) {
      return null;
    }

    let lineNo = line.number;
    while (lineNo <= doc.lines) {
      const l = doc.line(lineNo);
      const endIndex = l.text.indexOf("*/");
      if (endIndex !== -1) {
        const to = l.from + endIndex;
        if (to > from) {
          return { from, to };
        }
        break;
      }
      lineNo++;
    }
  }

  return null;
};

export const commentFoldService = foldService.of(commentFold);

const regexFoldFactory = (pattern: RegExp) => {
  return (state: EditorState, lineStart: number) => {
    const doc = state.doc;
    const line = doc.lineAt(lineStart);
    if (
      line.text.trim().match(pattern) &&
      (line.number === 1 ||
        !doc
          .line(line.number - 1)
          .text.trim()
          .match(pattern))
    ) {
      let from = line.to;
      let to = line.to;

      let lineNo = line.number + 1;
      while (lineNo <= doc.lines) {
        const l = doc.line(lineNo);
        if (!l.text.trim().match(pattern)) break;
        to = l.to;
        lineNo++;
      }

      // 至少两行才折叠
      if (to > from) {
        return { from, to };
      }
    }

    return null;
  };
};

export const clangPreprocessorFold = regexFoldFactory(/^#define|^#include|^#pragma/);
export const clangPreprocessorFoldService = foldService.of(clangPreprocessorFold);

export const clangUsingFold = regexFoldFactory(/^using/);
export const clangUsingFoldService = foldService.of(clangUsingFold);

export const clangTypedefFold = regexFoldFactory(/^typedef/);
export const clangTypedefFoldService = foldService.of(clangTypedefFold);

export const clangMultiLineDefineFold = (state: EditorState, lineStart: number) => {
  const doc = state.doc;
  const line = doc.lineAt(lineStart);
  if (line.text.trim().match(/^#define/)) {
    let from = line.to;
    let to = line.to;

    let lineNo = line.number;
    while (lineNo <= doc.lines) {
      const l = doc.line(lineNo);
      to = l.to;
      if (!l.text.trim().match(/\\$/)) break;
      lineNo++;
    }

    if (lineNo > line.number) {
      return { from, to };
    }
  }

  return null;
};
export const clangMultiLineDefineFoldService = foldService.of(clangMultiLineDefineFold);

export function collectFolds(
  state: EditorState,
  foldFn: (state: EditorState, lineStart: number) => { from: number; to: number } | null,
) {
  const effects = [];
  const doc = state.doc;

  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i);
    const range = foldFn(state, line.from);
    if (range) {
      effects.push(foldEffect.of(range));
    }
  }

  return effects;
}

export interface FoldOptions {
  comment?: boolean;
  preprocessor?: boolean;
  using?: boolean;
  typedef?: boolean;
}

// create a fold transaction for the given options
export function foldTrans(state: EditorState, options: FoldOptions): TransactionSpec {
  return {
    effects: [
      ...(options.comment ? collectFolds(state, commentFold) : []),
      ...(options.preprocessor ? collectFolds(state, clangPreprocessorFold) : []),
      ...(options.preprocessor ? collectFolds(state, clangMultiLineDefineFold) : []),
      ...(options.using ? collectFolds(state, clangUsingFold) : []),
      ...(options.typedef ? collectFolds(state, clangTypedefFold) : []),
    ],
  };
}
