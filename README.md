# oi-code-editor

`oi-code-editor` is a Vue 3 component library that currently exports the `HelloWorld` component as a named export. The project doubles as a documentation site through the existing Vite app, so the sample page in `src/App.vue` can be used to preview and test the component in a real app shell.

## Development

- `pnpm dev` starts the Vite dev server and renders `src/App.vue`, which imports the component from `src/components/HelloWorld.vue`.
- `src/main.ts` bootstraps the documentation page and is intentionally separate from the library entry so the demo can stay synced with the published component.

## Building

- `pnpm build` runs `vue-tsc` and builds the documentation site (`vite build` with the default config).
- `pnpm build:lib` runs the same type check plus `vite build --config vite.config.lib.ts` to emit the library bundles from `src/components/index.ts`.

The generated artifacts are placed in `dist`, with the library exposing the ESM and CJS bundles plus declaration files under `dist/types`.

## Usage

```ts
import { createApp } from 'vue'
import { HelloWorld } from 'oi-code-editor'

createApp({
  template: '<HelloWorld msg=\"hello\" />',
}).mount('#app')
```

The library only exposes `HelloWorld` as a named export (no default export), and the `msg` prop is required.
