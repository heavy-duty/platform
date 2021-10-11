import { Component, HostBinding, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InstructionAccount, Program } from '@heavy-duty/bulldozer/data-access';

@Component({
  selector: 'bd-edit-program-account',
  template: `
    <h2 mat-dialog-title class="mat-primary">
      {{ data?.account ? 'Edit' : 'Create' }} account
    </h2>

    <form
      [formGroup]="accountGroup"
      class="flex flex-col gap-4"
      (ngSubmit)="onEditProgramAccount()"
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
        hintLabel="Select a program."
      >
        <mat-label>Program</mat-label>
        <mat-select formControlName="program">
          <mat-option
            *ngFor="let program of data?.programs"
            [value]="program.id"
          >
            {{ program.name }} |
            {{ program.id | obscureAddress }}
          </mat-option>
        </mat-select>
        <mat-error *ngIf="submitted">The program is required.</mat-error>
      </mat-form-field>

      <button
        mat-stroked-button
        color="primary"
        class="w-full"
        [disabled]="submitted && accountGroup.invalid"
      >
        {{ data?.account ? 'Save' : 'Create' }}
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
export class EditProgramAccountComponent implements OnInit {
  @HostBinding('class') class = 'block w-72 relative';
  submitted = false;
  readonly accountGroup = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
    program: new FormControl(null, { validators: [Validators.required] }),
  });
  get nameControl() {
    return this.accountGroup.get('name') as FormControl;
  }
  get programControl() {
    return this.accountGroup.get('program') as FormControl;
  }

  constructor(
    private readonly _matSnackBar: MatSnackBar,
    private readonly _matDialogRef: MatDialogRef<EditProgramAccountComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data?: {
      account?: InstructionAccount;
      programs: Program[];
    }
  ) {}

  ngOnInit() {
    if (this.data?.account) {
      this.accountGroup.setValue(
        {
          name: this.data.account.data.name,
          program: this.data.account.data.program,
        },
        { emitEvent: false }
      );
    }
  }

  async onEditProgramAccount() {
    this.submitted = true;
    this.accountGroup.markAllAsTouched();

    if (this.accountGroup.valid) {
      this._matDialogRef.close({
        name: this.nameControl.value,
        program: this.programControl.value,
      });
    } else {
      this._matSnackBar.open('Invalid information', 'close', {
        panelClass: 'warning-snackbar',
        duration: 5000,
      });
    }
  }
}
