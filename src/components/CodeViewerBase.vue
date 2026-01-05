<script setup lang="ts">
import { onMounted, ref, useTemplateRef, watch } from 'vue';
import { type I18nPrases, useEditorView, type EditorInstance, type FoldOptions, type InitOptions, type LangKind, type TabItem, type EditMode, type ColorMode, type Extension } from '~/lib';
import TabsPanel from './TabsPanel.vue';

const props = defineProps<{
  content?: string;
  editMode?: EditMode;
  comparedContent?: string;
  lang?: LangKind;
  /** additional editor extensions (not reactive) */
  extraExtensions?: Extension;
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
  extensions: props.extraExtensions,
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
          extensions: props.extraExtensions,
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
    <TabsPanel v-if="tabs" :tabs="tabs" v-model="activeTab" />
    <div ref="editorRoot" class="code-viewer-base" />
  </div>
</template>
