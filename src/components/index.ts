import CodeViewer from "./CodeViewer.vue";
import CodeEditor from "./CodeEditor.vue";

export { CodeViewer, CodeEditor };

type PropsOf<C> = C extends new (...args: any[]) => { $props: infer P } ? P : never;

export type CodeViewerComponent = typeof CodeViewer;
export type CodeViewerProps = PropsOf<CodeViewerComponent>;

export type CodeEditorComponent = typeof CodeEditor;
export type CodeEditorProps = PropsOf<CodeEditorComponent>;
