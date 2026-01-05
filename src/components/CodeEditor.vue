<script setup lang="ts">
import type { I18nPrases, LangKind, EditMode, ColorMode } from '~/lib';
import CodeViewerBase from './CodeViewerBase.vue';

defineProps<{
  lang?: LangKind;
  comparedContent?: string;
  colorMode?: ColorMode;
  i18nPhrases?: I18nPrases;
  noStatusPanel?: boolean;
}>();

const content = defineModel<string | undefined>({ required: true });
const editMode = defineModel<EditMode>('editMode');
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
  />
</template>
