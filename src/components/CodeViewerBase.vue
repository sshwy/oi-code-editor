<script setup lang="ts">
import { onMounted, ref, useTemplateRef, watch } from 'vue';
import { type I18nPrases, useEditorView, type EditorInstance, type FoldOptions, type InitOptions, type LangKind, type TabItem, type EditMode, type ColorMode } from '~/lib';

const props = defineProps<{
  content?: string;
  editMode?: EditMode;
  comparedContent?: string;
  lang?: LangKind;
  editable?: boolean;
  initialLineWrap?: boolean;
  initialFold?: FoldOptions;
  // undefined means hide the tab bar
  tabs?: TabItem[];
  noStatusPanel?: boolean;
  colorMode?: ColorMode;
  i18nPhrases?: I18nPrases;
}>();

const emit = defineEmits<{
  "update:content": [content: string];
  "update:editMode": [editMode: EditMode];
  "bottomPanelMount": [el: HTMLElement]
}>();

const activeTab = defineModel<string | undefined>("activeTab");

const editorRoot = useTemplateRef("editorRoot");

const inst = ref<EditorInstance>();

const options: InitOptions = {
  readonly: !props.editable,
  color: props.colorMode || 'light',
  content: props.content || '',
  editMode: props.editMode,
  comparedContent: props.comparedContent,
  lang: props.lang,
  showStatusPanel: !props.noStatusPanel,
  lineWrap: props.initialLineWrap ? "wrap" : "nowrap",
  i18nPhrases: props.i18nPhrases,
  onStatusPanelMount() {
    const pannelWrapper = this.dom.parentElement;
    if (!pannelWrapper) return;
    emit("bottomPanelMount", pannelWrapper);
  },
  onUpdate(info) {
    if (!info.update.state.doc.eq(info.update.startState.doc)) {
      const content = info.update.state.doc.toString();
      emit("update:content", content);
    }
    if (info.editMode && props.editMode !== info.editMode) {
      emit("update:editMode", info.editMode);
    }
  },
}

onMounted(() => {
  if (!editorRoot.value) return;
  inst.value = useEditorView(editorRoot.value, options);
  inst.value.fold(props.initialFold);

  // to make the new props and old props different, we need to destruct the props
  // in the getter function
  watch(
    [() => ({ ...props }), activeTab],
    ([props, activeTab], [old, oldActiveTab]) => {
      if (!inst.value) return;

      // update editor state from props if the editor is readonly
      // If the editor is editable, the content can only be updated by the user.
      if (props.content !== old.content && !props.editable) {
        inst.value.setState({
          content: props.content || '',
          comparedContent: props.comparedContent,
          lang: props.lang,
          showStatusPanel: !props.noStatusPanel,
          color: props.colorMode,
          i18nPhrases: props.i18nPhrases,
          // inherit these settings from previous state
          lineWrap: inst.value.lineWrap,
          editMode: inst.value.editMode,
        });
        inst.value.fold(props.initialFold);
        return;
      }

      if (props.colorMode !== old.colorMode) {
        inst.value.colorMode = props.colorMode;
      }

      if (props.comparedContent !== old.comparedContent) {
        inst.value.setOriginalDoc(props.comparedContent);
      }

      if (props.lang !== old.lang) {
        inst.value.lang = props.lang;
      }

      if (props.editMode && props.editMode !== old.editMode) {
        inst.value.editMode = props.editMode;
      }
    },
  );
});
</script>

<template>
  <div>
    <div v-if="tabs" class="code-viewer-tab-panel">
      <div
        v-for="item in tabs"
        :key="item.id"
        :class="['code-viewer-tab-item', activeTab === item.id ? 'code-viewer-tab-item-active' : '']"
        @click="activeTab = item.id"
      >
        {{ item.label }}
      </div>
    </div>
    <div ref="editorRoot" class="code-viewer-base" />
  </div>
</template>

<style>
.code-viewer-tab-panel {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  font-size: 13px;
  border: 1px solid #ddd;
  border-bottom: none;
  background-color: #f5f5f5;
  color: black;
}
.dark .code-viewer-tab-panel {
  border: none;
  background-color: #21252b;
  color: #abb2bf;
}

.code-viewer-tab-panel > .code-viewer-tab-item {
  padding: 4px 12px;
  border-right: 1px solid #ddd;
  cursor: pointer;
}
.dark .code-viewer-tab-panel > .code-viewer-tab-item {
  border-right: 1px solid #383838;
}

.code-viewer-tab-panel > .code-viewer-tab-item:hover {
  background-color: #ffffff80;
}
.dark .code-viewer-tab-panel > .code-viewer-tab-item:hover {
  background-color: #ffffff0f;
}

.code-viewer-tab-item-active {
  background-color: #fff;
  color: black;
}
.dark .code-viewer-tab-item-active {
  background-color: #282c34;
  color: #eee;
}

.code-viewer-base .cm-panels.cm-panels-top {
  top: var(--header-height) !important;
}

.code-viewer-base .cm-scroller {
  font-family: var(--font-mono) !important;
  font-size: 13px;
}
</style>
