import { Component, HostBinding, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Document, InstructionArgument } from '@heavy-duty/bulldozer-devkit';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'bd-edit-argument',
  template: `
    <h2 mat-dialog-title class="mat-primary">
      {{ data?.instructionArgument ? 'Edit' : 'Create' }} argument
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

        <mat-error *ngIf="submitted && nameControl.hasError('required')"
          >The name is mandatory.</mat-error
        >
        <mat-error *ngIf="submitted && nameControl.hasError('maxlength')"
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
          <mat-option [value]="0">Boolean</mat-option>
          <mat-option [value]="1">Number</mat-option>
          <mat-option [value]="2">String</mat-option>
          <mat-option [value]="3">Pubkey</mat-option>
        </mat-select>
        <mat-error *ngIf="submitted && kindControl.hasError('required')"
          >The kind is required.</mat-error
        >
      </mat-form-field>

      <mat-form-field
        *ngIf="kindControl.value === 1"
        class="w-full"
        appearance="fill"
        hintLabel="Enter a max."
      >
        <mat-label>Max</mat-label>
        <input
          matInput
          formControlName="max"
          required
          autocomplete="off"
          type="number"
        />
        <mat-error *ngIf="submitted && maxControl.hasError('required')"
          >The max is mandatory.</mat-error
        >
      </mat-form-field>

      <mat-form-field
        *ngIf="kindControl.value === 2"
        class="w-full"
        appearance="fill"
        hintLabel="Enter a max length."
      >
        <mat-label>Max Length</mat-label>
        <input
          matInput
          formControlName="maxLength"
          required
          autocomplete="off"
          type="number"
        />
        <mat-error *ngIf="submitted && maxLengthControl.hasError('required')"
          >The max length is mandatory.</mat-error
        >
      </mat-form-field>

      <mat-radio-group
        class="w-full bg-white bg-opacity-5 px-2 py-1 flex flex-col gap-2"
        ariaLabel="Attribute modifier"
        formControlName="modifier"
      >
        <mat-radio-button [value]="null">Single item.</mat-radio-button>
        <mat-radio-button [value]="0">Array of items.</mat-radio-button>
        <mat-radio-button [value]="1">Vector of items.</mat-radio-button>
      </mat-radio-group>

      <mat-form-field
        *ngIf="modifierControl.value !== null"
        class="w-full"
        appearance="fill"
        hintLabel="Enter the size."
      >
        <mat-label>Size</mat-label>
        <input
          matInput
          formControlName="size"
          required
          autocomplete="off"
          min="1"
          type="number"
        />
        <mat-error *ngIf="submitted && sizeControl.hasError('required')"
          >The size is mandatory.</mat-error
        >
        <mat-error *ngIf="submitted && sizeControl.hasError('min')"
          >The size has to be above 1</mat-error
        >
      </mat-form-field>

      <button
        mat-stroked-button
        color="primary"
        class="w-full"
        [disabled]="submitted && argumentGroup.invalid"
      >
        {{ data?.instructionArgument ? 'Save' : 'Create' }}
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
  private readonly _destroy = new Subject();
  readonly destroy$ = this._destroy.asObservable();
  submitted = false;
  readonly argumentGroup = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
    kind: new FormControl(0, { validators: [Validators.required] }),
    modifier: new FormControl(null),
    size: new FormControl(null),
    max: new FormControl(null),
    maxLength: new FormControl(null),
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
  get maxControl() {
    return this.argumentGroup.get('max') as FormControl;
  }
  get maxLengthControl() {
    return this.argumentGroup.get('maxLength') as FormControl;
  }

  constructor(
    private readonly _matSnackBar: MatSnackBar,
    private readonly _matDialogRef: MatDialogRef<EditArgumentComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data?: {
      instructionArgument?: Document<InstructionArgument>;
    }
  ) {}

  ngOnInit() {
    this.kindControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((kind) => {
        if (kind === 1) {
          this.maxControl.setValidators([
            Validators.required,
            Validators.min(0),
          ]);
          this.maxLengthControl.clearValidators();
          this.maxLengthControl.setValue(null);
        } else if (kind === 2) {
          this.maxControl.clearValidators();
          this.maxControl.setValue(null);
          this.maxLengthControl.setValidators([
            Validators.required,
            Validators.min(0),
          ]);
        } else {
          this.maxControl.clearValidators();
          this.maxControl.setValue(null);
          this.maxLengthControl.clearValidators();
          this.maxLengthControl.setValue(null);
        }

        this.maxControl.updateValueAndValidity();
        this.maxLengthControl.updateValueAndValidity();
      });

    this.modifierControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((modifier) => {
        if (modifier === null) {
          this.sizeControl.clearValidators();
          this.sizeControl.setValue(null);
        } else {
          this.sizeControl.setValidators([
            Validators.required,
            Validators.min(0),
          ]);
        }

        this.sizeControl.updateValueAndValidity();
      });

    if (this.data?.instructionArgument) {
      this.argumentGroup.setValue(
        {
          name: this.data.instructionArgument.name,
          kind: this.data.instructionArgument.data.kind.id,
          modifier:
            this.data.instructionArgument.data?.modifier !== null
              ? this.data.instructionArgument.data.modifier.id
              : null,
          size:
            this.data.instructionArgument.data?.modifier !== null
              ? this.data.instructionArgument.data.modifier.size
              : null,
          max: this.data.instructionArgument.data.max,
          maxLength: this.data.instructionArgument.data.maxLength,
        },
        { emitEvent: false }
      );
    }
  }

  async onEditArgument() {
    this.submitted = true;
    this.argumentGroup.markAllAsTouched();

    if (this.argumentGroup.valid) {
      this._matDialogRef.close(this.argumentGroup.value);
    } else {
      this._matSnackBar.open('Invalid information', 'close', {
        panelClass: 'warning-snackbar',
        duration: 5000,
      });
    }
  }
}
