import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeFileManagerService } from './code-file-manager.service';
import { DownloadCodeComponent } from './download-code.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [CommonModule, MatButtonModule],
  providers: [CodeFileManagerService],
  declarations: [DownloadCodeComponent],
  exports: [DownloadCodeComponent],
})
export class CodeFileManagerModule {}
