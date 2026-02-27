import CodeViewer from "./CodeViewer.vue";
import CodeEditor from "./CodeEditor.vue";
import CodeEditor2 from "./CodeEditor2.vue";

export { CodeViewer, CodeEditor, CodeEditor2 };

type PropsOf<C> = C extends new (...args: any[]) => { $props: infer P } ? P : never;

export type CodeViewerComponent = typeof CodeViewer;
export type CodeViewerProps = PropsOf<CodeViewerComponent>;

export type CodeEditorComponent = typeof CodeEditor;
export type CodeEditorProps = PropsOf<CodeEditorComponent>;

export type CodeEditor2Component = typeof CodeEditor2;
export type CodeEditor2Props = PropsOf<CodeEditor2Component>;
