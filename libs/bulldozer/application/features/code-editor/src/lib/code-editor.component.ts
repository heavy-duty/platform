import { Component, Input } from '@angular/core';

@Component({
  selector: 'bd-code-editor',
  template: `
    <ngx-monaco-editor
      class="{{ customClass }}"
      [options]="options"
      [ngModel]="template"
    ></ngx-monaco-editor>
  `,
  styles: [],
})
export class CodeEditorComponent {
  @Input() template: string | null = null;
  @Input() customClass = '';
  @Input() options = {
    theme: 'vs-light',
    language: 'rust',
    automaticLayout: true,
    readOnly: false,
    fontSize: 16,
  };
}
