<script setup lang="ts">
import { CodeEditor, CodeEditor2, CodeViewer } from "~/components";
import dmstText from "~/assets/dmst.cpp?raw";
import headText from "~/assets/head.h?raw";
import ratingText from "~/assets/rating.rs?raw";
import euclideanoidText from "~/assets/euclideanoid.cpp?raw";
import fwtAndText from "~/assets/fwt_and.cpp?raw";
import fwtOrText from "~/assets/fwt_or.cpp?raw";
import { useColorMode } from "@vueuse/core";
import { computed, ref } from "vue";
import type { EditMode } from "~/lib";
import type { ViewerItem } from "./components/CodeViewer.vue";

const color = useColorMode();
color.value = "auto";
const presentColor = computed(() => color.value as "light" | "dark");

const viewerItems: ViewerItem[] = [
  {
    id: "1",
    label: "dmst.cpp",
    content: dmstText,
    lang: "cpp" as const,
    diagnostics: [
      {
        from: 7,
        to: 30,
        severity: "error",
        message: "Error message",
        source: "Manual",
      },

      {
        from: 300,
        to: 305,
        severity: "warning",
        message: "Warning message",
        source: "Manual",
      },

      {
        from: 310,
        to: 315,
        severity: "hint",
        message: "Hint message",
        source: "Manual",
      },

      {
        from: 340,
        to: 345,
        severity: "info",
        message: "info message",
        source: "Manual",
      },
    ],
  },
  {
    id: "2",
    label: "head.h",
    content: headText,
    lang: "cpp" as const,
  },
  {
    id: "3",
    label: "rating.rs",
    content: ratingText,
    lang: "rust" as const,
  },
  {
    id: "4",
    label: "fwt (diff)",
    content: fwtAndText,
    comparedContent: fwtOrText,
    lang: "cpp" as const,
  },
];

const code = ref(euclideanoidText);
const editMode = ref<EditMode>();

const multiTabs = ref([
  {
    id: "multi-1",
    label: "dmst.cpp",
    content: dmstText,
    lang: "cpp" as const,
  },
  {
    id: "multi-2",
    label: "head.h",
    content: headText,
    lang: "cpp" as const,
  },
  {
    id: "multi-3",
    label: "rating.rs",
    content: ratingText,
    lang: "rust" as const,
  },
]);

const multiActiveTab = ref<string | undefined>("multi-1");
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
        v-model="code"
        v-model:editMode="editMode"
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

      <p>Model Value:</p>

      <pre
        class="text-[13px] border border-slate-300 dark:border-slate-700 px-3 py-2 overflow-auto"
        >{{ code }}</pre
      >

      <p>Static code viewing demo:</p>

      <CodeViewer
        v-model:editMode="editMode"
        :items="viewerItems"
        :color-mode="presentColor"
        :initial-fold="{
          comment: true,
          preprocessor: true,
          using: true,
          typedef: true,
        }"
      />

      <p>Multi-tab code editor demo:</p>

      <CodeEditor2
        v-model="multiTabs"
        v-model:activeTab="multiActiveTab"
        v-model:editMode="editMode"
        :color-mode="presentColor"
        :i18n-phrases="{
          characters: '字符',
          line_nowrap: '不自动换行',
          line_wrap: '自动换行',
          simple_mode: '简单模式',
          vim_mode: 'Vim 模式',
        }"
        :initial-fold="{}"
      />

      <p>Multi-tab model value:</p>

      <pre
        class="text-[13px] border border-slate-300 dark:border-slate-700 px-3 py-2 overflow-auto"
        >{{ multiTabs }}</pre
      >
    </div>
  </div>
</template>
