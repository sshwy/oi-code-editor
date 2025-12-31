<script setup lang="ts">
import { CodeViewer } from '~/components';
import dmstText from '~/assets/dmst.cpp?raw';
import headText from '~/assets/head.h?raw'
import ratingText from '~/assets/rating.rs?raw'
import { useColorMode } from '@vueuse/core'
import { computed } from 'vue';

const color = useColorMode()
const presentColor = computed(() => color.value as 'light' | 'dark')

const items = [{
  id: '1',
  label: 'dmst.cpp',
  content: dmstText,
  lang: 'cpp' as const,
}, {
  id: '2',
  label: 'head.h',
  content: headText,
  lang: 'cpp' as const,
}, {
  id: '3',
  label: 'rating.rs',
  content: ratingText,
  lang: 'rust' as const,
}]
</script>

<template>
  <div class="w-screen">
    <div class="max-w-3xl px-4 mx-auto">
      <h1 class="text-2xl font-medium my-4">Sshwy's OI Code Editor</h1>

      <CodeViewer :items="items" class="border border-slate-300 dark:border-slate-600" :color-mode="presentColor" />
    </div>
  </div>
</template>
