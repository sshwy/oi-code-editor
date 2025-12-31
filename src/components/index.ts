import type { DefineComponent } from 'vue'
import HelloWorld from './HelloWorld.vue'
import CodeViewer from './CodeViewer.vue'

export { HelloWorld, CodeViewer }

type PropsOf<C> = C extends DefineComponent<infer P, any, any, any, any, any, any, any> ? P : never

export type HelloWorldComponent = typeof HelloWorld
export type HelloWorldProps = PropsOf<HelloWorldComponent>

export type CodeViewerComponent = typeof CodeViewer
export type CodeViewerProps = PropsOf<CodeViewerComponent>