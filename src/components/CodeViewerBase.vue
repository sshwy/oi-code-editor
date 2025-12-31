<script setup lang="ts">
import { onMounted, ref, useTemplateRef, watch } from 'vue';
import { useEditorView, type EditorInstance, type LangKind, type TabItem } from '~/lib/useEditorView';

const props = defineProps<{
  content: string;
  comparedContent?: string;
  lang?: LangKind;
  editable?: boolean;
  initialLineWrap?: boolean;
  // undefined means hide the tab bar
  tabs?: TabItem[];
  noStatusPanel?: boolean;
  colorMode?: "light" | "dark";
}>();

const emit = defineEmits<{
  "update:content": [content: string];
  "panelMount": [el: HTMLElement]
}>();

const activeTab = defineModel<string | undefined>("activeTab");

const editorRoot = useTemplateRef("editorRoot");

const inst = ref<EditorInstance>();

onMounted(() => {
  if (!editorRoot.value) return;
  inst.value = useEditorView(editorRoot.value, {
    readonly: !props.editable,
    color: props.colorMode || 'light',
    content: props.content,
    comparedContent: props.comparedContent,
    lang: props.lang,
    showStatusPanel: !props.noStatusPanel,
    lineWrap: props.initialLineWrap ? "wrap" : "nowrap",
    tabs: props.tabs
      ? {
          tabs: props.tabs,
          activeId: activeTab.value,
        }
      : undefined,
    onClickTab(item) {
      activeTab.value = item.id;
    },
    onPanelMount() {
      const pannelWrapper = this.dom.parentElement;
      if (!pannelWrapper) return;
      emit("panelMount", pannelWrapper);
    },
    onUpdate(info) {
      const content = info.update.state.doc.toString();
      emit("update:content", content);
    },
  });

  // to make the new props and old props different, we need to destruct the props
  // in the getter function
  watch(
    [() => ({ ...props }), activeTab],
    ([props, activeTab], [old, oldActiveTab]) => {
      if (!inst.value) return;

      // If the editor is editable, the content can only be updated by the user.
      if (props.content !== old.content && !props.editable) {
        inst.value.setState({
          content: props.content,
          comparedContent: props.comparedContent,
          lang: props.lang,
          showStatusPanel: !props.noStatusPanel,
          tabs: props.tabs
            ? {
                tabs: props.tabs,
                activeId: activeTab,
              }
            : undefined,
          color: props.colorMode,
          // inherit these settings from previous state
          lineWrap: inst.value.lineWrap,
          editMode: inst.value.editMode,
        });
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

      if (props.tabs !== old.tabs) {
        inst.value.updateTabs(
          props.tabs
            ? {
                tabs: props.tabs,
                activeId: activeTab,
              }
            : { tabs: [], activeId: undefined },
        );
      } else if (activeTab !== oldActiveTab) {
        inst.value.updateTabs({
          activeId: activeTab,
        });
      }
    },
  );
});
</script>

<template>
  <div
    ref="editorRoot"
    class="code-viewer-base"
  />
</template>

<style>
.code-viewer-base .cm-panels.cm-panels-top {
  top: var(--header-height) !important;
}

.code-viewer-base .cm-scroller {
  font-family: var(--font-mono) !important;
  font-size: 13px;
}
</style>
