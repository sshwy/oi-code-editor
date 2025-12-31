import type { DefineComponent } from 'vue'
import HelloWorld from './HelloWorld.vue'

export { HelloWorld }

type PropsOf<C> = C extends DefineComponent<infer P, any, any, any, any, any, any, any> ? P : never

export type HelloWorldComponent = typeof HelloWorld
export type HelloWorldProps = PropsOf<HelloWorldComponent>

