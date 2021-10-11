import { Component, HostBinding, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InstructionArgument } from '@heavy-duty/bulldozer/data-access';

@Component({
  selector: 'bd-edit-argument',
  template: `
    <h2 mat-dialog-title class="mat-primary">
      {{ data?.argument ? 'Edit' : 'Create' }} argument
    </h2>

    <form
      [formGroup]="argumentGroup"
      class="flex flex-col gap-4"
      (ngSubmit)="onEditArgument()"
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
        hintLabel="Select a kind."
      >
        <mat-label>Kind</mat-label>
        <mat-select formControlName="kind">
          <mat-option [value]="0">u8</mat-option>
          <mat-option [value]="1">u16</mat-option>
          <mat-option [value]="2">u32</mat-option>
          <mat-option [value]="3">u64</mat-option>
          <mat-option [value]="4">u128</mat-option>
          <mat-option [value]="5">Pubkey</mat-option>
        </mat-select>
        <mat-error *ngIf="submitted">The kind is required.</mat-error>
      </mat-form-field>

      <mat-form-field
        class="w-full"
        appearance="fill"
        hintLabel="Select a modifier."
      >
        <mat-label>Modifier</mat-label>
        <mat-select formControlName="modifier">
          <mat-option [value]="0">None</mat-option>
          <mat-option [value]="1">Array</mat-option>
          <mat-option [value]="2">Vector</mat-option>
        </mat-select>
        <mat-error *ngIf="submitted">The modifier is required.</mat-error>
      </mat-form-field>

      <mat-form-field
        *ngIf="modifierControl.value === 1"
        class="w-full"
        appearance="fill"
        hintLabel="Enter the size."
      >
        <mat-label>Size</mat-label>
        <input
          matInput
          formControlName="size"
          required
          type="number"
          autocomplete="off"
          maxlength="32"
        />
        <mat-error *ngIf="submitted && sizeControl.errors?.required"
          >The size is mandatory.</mat-error
        >
        <mat-error *ngIf="submitted && sizeControl.errors?.min"
          >The size has to be above 1</mat-error
        >
      </mat-form-field>

      <button
        mat-stroked-button
        color="primary"
        class="w-full"
        [disabled]="submitted && argumentGroup.invalid"
      >
        {{ data?.argument ? 'Save' : 'Create' }}
      </button>
    </form>

    <button
      mat-icon-button
      aria-label="Close edit argument form"
      class="w-8 h-8 leading-none absolute top-0 right-0"
      mat-dialog-close
    >
      <mat-icon>close</mat-icon>
    </button>
  `,
})
export class EditArgumentComponent implements OnInit {
  @HostBinding('class') class = 'block w-72 relative';
  submitted = false;
  readonly argumentGroup = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
    kind: new FormControl(0, { validators: [Validators.required] }),
    modifier: new FormControl(0, { validators: [Validators.required] }),
    size: new FormControl(1, {
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  get nameControl() {
    return this.argumentGroup.get('name') as FormControl;
  }
  get kindControl() {
    return this.argumentGroup.get('kind') as FormControl;
  }
  get modifierControl() {
    return this.argumentGroup.get('modifier') as FormControl;
  }
  get sizeControl() {
    return this.argumentGroup.get('size') as FormControl;
  }

  constructor(
    private readonly _matSnackBar: MatSnackBar,
    private readonly _matDialogRef: MatDialogRef<EditArgumentComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data?: {
      argument?: InstructionArgument;
    }
  ) {}

  ngOnInit() {
    if (this.data?.argument) {
      this.argumentGroup.setValue(
        {
          name: this.data.argument.data.name,
          kind: this.data.argument.data.kind.id,
          modifier: this.data.argument.data.modifier.id,
          size: this.data.argument.data.modifier.size,
        },
        { emitEvent: false }
      );
    }
  }

  async onEditArgument() {
    this.submitted = true;
    this.argumentGroup.markAllAsTouched();

    if (this.argumentGroup.valid) {
      this._matDialogRef.close({
        name: this.nameControl.value,
        kind: this.kindControl.value,
        modifier: this.modifierControl.value,
        size: this.sizeControl.value,
      });
    } else {
      this._matSnackBar.open('Invalid information', 'close', {
        panelClass: 'warning-snackbar',
        duration: 5000,
      });
    }
  }
}
