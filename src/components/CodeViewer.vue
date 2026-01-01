<script setup lang="ts">
import { computed } from 'vue';
import type { FoldOptions, I18nPrases, LangKind } from '~/lib';
import CodeViewerBase from './CodeViewerBase.vue';

const props = defineProps<{
  items: {
    id: string;
    label: string;
    content: string;
    lang?: LangKind;
    comparedContent?: string;
    tabClassList?: string[];
  }[];
  noTabs?: boolean;
  noStatusPanel?: boolean;
  lineWrap?: boolean;
  initialFold?: FoldOptions;
  colorMode?: 'light' | 'dark';
  i18nPhrases?: I18nPrases;
}>();

const activeId = defineModel<string | undefined>();
const safeActiveId = computed<string | undefined>(() => {
  if (props.items.length === 0) return undefined;
  if (activeId.value === undefined) return props.items[0]?.id;
  return activeId.value;
});
const activeItem = computed(
  () =>
    props.items.find((item) => item.id === safeActiveId.value) || {
      id: "_empty",
      content: "<empty>",
      lang: undefined,
      comparedContent: undefined,
    },
);

const tabs = computed(() =>
  props.noTabs
    ? undefined
    : props.items.map((item) => ({
        id: item.id,
        label: item.label,
        classList: item.tabClassList,
      })),
);
</script>

<template>
  <CodeViewerBase
    :active-tab="safeActiveId"
    @update:active-tab="activeId = $event"
    :content="activeItem.content"
    :lang="activeItem.lang"
    :compared-content="activeItem.comparedContent"
    :tabs="tabs"
    :no-status-panel
    :line-wrap
    :color-mode
    :initial-fold
    :i18n-phrases
  />
</template>
