import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'bd-add-workspace',
  template: `
    <h2 mat-dialog-title class="mat-primary bd-font">Add workspace</h2>

    <div
      class="w-full py-4 px-7 h-16 flex justify-center items-center m-auto bd-bg-image-11 bg-bd-black shadow relative"
    >
      <button class="bd-button w-full" (click)="onNewWorkspace()">
        Create
      </button>
      <button class="bd-button w-full" (click)="onImportWorkspace()">
        Import
      </button>

      <div
        class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-7 left-2"
      >
        <div class="w-full h-px bg-gray-600 rotate-45"></div>
      </div>
      <div
        class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-7 right-2"
      >
        <div class="w-full h-px bg-gray-600"></div>
      </div>
    </div>

    <button
      mat-icon-button
      aria-label="Close add workspace form"
      class="w-8 h-8 leading-none absolute top-0 right-0"
      mat-dialog-close
    >
      <mat-icon>close</mat-icon>
    </button>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddWorkspaceComponent {
  @HostBinding('class') class = 'block w-72 relative';

  constructor(
    private readonly _matDialogRef: MatDialogRef<AddWorkspaceComponent>
  ) {}

  onNewWorkspace() {
    this._matDialogRef.close('new');
  }

  onImportWorkspace() {
    this._matDialogRef.close('import');
  }
}
