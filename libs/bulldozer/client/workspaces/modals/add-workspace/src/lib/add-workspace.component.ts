import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'bd-add-workspace',
  template: `
    <h2 mat-dialog-title class="mat-primary">Add workspace</h2>

    <div class="flex flex-col gap-2">
      <button
        class="w-full flex items-center gap-8 px-2 py-4 bg-white bg-opacity-5 border-l-4 border-transparent hover:border-primary transition duration-300 ease-out hover:ease-in"
        (click)="onNewWorkspace()"
      >
        <mat-icon>add</mat-icon>
        <div class="flex flex-col">
          <p class="m-0 font-bold uppercase text-lg text-left">New</p>
          <p class="m-0 text-xs text-left">Create a new workspace</p>
        </div>
      </button>

      <button
        class="w-full flex items-center gap-8 px-2 py-4 bg-white bg-opacity-5 border-l-4 border-transparent hover:border-primary transition duration-300 ease-out hover:ease-in"
        (click)="onImportWorkspace()"
      >
        <mat-icon>upload</mat-icon>
        <div class="flex flex-col">
          <p class="m-0 font-bold uppercase text-lg text-left">Import</p>
          <p class="m-0 text-xs text-left">Import a workspace</p>
        </div>
      </button>
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
