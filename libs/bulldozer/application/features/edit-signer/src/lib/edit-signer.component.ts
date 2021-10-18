import { Component, HostBinding, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InstructionAccount } from '@heavy-duty/bulldozer/application/utils/types';

@Component({
  selector: 'bd-edit-signer',
  template: `
    <h2 mat-dialog-title class="mat-primary">
      {{ data?.signer ? 'Edit' : 'Create' }} signer
    </h2>

    <form
      [formGroup]="signerGroup"
      class="flex flex-col gap-4"
      (ngSubmit)="onEditSigner()"
    >
      <mat-form-field
        class="w-full"
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

        <mat-error *ngIf="submitted && nameControl.errors?.required"
          >The name is mandatory.</mat-error
        >
        <mat-error *ngIf="submitted && nameControl.errors?.maxlength"
          >Maximum length is 32.</mat-error
        >
      </mat-form-field>

      <mat-form-field
        class="w-full"
        appearance="fill"
        hintLabel="Select a modifier."
      >
        <mat-label>Modifier</mat-label>
        <mat-select formControlName="modifier">
          <mat-option [value]="0">None</mat-option>
          <mat-option [value]="1">Init</mat-option>
          <mat-option [value]="2">Mut</mat-option>
        </mat-select>
        <mat-error *ngIf="submitted">The modifier is required.</mat-error>
      </mat-form-field>

      <button
        mat-stroked-button
        color="primary"
        class="w-full"
        [disabled]="submitted && signerGroup.invalid"
      >
        {{ data?.signer ? 'Save' : 'Create' }}
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
export class EditSignerComponent implements OnInit {
  @HostBinding('class') class = 'block w-72 relative';
  submitted = false;
  readonly signerGroup = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
    modifier: new FormControl(0, { validators: [Validators.required] }),
  });
  get nameControl() {
    return this.signerGroup.get('name') as FormControl;
  }
  get modifierControl() {
    return this.signerGroup.get('modifier') as FormControl;
  }

  constructor(
    private readonly _matSnackBar: MatSnackBar,
    private readonly _matDialogRef: MatDialogRef<EditSignerComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data?: {
      signer?: InstructionAccount;
    }
  ) {}

  ngOnInit() {
    if (this.data?.signer) {
      this.signerGroup.setValue(
        {
          name: this.data.signer.data.name,
          modifier: this.data.signer.data.modifier.id,
        },
        { emitEvent: false }
      );
    }
  }

  async onEditSigner() {
    this.submitted = true;
    this.signerGroup.markAllAsTouched();

    if (this.signerGroup.valid) {
      this._matDialogRef.close({
        name: this.nameControl.value,
        modifier: this.modifierControl.value,
      });
    } else {
      this._matSnackBar.open('Invalid information', 'close', {
        panelClass: 'warning-snackbar',
        duration: 5000,
      });
    }
  }
}
