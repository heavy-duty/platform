import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CodeEditorOptions } from './types';

@Component({
  selector: 'bd-code-editor',
  template: `
    <ngx-monaco-editor
      class="{{ customClass }}"
      [options]="options"
      [ngModel]="template"
      (ngModelChange)="onChange($event)"
    ></ngx-monaco-editor>
  `,
  styles: [],
})
export class CodeEditorComponent {
  @Input() template: string | null = null;
  @Input() customClass = '';
  @Input() options: CodeEditorOptions | null = {
    theme: 'vs-light',
    language: 'rust',
    automaticLayout: true,
    readOnly: false,
    fontSize: 16,
  };
  @Output() codeChange = new EventEmitter<string>();

  onChange(event: string) {
    this.codeChange.emit(event);
  }
}
