import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { publicKeyValidator } from './public-key.validator';

@Component({
  selector: 'bd-import-workspace',
  template: `
    <h2 mat-dialog-title class="mat-primary">Import Workspace</h2>

    <form
      [formGroup]="form"
      class="flex flex-col gap-4"
      (ngSubmit)="onImportWorkspace()"
    >
      <mat-form-field
        class="w-full"
        appearance="fill"
        hintLabel="Enter the public key."
      >
        <mat-label>Workspace Public Key</mat-label>
        <input matInput formControlName="pubkey" required autocomplete="off" />

        <mat-error
          *ngIf="submitted && this.form.get('pubkey')?.hasError('required')"
          >The pubkey is mandatory.</mat-error
        >
        <mat-error
          *ngIf="submitted && this.form.get('pubkey')?.hasError('publicKey')"
          >The pubkey format is incorrect.</mat-error
        >
      </mat-form-field>

      <button
        mat-stroked-button
        color="primary"
        class="w-full"
        [disabled]="submitted && form.invalid"
      >
        Import
      </button>
    </form>

    <button
      mat-icon-button
      aria-label="Close import workspace form"
      class="w-8 h-8 leading-none absolute top-0 right-0"
      mat-dialog-close
    >
      <mat-icon>close</mat-icon>
    </button>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportWorkspaceComponent {
  @HostBinding('class') class = 'block w-72 relative';
  readonly form: FormGroup;
  submitted = false;

  constructor(
    private readonly _matSnackBar: MatSnackBar,
    private readonly _matDialogRef: MatDialogRef<ImportWorkspaceComponent>
  ) {
    this.form = new FormGroup({
      pubkey: new FormControl(null, {
        validators: [Validators.required, publicKeyValidator()],
      }),
    });
  }

  onImportWorkspace() {
    this.submitted = true;
    this.form.markAllAsTouched();

    if (this.form.valid) {
      this._matDialogRef.close(this.form.value);
    } else {
      this._matSnackBar.open('Invalid information', 'close', {
        panelClass: 'warning-snackbar',
        duration: 5000,
      });
    }
  }
}
