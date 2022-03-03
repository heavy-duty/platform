export interface CodeEditorOptions {
  theme: string;
  language: string;
  automaticLayout: boolean;
  readOnly: boolean;
  fontSize: number;
  wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
}
