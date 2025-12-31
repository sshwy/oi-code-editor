<script setup lang="ts">
import { CodeEditor, CodeViewer } from '~/components';
import dmstText from '~/assets/dmst.cpp?raw';
import headText from '~/assets/head.h?raw'
import ratingText from '~/assets/rating.rs?raw'
import euclideanoidText from '~/assets/euclideanoid.cpp?raw'
import { useColorMode } from '@vueuse/core'
import { computed, ref } from 'vue';

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

const code = ref(euclideanoidText)
</script>

<template>
  <div class="w-screen">
    <div class="max-w-3xl px-4 mx-auto space-y-4">
      <h1 class="text-2xl font-medium my-4">Sshwy's OI Code Editor</h1>

      <p>
        OICodeEditor 包含一系列基于 codemirror6 和
        Vue3，支持多文件、语法高亮和主题切换的代码查看或编辑组件。
      </p>

      <p>简单代码编辑器示例：</p>

      <CodeEditor
        class="border border-slate-300 dark:border-slate-700"
        v-model="code"
        :color-mode="presentColor"
        lang="cpp"
      />

      <p>静态代码展示示例：</p>

      <CodeViewer
        :items="items"
        class="border border-slate-300 dark:border-slate-700"
        :color-mode="presentColor"
        :initial-fold="{
          comment: true,
          preprocessor: true,
          using: true,
          typedef: true,
        }"
      />
    </div>
  </div>
</template>
