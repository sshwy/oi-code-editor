import { Facet, StateEffect, StateField } from "@codemirror/state";

export interface TabItem {
  // unique identifier for the tab
  id: string;
  // tab label (title)
  label: string;
  classList?: string[];
}

export interface TabsState {
  // non-empty list of tabs
  tabs: TabItem[];
  // undefined means hide the tab bar
  activeId?: string;
}

// tabs extension
export const updateTabsState = StateEffect.define<Partial<TabsState>>();
export const tabsFacet = Facet.define<TabsState, TabsState | undefined>({
  combine(value) {
    return value[0];
  },
});
export const tabsField = (init: TabsState) =>
  StateField.define<TabsState>({
    create() {
      return init;
    },
    update(value, tr) {
      for (const e of tr.effects) {
        if (e.is(updateTabsState)) {
          value = { ...value, ...e.value };
        }
      }
      return value;
    },
    provide: (field) => tabsFacet.from(field),
  });
