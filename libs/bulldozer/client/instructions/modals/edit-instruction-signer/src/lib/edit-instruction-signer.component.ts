import { Component, HostBinding, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '@bulldozer-client/notification-snack-bar';
import { InstructionAccountDto } from '@heavy-duty/bulldozer-devkit';

@Component({
  selector: 'bd-edit-instruction-signer',
  template: `
    <h2 mat-dialog-title class="mat-primary">
      {{ signer ? 'Edit' : 'Create' }} signer
    </h2>

    <form
      [formGroup]="form"
      class="flex flex-col gap-4"
      (ngSubmit)="onEditSigner()"
    >
      <mat-form-field
        class="w-full mb-4"
        appearance="fill"
        hintLabel="Enter the name."
      >
        <mat-label>Name</mat-label>
        <input
          matInput
          formControlName="name"
          required
          autocomplete="off"
          maxlength="32"
        />
        <mat-hint align="end">{{ nameControl.value?.length || 0 }}/32</mat-hint>

        <mat-error *ngIf="submitted && nameControl.hasError('required')"
          >The name is mandatory.</mat-error
        >
        <mat-error *ngIf="submitted && nameControl.hasError('maxlength')"
          >Maximum length is 32.</mat-error
        >
      </mat-form-field>

      <mat-checkbox formControlName="saveChanges">Save changes.</mat-checkbox>

      <button
        mat-stroked-button
        color="primary"
        class="w-full"
        [disabled]="submitted && form.invalid"
      >
        {{ signer ? 'Save' : 'Create' }}
      </button>
    </form>

    <button
      mat-icon-button
      aria-label="Close edit account form"
      class="w-8 h-8 leading-none absolute top-0 right-0"
      mat-dialog-close
    >
      <mat-icon>close</mat-icon>
    </button>
  `,
})
export class EditInstructionSignerComponent {
  @HostBinding('class') class = 'block w-72 relative';
  readonly form: FormGroup;
  submitted = false;

  get nameControl() {
    return this.form.get('name') as FormControl;
  }
  get saveChangesControl() {
    return this.form.get('saveChanges') as FormControl;
  }

  constructor(
    private readonly _matSnackBar: MatSnackBar,
    private readonly _matDialogRef: MatDialogRef<EditInstructionSignerComponent>,
    @Inject(MAT_DIALOG_DATA)
    public signer?: InstructionAccountDto
  ) {
    this.form = new FormGroup({
      name: new FormControl(this.signer?.name ?? '', {
        validators: [Validators.required],
      }),
      saveChanges: new FormControl(this.signer?.modifier === 1),
    });
  }

  onEditSigner() {
    this.submitted = true;
    this.form.markAllAsTouched();

    if (this.form.valid) {
      this._matDialogRef.close({
        name: this.nameControl.value,
        modifier: this.saveChangesControl.value ? 1 : null,
        kind: 1,
        space: null,
        collection: null,
        payer: null,
        close: null,
      });
    } else {
      this._matSnackBar.openFromComponent(SnackBarComponent, {
        duration: 5000,
        data: {
          title: 'Heey...',
          message: 'Invalid Information',
          type: 'warning',
        },
      });
    }
  }
}
