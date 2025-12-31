<script setup lang="ts">
import { computed } from 'vue';
import type { FoldOptions, LangKind } from '~/lib/useEditorView';
import CodeViewerBase from './CodeViewerBase.vue';

const props = defineProps<{
  items: {
    id: string;
    label: string;
    content: string;
    lang?: LangKind;
    compareContent?: string;
    tabClassList?: string[];
  }[];
  noTabs?: boolean;
  noStatusPanel?: boolean;
  lineWrap?: boolean;
  initialFold?: FoldOptions;
  colorMode?: 'light' | 'dark';
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
      compareContent: undefined,
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
    :content="activeItem.content"
    :lang="activeItem.lang"
    :compared-content="activeItem.compareContent"
    :tabs="tabs"
    :active-tab="safeActiveId"
    :no-status-panel="noStatusPanel"
    :line-wrap="lineWrap"
    :color-mode="colorMode"
    @update:active-tab="activeId = $event"
    :initial-fold
  />
</template>
