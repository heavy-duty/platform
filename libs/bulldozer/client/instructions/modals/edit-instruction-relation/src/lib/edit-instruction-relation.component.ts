import {
  Component,
  HostBinding,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Collection,
  Document,
  InstructionAccount,
  InstructionRelation,
  Relation,
} from '@heavy-duty/bulldozer-devkit';
import { Subject } from 'rxjs';

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
        hintLabel="Select to account."
      >
        <mat-label>To</mat-label>
        <mat-select formControlName="to">
          <mat-option
            *ngFor="let account of data?.accounts"
            [value]="account.id"
          >
            {{ account.name }} |
            {{ account.id | obscureAddress }}
          </mat-option>
        </mat-select>
        <mat-error *ngIf="submitted">To is required.</mat-error>
      </mat-form-field>

      <mat-error
        *ngIf="submitted && relationGroup.hasError('equal')"
        class="text-center m-0"
        >Accounts have to be different.</mat-error
      >

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
export class EditInstructionRelationComponent implements OnInit, OnDestroy {
  @HostBinding('class') class = 'block w-72 relative';
  private readonly _destroy = new Subject();
  readonly destroy$ = this._destroy.asObservable();
  submitted = false;
  readonly relationGroup = new FormGroup(
    {
      from: new FormControl(null, { validators: [Validators.required] }),
      to: new FormControl(null, { validators: [Validators.required] }),
    },
    {
      validators: [equalValidator('from', 'to')],
    }
  );
  get fromControl() {
    return this.relationGroup.get('from') as FormControl;
  }
  get toControl() {
    return this.relationGroup.get('to') as FormControl;
  }

  constructor(
    private readonly _matSnackBar: MatSnackBar,
    private readonly _matDialogRef: MatDialogRef<EditInstructionRelationComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      relation?: Relation<InstructionRelation>;
      collections: Document<Collection>[];
      accounts: Document<InstructionAccount>[];
      from: string;
    }
  ) {}

  ngOnInit() {
    if (this.data?.relation) {
      this.relationGroup.setValue(
        {
          from: this.data.relation.from,
          to: this.data.relation.to,
        },
        { emitEvent: false }
      );
    } else {
      this.relationGroup.setValue(
        {
          from: this.data.from,
          to: null,
        },
        { emitEvent: false }
      );
    }
  }

  ngOnDestroy() {
    this._destroy.next(null);
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
