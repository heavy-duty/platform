import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { CodeEditorComponent } from './code-editor.component';

@NgModule({
  imports: [CommonModule, FormsModule, MonacoEditorModule],
  declarations: [CodeEditorComponent],
  exports: [CodeEditorComponent],
})
export class CodeEditorModule {}
