import type { LangKind } from "./language-supports";
import type { Diagnostic } from "./lint";

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

export interface TabDoc {
  id: string;
  label: string;
  content: string;
  lang?: LangKind;
  comparedContent?: string;
}

export interface TabDiagnostic extends Diagnostic {
  tabId: string;
}
