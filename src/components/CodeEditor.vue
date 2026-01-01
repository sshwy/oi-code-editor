<script setup lang="ts">
import type { I18nPrases, LangKind } from '~/lib';
import CodeViewerBase from './CodeViewerBase.vue';

defineProps<{
  lang?: LangKind;
  comparedContent?: string;
  colorMode?: 'light' | 'dark';
  i18nPhrases?: I18nPrases;
}>();

const content = defineModel<string>({ required: true });
</script>

<template>
  <CodeViewerBase
    v-model:content="content"
    :lang
    :compared-content
    :color-mode
    editable
    :i18n-phrases
  />
</template>
