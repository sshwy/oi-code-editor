<script setup lang="ts">
import { CodeViewer } from '~/components';

const items = [{
  id: '1',
  label: 'Code 1',
  content: 'console.log("Hello, world!");',
  lang: 'cpp' as const,
}]
</script>

<template>
  <div>
    <CodeViewer :items="items" />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
