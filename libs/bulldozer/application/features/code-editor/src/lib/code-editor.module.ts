import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor';

import { CodeEditorComponent } from './code-editor.component';

@NgModule({
  imports: [CommonModule, FormsModule, MonacoEditorModule.forRoot()],
  declarations: [CodeEditorComponent],
  exports: [CodeEditorComponent],
})
export class CodeEditorModule {}
