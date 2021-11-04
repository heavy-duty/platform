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
import { CollectionAttribute } from '@heavy-duty/bulldozer/application/utils/types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'bd-edit-attribute',
  template: `
    <h2 mat-dialog-title class="mat-primary">
      {{ data?.attribute ? 'Edit' : 'Create' }} attribute
    </h2>

    <form
      [formGroup]="attributeGroup"
      class="flex flex-col gap-4"
      (ngSubmit)="onEditAttribute()"
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
          <mat-option [value]="0">Number</mat-option>
          <mat-option [value]="1">String</mat-option>
          <mat-option [value]="2">Pubkey</mat-option>
        </mat-select>
        <mat-error *ngIf="submitted && kindControl.errors?.required"
          >The kind is required.</mat-error
        >
      </mat-form-field>

      <mat-form-field
        *ngIf="kindControl.value === 0"
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
        <mat-error *ngIf="submitted && maxControl.errors?.required"
          >The max is mandatory.</mat-error
        >
      </mat-form-field>

      <mat-form-field
        *ngIf="kindControl.value === 1"
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
        <mat-error *ngIf="submitted && maxLengthControl.errors?.required"
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
        [disabled]="submitted && attributeGroup.invalid"
      >
        {{ data?.attribute ? 'Save' : 'Create' }}
      </button>
    </form>

    <button
      mat-icon-button
      aria-label="Close edit attribute form"
      class="w-8 h-8 leading-none absolute top-0 right-0"
      mat-dialog-close
    >
      <mat-icon>close</mat-icon>
    </button>
  `,
})
export class EditAttributeComponent implements OnInit, OnDestroy {
  @HostBinding('class') class = 'block w-72 relative';
  private readonly _destroy = new Subject();
  readonly destroy$ = this._destroy.asObservable();
  submitted = false;
  readonly attributeGroup = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
    kind: new FormControl(0, { validators: [Validators.required] }),
    modifier: new FormControl(null),
    size: new FormControl(null),
    max: new FormControl(null),
    maxLength: new FormControl(null),
  });

  get nameControl() {
    return this.attributeGroup.get('name') as FormControl;
  }
  get kindControl() {
    return this.attributeGroup.get('kind') as FormControl;
  }
  get modifierControl() {
    return this.attributeGroup.get('modifier') as FormControl;
  }
  get sizeControl() {
    return this.attributeGroup.get('size') as FormControl;
  }
  get maxControl() {
    return this.attributeGroup.get('max') as FormControl;
  }
  get maxLengthControl() {
    return this.attributeGroup.get('maxLength') as FormControl;
  }

  constructor(
    private readonly _matSnackBar: MatSnackBar,
    private readonly _matDialogRef: MatDialogRef<EditAttributeComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data?: { attribute?: CollectionAttribute }
  ) {}

  ngOnInit() {
    this.kindControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((kind) => {
        if (kind === 0) {
          this.maxControl.setValidators([
            Validators.required,
            Validators.min(0),
          ]);
          this.maxLengthControl.clearValidators();
          this.maxLengthControl.setValue(null);
        } else if (kind === 1) {
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

    if (this.data?.attribute) {
      this.attributeGroup.setValue(
        {
          name: this.data.attribute.data.name,
          kind: this.data.attribute.data.kind.id,
          modifier:
            this.data.attribute.data.modifier !== null
              ? this.data.attribute.data.modifier.id
              : null,
          size:
            this.data.attribute.data.modifier !== null
              ? this.data.attribute.data.modifier.size
              : null,
          max: this.data.attribute.data.max,
          maxLength: this.data.attribute.data.maxLength,
        },
        { emitEvent: false }
      );
    }
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }

  async onEditAttribute() {
    this.submitted = true;
    this.attributeGroup.markAllAsTouched();

    if (this.attributeGroup.valid) {
      this._matDialogRef.close(this.attributeGroup.value);
    } else {
      this._matSnackBar.open('Invalid information', 'close', {
        panelClass: 'warning-snackbar',
        duration: 5000,
      });
    }
  }
}
