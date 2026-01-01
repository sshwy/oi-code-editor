import { EditorState, Facet } from "@codemirror/state";

export interface I18nPrases {
  simple_mode: string;
  vim_mode: string;
  line_nowrap: string;
  line_wrap: string;
  characters: string;
}

export const i18nFacet = Facet.define<I18nPrases, I18nPrases | undefined>({
  combine(value) {
    return value[0];
  },
});

export const tr = (state: EditorState, msg: keyof I18nPrases) => {
  return state.facet(i18nFacet)?.[msg] || msg;
};
