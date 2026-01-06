import { EditorState, Facet } from "@codemirror/state";

export interface I18nPhrases {
  simple_mode: string;
  vim_mode: string;
  line_nowrap: string;
  line_wrap: string;
  characters: string;
}

export const i18nFacet = Facet.define<I18nPhrases, I18nPhrases | undefined>({
  combine(value) {
    if (!value.length) return undefined;
    return Object.assign({}, ...value) as I18nPhrases;
  },
});

export const tr = (state: EditorState, msg: keyof I18nPhrases) => {
  return state.facet(i18nFacet)?.[msg] || msg;
};
