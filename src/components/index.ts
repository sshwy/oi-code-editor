import type { DefineComponent } from "vue";
import CodeViewer from "./CodeViewer.vue";
import CodeEditor from "./CodeEditor.vue";

export { CodeViewer, CodeEditor };

type PropsOf<C> = C extends DefineComponent<infer P, any, any, any, any, any, any, any> ? P : never;

export type CodeViewerComponent = typeof CodeViewer;
export type CodeViewerProps = PropsOf<CodeViewerComponent>;

export type CodeEditorComponent = typeof CodeEditor;
export type CodeEditorProps = PropsOf<CodeEditorComponent>;
