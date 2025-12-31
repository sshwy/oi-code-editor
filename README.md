# oi-code-editor

`oi-code-editor` is a showcase plus component suite centered around the `CodeViewer` component. The demo (`src/App.vue`) renders `CodeViewer` with a trio of code snippets (`dmst.cpp`, `head.h`, `rating.rs`) loaded via the `?raw` loader, and it keeps the viewer in sync with the current theme by binding VueUse's `useColorMode` to the component's `colorMode` prop.

## App demo

The documentation app (`src/App.vue`) does the following:

1. Imports `CodeViewer` from `~/components` along with raw text assets for each sample file.
2. Tracks the current color mode via `useColorMode` and computes a `'light'` or `'dark'` value to pass down as `:color-mode="presentColor"`.
3. Passes an `items` array (id, label, content, lang) to `CodeViewer`, which renders the files in a tabbed code view with syntax highlighting and status controls.

Running `pnpm dev` launches this demo so you can preview how `CodeViewer` behaves with real code samples and theme transitions.

## Development

1. Install dependencies: `pnpm install`.
2. Run the demo: `pnpm dev`.
   - This boots Vite, which mounts `src/App.vue` and renders the `CodeViewer` component with the sample data described above.

## Building

- `pnpm build` performs `vue-tsc` type checking and builds the documentation site via the default Vite configuration.
- `pnpm build:lib` runs the same type checking step and then uses `vite build --config vite.config.lib.ts` to emit the library bundles defined in `src/components/index.ts`.

Build artifacts appear in `dist/`, with the library delivering ESM/CJS bundles plus TypeScript declarations under `dist/types`.

## Usage

```ts
import { createApp } from 'vue'
import { CodeViewer } from 'oi-code-editor/components'

createApp({
  template: '<CodeViewer :items="items" />',
  data: () => ({
    items: [
      { id: '1', label: 'dmst.cpp', content: '...cpp source...', lang: 'cpp' },
      { id: '2', label: 'head.h', content: '...header...', lang: 'cpp' },
      { id: '3', label: 'rating.rs', content: '...Rust source...', lang: 'rust' },
    ],
  }),
}).mount('#app')
```

`CodeViewer` accepts optional tabs, status panel controls, line wrapping, and a `colorMode` prop so it can integrate with both light and dark themes. The demo app shows how to configure these props for a tabbed, theme-aware presentation.
