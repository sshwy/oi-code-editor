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

/** State effect to update (partially) the current TabsState */
export const updateTabsState = StateEffect.define<Partial<TabsState>>();

const tabsFacet = Facet.define<TabsState, TabsState | undefined>({
  combine(value) {
    return value[0];
  },
});

export const tabsField = StateField.define<TabsState>({
  create() {
    return { tabs: [], activeId: undefined };
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
