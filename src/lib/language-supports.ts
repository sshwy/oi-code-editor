import {
  clangPreprocessorFoldService,
  clangTypedefFoldService,
  clangUsingFoldService,
  clangMultiLineDefineFoldService,
} from "./fold-services";
import { cpp } from "@codemirror/lang-cpp";
import { rust } from "@codemirror/lang-rust";
import { markdown } from "@codemirror/lang-markdown";
import { json } from "@codemirror/lang-json";
import { python } from "@codemirror/lang-python";
import type { Extension } from "@codemirror/state";
import { ExtensionMap } from "./extension-map";

// Syntax highlighting supported by the code editor
export type LangKind = "cpp" | "markdown" | "rust" | "text" | "json" | "python";

const cppSupp = cpp();
const rustSupp = rust();
const jsonSupp = json();
const pythonSupp = python();
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
    if (["python", "py"].includes(info)) {
      return pythonSupp.language;
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
  python: pythonSupp,
};

const supportedLanguages: LangKind[] = Object.keys(langSuppMap) as LangKind[];
export function isSupportedLanguage(lang: any): lang is LangKind {
  return supportedLanguages.includes(lang as LangKind);
}

export const langSupports = new ExtensionMap(langSuppMap);
