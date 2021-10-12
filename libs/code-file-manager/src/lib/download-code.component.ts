import { Component, Input } from '@angular/core';
import { IFormatedFullProgram } from '@heavy-duty/code-generator';

import { CodeFileManagerService } from './code-file-manager.service';

@Component({
  selector: 'bd-download-code',
  template: `
    <button mat-button color="accent" (click)="download()">
      <ng-content></ng-content>
    </button>
  `,
  styles: [],
})
export class DownloadCodeComponent {
  @Input() template: IFormatedFullProgram | null = null;

  constructor(private readonly _codeFileManagerSvc: CodeFileManagerService) {}

  download() {
    if (this.template) {
      this._codeFileManagerSvc.generateSampleFile(this.template);
    }
  }
}
