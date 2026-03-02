<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from "vue";
import {
  useEditorView,
  type I18nPhrases,
  type EditorInstance,
  type FoldOptions,
  type LangKind,
  type EditMode,
  type ColorMode,
  type Extension,
  type ViewUpdateInfo,
  type TabItem,
  type StateInitOptions,
  type TabDoc,
} from "~/lib";
import TabsPanel from "./TabsPanel.vue";
import type { StatusPanelOptions } from "~/lib/status-panel";

const props = defineProps<{
  /** default language when tab.lang is not provided */
  lang?: LangKind;
  colorMode?: ColorMode;
  i18nPhrases?: I18nPhrases;
  statusPanel?: StatusPanelOptions;
  /** additional editor extensions (not reactive) */
  extraExtensions?: Extension;
  initialFold?: FoldOptions;
  initialLineWrap?: boolean;
}>();

const tabsModel = defineModel<TabDoc[]>({ required: true });
const activeTab = defineModel<string | undefined>("activeTab");
const editMode = defineModel<EditMode>("editMode");

const editorRoot = useTemplateRef("editorRoot");
const inst = ref<EditorInstance>();

type EditorStateLike = EditorInstance["state"];
const tabStates = new Map<string, EditorStateLike>();

const headerTabs = computed(() => tabsModel.value.map<TabItem>(({ id, label }) => ({ id, label })));

const getActiveDoc = (tabs: TabDoc[], id: string | undefined) => {
  if (!tabs.length) return undefined;
  if (id) {
    const found = tabs.find((t) => t.id === id);
    if (found) return found;
  }
  return tabs[0];
};

const updateActiveTabContent = (newContent: string) => {
  const id = activeTab.value;
  if (!id) return;
  const tabs = tabsModel.value;
  const idx = tabs.findIndex((t) => t.id === id);
  if (idx === -1) return;
  const oldTab = tabs[idx]!;
  if (oldTab.content === newContent) return;
  const next = tabs.slice();
  next[idx] = { ...oldTab, content: newContent };
  tabsModel.value = next;
};

const handleUpdate = (info: ViewUpdateInfo) => {
  if (!info.update.state.doc.eq(info.update.startState.doc)) {
    const content = info.update.state.doc.toString();
    updateActiveTabContent(content);
  }
  if (info.editMode && editMode.value !== info.editMode) {
    editMode.value = info.editMode;
  }
};

const createStateInitForTab = (tab: TabDoc): StateInitOptions => ({
  color: props.colorMode,
  comparedContent: tab.comparedContent,
  content: tab.content,
  extensions: props.extraExtensions,
  fold: props.initialFold,
  i18nPhrases: props.i18nPhrases,
  lang: tab.lang ?? props.lang,
  statusPanel: props.statusPanel,
  // inherit run-time settings if available
  lineWrap: inst.value?.lineWrap ?? (props.initialLineWrap ? "wrap" : "nowrap"),
  editMode: editMode.value ?? inst.value?.editMode,
});

onMounted(() => {
  // keep activeTab valid whenever tabsModel ids change
  watch(
    () => tabsModel.value.map((t) => t.id),
    (ids) => {
      if (!ids.length) {
        if (activeTab.value !== undefined) activeTab.value = undefined;
        return;
      }
      if (!ids.includes(activeTab.value as string)) {
        activeTab.value = ids[0];
      }
    },
    { immediate: true },
  );

  // create editor view and react to props + tabs changes
  watch(
    [() => ({ ...props }), () => tabsModel.value, activeTab],
    ([newProps, tabs, activeId], [oldProps, oldTabs, oldActiveId]) => {
      if (!editorRoot.value || !tabs.length) return;

      const current = getActiveDoc(tabs, activeId);
      if (!current) return;

      if (!inst.value) {
        inst.value = useEditorView(editorRoot.value, {
          ...createStateInitForTab(current),
          onUpdate: handleUpdate,
          readonly: false,
        });
        tabStates.set(current.id, inst.value.state);
        return;
      }

      // invalidate removed or changed non-active tab states
      if (oldTabs) {
        const oldById = new Map<string, TabDoc>(oldTabs.map((t) => [t.id, t]));
        for (const tab of tabs) {
          const prev = oldById.get(tab.id);
          if (!prev) continue;
          if (tab.id === activeId) continue;
          if (
            tab.content !== prev.content ||
            tab.lang !== prev.lang ||
            tab.comparedContent !== prev.comparedContent
          ) {
            tabStates.delete(tab.id);
          }
        }
        for (const id of Array.from(tabStates.keys())) {
          if (!tabs.some((t) => t.id === id)) {
            tabStates.delete(id);
          }
        }
      }

      // color mode
      if (!oldProps || newProps.colorMode !== oldProps.colorMode) {
        inst.value.colorMode = newProps.colorMode;
      }

      const oldCurrent = oldTabs ? getActiveDoc(oldTabs, oldActiveId) : undefined;

      const newLang = current.lang ?? newProps.lang;
      const oldLang = oldCurrent?.lang ?? oldProps?.lang;
      if (newLang !== oldLang) {
        inst.value.lang = newLang;
      }

      const newCompared = current.comparedContent;
      const oldCompared = oldCurrent?.comparedContent;
      if (newCompared !== oldCompared) {
        inst.value.setOriginalDoc(newCompared);
      }
    },
    { immediate: true },
  );

  // tab switching with per-tab EditorState
  watch(
    activeTab,
    (newId, oldId) => {
      if (!inst.value) return;
      const tabs = tabsModel.value;
      if (!tabs.length) return;

      const oldDoc = oldId ? tabs.find((t) => t.id === oldId) : undefined;
      const newDoc = getActiveDoc(tabs, newId);

      if (oldDoc) {
        tabStates.set(oldDoc.id, inst.value.state);
      }

      if (!newDoc) return;

      const cached = tabStates.get(newDoc.id);
      if (cached) {
        inst.value.state = cached;
      } else {
        inst.value.recreateState(createStateInitForTab(newDoc));
        tabStates.set(newDoc.id, inst.value.state);
      }
    },
    { flush: "post" },
  );

  // external editMode changes
  watch(
    editMode,
    (mode, old) => {
      if (!inst.value) return;
      if (mode && mode !== old) {
        inst.value.editMode = mode;
      }
    },
    { flush: "post" },
  );
});
</script>

<template>
  <div>
    <TabsPanel v-if="tabsModel.length" :tabs="headerTabs" v-model="activeTab" />
    <div
      v-else
      class="code-viewer-tab-panel border border-dashed border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-500 dark:text-slate-400"
    >
      无文件
    </div>
    <div ref="editorRoot" class="code-viewer-base" v-show="tabsModel.length > 0" />
  </div>
</template>
