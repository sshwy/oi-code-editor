<script setup lang="ts">
import { CodeEditor, CodeViewer } from '~/components';
import dmstText from '~/assets/dmst.cpp?raw';
import headText from '~/assets/head.h?raw'
import ratingText from '~/assets/rating.rs?raw'
import euclideanoidText from '~/assets/euclideanoid.cpp?raw'
import fwtAndText from '~/assets/fwt_and.cpp?raw'
import fwtOrText from '~/assets/fwt_or.cpp?raw'
import { useColorMode } from '@vueuse/core'
import { computed, ref } from 'vue';

const color = useColorMode()
color.value = 'auto'
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
}, {
  id: '4',
  label: 'fwt (diff)',
  content: fwtAndText,
  comparedContent: fwtOrText,
  lang: 'cpp' as const,
}]

const code = ref(euclideanoidText)
</script>

<template>
  <div class="w-screen">
    <div class="max-w-3xl px-4 mx-auto space-y-4">
      <h1 class="text-2xl font-medium my-4">Sshwy's OI Code Editor</h1>

      <p class="flex gap-2">
        <a href="https://github.com/sshwy/oi-code-editor" target="_blank" class="hover:underline"
          >[repo]</a
        >

        <a
          href="https://www.npmjs.com/package/@sshwy/oi-code-editor"
          target="_blank"
          class="hover:underline"
          >[package]</a
        >
      </p>

      <p>
        OICodeEditor contains a set of code viewing or editing components based on codemirror6 and
        Vue3, supporting multi-file, syntax highlighting and theme switching.
      </p>

      <p>Simple code editor demo:</p>

      <CodeEditor
        class="border border-slate-300 dark:border-slate-700"
        v-model="code"
        :color-mode="presentColor"
        lang="cpp"
        :i18n-phrases="{
          characters: '字符',
          line_nowrap: '不自动换行',
          line_wrap: '自动换行',
          simple_mode: '简单模式',
          vim_mode: 'Vim 模式',
        }"
      />

      <p>Static code viewing demo:</p>

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
