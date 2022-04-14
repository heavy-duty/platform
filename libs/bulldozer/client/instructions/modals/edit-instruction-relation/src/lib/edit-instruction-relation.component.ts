import { Component, HostBinding, Inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InstructionAccountItemView } from '@bulldozer-client/instructions-data-access';
import { SnackBarComponent } from '@bulldozer-client/notification-snack-bar';

export const equalValidator =
  (a: string, b: string): ValidatorFn =>
  (control) => {
    if (control.get(a)?.value === control.get(b)?.value) {
      return { equal: true };
    }

    return null;
  };

@Component({
  selector: 'bd-edit-relation',
  template: `
    <h2 mat-dialog-title class="mat-primary">Create relation</h2>

    <form
      [formGroup]="form"
      class="flex flex-col gap-4"
      (ngSubmit)="onEditAccount()"
    >
      <mat-form-field
        class="w-full"
        appearance="fill"
        hintLabel="Select to account."
      >
        <mat-label>To</mat-label>
        <mat-select formControlName="to">
          <mat-option
            *ngFor="let account of data?.accounts"
            [value]="account.document.id"
          >
            {{ account.document.name }} |
            {{ account.document.id | obscureAddress }}
          </mat-option>
        </mat-select>
        <mat-error *ngIf="submitted">To is required.</mat-error>
      </mat-form-field>

      <mat-error
        *ngIf="submitted && form.hasError('equal')"
        class="text-center m-0"
        >Accounts have to be different.</mat-error
      >

      <button
        mat-stroked-button
        color="primary"
        class="w-full"
        [disabled]="submitted && form.invalid"
      >
        Create
      </button>
    </form>

    <button
      mat-icon-button
      aria-label="Close edit relation form"
      class="w-8 h-8 leading-none absolute top-0 right-0"
      mat-dialog-close
    >
      <mat-icon>close</mat-icon>
    </button>
  `,
})
export class EditInstructionRelationComponent {
  @HostBinding('class') class = 'block w-72 relative';
  readonly form: FormGroup;
  submitted = false;

  constructor(
    private readonly _matSnackBar: MatSnackBar,
    private readonly _matDialogRef: MatDialogRef<EditInstructionRelationComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      accounts: InstructionAccountItemView[];
      from: string;
    }
  ) {
    this.form = new FormGroup(
      {
        from: new FormControl(this.data.from, {
          validators: [Validators.required],
        }),
        to: new FormControl(null, { validators: [Validators.required] }),
      },
      {
        validators: [equalValidator('from', 'to')],
      }
    );
  }

  onEditAccount() {
    this.submitted = true;
    this.form.markAllAsTouched();

    if (this.form.valid) {
      this._matDialogRef.close(this.form.value);
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
