import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CodeEditorOptions } from './types';

@Component({
  selector: 'bd-code-editor',
  template: `
    <ngx-monaco-editor
      *ngIf="options !== null"
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
  @Input() options: CodeEditorOptions | null = null;
  @Output() codeChange = new EventEmitter<string>();

  onChange(event: string) {
    this.codeChange.emit(event);
  }
}
