import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeEditorSettingsService } from './code-editor-settings.service';

@NgModule({
  imports: [CommonModule],
  providers: [CodeEditorSettingsService],
})
export class CodeEditorSettingsModule {}
