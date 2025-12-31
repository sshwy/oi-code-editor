import type { DefineComponent } from 'vue'
import CodeViewer from './CodeViewer.vue'

export * from '~/lib/useEditorView' 
export { CodeViewer }

type PropsOf<C> = C extends DefineComponent<infer P, any, any, any, any, any, any, any> ? P : never

export type CodeViewerComponent = typeof CodeViewer
export type CodeViewerProps = PropsOf<CodeViewerComponent>