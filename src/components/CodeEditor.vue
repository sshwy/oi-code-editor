<script setup lang="ts">
import type { I18nPhrases, LangKind, EditMode, ColorMode, Extension } from "~/lib";
import CodeViewerBase from "./CodeViewerBase.vue";

defineProps<{
  lang?: LangKind;
  comparedContent?: string;
  colorMode?: ColorMode;
  i18nPhrases?: I18nPhrases;
  noStatusPanel?: boolean;
  /** additional editor extensions (not reactive) */
  extraExtensions?: Extension;
}>();

const content = defineModel<string | undefined>({ required: true });
const editMode = defineModel<EditMode>("editMode");
</script>

<template>
  <CodeViewerBase
    v-model:content="content"
    v-model:editMode="editMode"
    :lang
    :compared-content
    :color-mode
    :no-status-panel
    editable
    :i18n-phrases
    :extra-extensions
  />
</template>
