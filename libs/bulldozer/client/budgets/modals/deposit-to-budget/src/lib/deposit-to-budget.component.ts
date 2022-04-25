import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '@bulldozer-client/notification-snack-bar';

@Component({
  selector: 'bd-deposit-to-budget',
  template: `
    <h2 mat-dialog-title class="mat-primary bd-font">Deposit to Budget</h2>

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

      <div
        class="py-2 px-5 w-full h-12 bd-bg-image-11 shadow flex justify-center items-center m-auto mt-4 relative bg-bd-black"
      >
        <button class="bd-button flex-1" mat-dialog-close>Cancel</button>
        <button class="bd-button flex-1" [disabled]="submitted && form.invalid">
          Deposit
        </button>
        <div
          class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-5 left-2"
        >
          <div class="w-full h-px bg-gray-600 rotate-45"></div>
        </div>
        <div
          class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-5 right-2"
        >
          <div class="w-full h-px bg-gray-600 rotate-12"></div>
        </div>
      </div>
    </form>
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
