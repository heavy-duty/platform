import {
  Component,
  HostBinding,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Collection,
  InstructionAccountExtended,
  InstructionRelationExtended,
} from '@heavy-duty/bulldozer/application/utils/types';
import { Subject } from 'rxjs';

@Component({
  selector: 'bd-edit-relation',
  template: `
    <h2 mat-dialog-title class="mat-primary">
      {{ data?.relation ? 'Edit' : 'Create' }} relation
    </h2>

    <form
      [formGroup]="relationGroup"
      class="flex flex-col gap-4"
      (ngSubmit)="onEditAccount()"
    >
      <mat-form-field
        class="w-full"
        appearance="fill"
        hintLabel="Select from account."
      >
        <mat-label>From</mat-label>
        <mat-select formControlName="from">
          <mat-option
            *ngFor="let account of data?.accounts"
            [value]="account.id"
          >
            {{ account.data.name }} |
            {{ account.id | obscureAddress }}
          </mat-option>
        </mat-select>
        <mat-error *ngIf="submitted">From is required.</mat-error>
      </mat-form-field>

      <mat-form-field
        class="w-full"
        appearance="fill"
        hintLabel="Select to account."
      >
        <mat-label>To</mat-label>
        <mat-select formControlName="to">
          <mat-option
            *ngFor="let account of data?.accounts"
            [value]="account.id"
          >
            {{ account.data.name }} |
            {{ account.id | obscureAddress }}
          </mat-option>
        </mat-select>
        <mat-error *ngIf="submitted">To is required.</mat-error>
      </mat-form-field>

      <button
        mat-stroked-button
        color="primary"
        class="w-full"
        [disabled]="submitted && relationGroup.invalid"
      >
        {{ data?.relation ? 'Save' : 'Create' }}
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
export class EditRelationComponent implements OnInit, OnDestroy {
  @HostBinding('class') class = 'block w-72 relative';
  private readonly _destroy = new Subject();
  readonly destroy$ = this._destroy.asObservable();
  submitted = false;
  readonly relationGroup = new FormGroup({
    from: new FormControl(null, { validators: [Validators.required] }),
    to: new FormControl(null, { validators: [Validators.required] }),
  });
  get fromControl() {
    return this.relationGroup.get('from') as FormControl;
  }
  get toControl() {
    return this.relationGroup.get('to') as FormControl;
  }

  constructor(
    private readonly _matSnackBar: MatSnackBar,
    private readonly _matDialogRef: MatDialogRef<EditRelationComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data?: {
      relation?: InstructionRelationExtended;
      collections: Collection[];
      accounts: InstructionAccountExtended[];
    }
  ) {}

  ngOnInit() {
    if (this.data?.relation) {
      this.relationGroup.setValue(
        {
          from: this.data.relation.data.from.id,
          to: this.data.relation.data.to.id,
        },
        { emitEvent: false }
      );
    }
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }

  async onEditAccount() {
    this.submitted = true;
    this.relationGroup.markAllAsTouched();

    if (this.relationGroup.valid) {
      this._matDialogRef.close({
        from: this.fromControl.value,
        to: this.toControl.value,
      });
    } else {
      this._matSnackBar.open('Invalid information', 'close', {
        panelClass: 'warning-snackbar',
        duration: 5000,
      });
    }
  }
}
