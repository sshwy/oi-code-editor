<script setup lang="ts">
import type { TabItem } from "~/lib";

defineProps<{
  tabs: TabItem[];
}>();

const activeTab = defineModel<string | undefined>({ required: true });
</script>
<template>
  <div class="code-viewer-tab-panel">
    <div
      v-for="item in tabs"
      :key="item.id"
      :class="['code-viewer-tab-item', activeTab === item.id ? 'code-viewer-tab-item-active' : '']"
      @click="activeTab = item.id"
    >
      {{ item.label }}
    </div>
  </div>
</template>

<style>
.code-viewer-tab-panel {
  position: sticky;
  top: var(--oce-header-height);
  z-index: 10;
  display: flex;
  font-size: 13px;
  border: 1px solid #ddd;
  border-bottom: none;
  background-color: #f5f5f5;
  color: black;
  overflow-x: auto;
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
  white-space: nowrap;
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
</style>
