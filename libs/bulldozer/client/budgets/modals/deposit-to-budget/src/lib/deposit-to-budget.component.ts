import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '@bulldozer-client/notification-snack-bar';

@Component({
  selector: 'bd-deposit-to-budget',
  template: `
    <h2 mat-dialog-title class="mat-primary">Deposit to Budget</h2>

    <form
      [formGroup]="form"
      class="flex flex-col gap-4"
      (ngSubmit)="onDepositToBudget()"
    >
      <mat-form-field
        class="w-full"
        appearance="fill"
        hintLabel="Enter the amount."
      >
        <mat-label>Amount</mat-label>
        <input
          matInput
          formControlName="amount"
          required
          autocomplete="off"
          maxlength="32"
        />

        <mat-error
          *ngIf="submitted && this.form.get('amount')?.hasError('required')"
          >The amount is mandatory.</mat-error
        >
        <mat-error *ngIf="submitted && this.form.get('amount')?.hasError('min')"
          >Minimum of 1 lamport.</mat-error
        >
      </mat-form-field>

      <button
        mat-stroked-button
        color="primary"
        class="w-full"
        [disabled]="submitted && form.invalid"
      >
        Deposit
      </button>
    </form>

    <button
      mat-icon-button
      aria-label="Close deposit to budget form"
      class="w-8 h-8 leading-none absolute top-0 right-0"
      mat-dialog-close
    >
      <mat-icon>close</mat-icon>
    </button>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositToBudgetComponent {
  @HostBinding('class') class = 'block w-72 relative';
  readonly form: FormGroup;
  submitted = false;

  constructor(
    private readonly _matSnackBar: MatSnackBar,
    private readonly _matDialogRef: MatDialogRef<DepositToBudgetComponent>
  ) {
    this.form = new FormGroup({
      amount: new FormControl(null, {
        validators: [Validators.required, Validators.min(0)],
      }),
    });
  }

  onDepositToBudget() {
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
