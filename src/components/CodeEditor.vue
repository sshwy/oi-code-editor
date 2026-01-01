<script setup lang="ts">
import type { LangKind } from '~/lib';
import CodeViewerBase from './CodeViewerBase.vue';

defineProps<{
  lang?: LangKind;
  compareContent?: string;
  colorMode?: 'light' | 'dark';
}>();

const content = defineModel<string>({ required: true });
</script>

<template>
  <CodeViewerBase
    v-model:content="content"
    :lang="lang"
    :compared-content="compareContent"
    :color-mode="colorMode"
    editable
  />
</template>
