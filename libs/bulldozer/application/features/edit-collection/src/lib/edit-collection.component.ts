import { Component, HostBinding, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Collection } from '@heavy-duty/bulldozer/data-access';

@Component({
  selector: 'bd-edit-collection',
  template: `
    <h2 mat-dialog-title class="mat-primary">
      {{ data?.collection ? 'Edit' : 'Create' }} collection
    </h2>

    <form
      [formGroup]="collectionGroup"
      class="flex flex-col gap-4"
      (ngSubmit)="onEditCollection()"
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

      <button
        mat-stroked-button
        color="primary"
        class="w-full"
        [disabled]="submitted && collectionGroup.invalid"
      >
        {{ data?.collection ? 'Save' : 'Create' }}
      </button>
    </form>

    <button
      mat-icon-button
      aria-label="Close edit collection form"
      class="w-8 h-8 leading-none absolute top-0 right-0"
      mat-dialog-close
    >
      <mat-icon>close</mat-icon>
    </button>
  `,
})
export class EditCollectionComponent implements OnInit {
  @HostBinding('class') class = 'block w-72 relative';
  submitted = false;
  readonly collectionGroup = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(32)],
    }),
  });

  get nameControl() {
    return this.collectionGroup.get('name') as FormControl;
  }

  constructor(
    private readonly _matDialogRef: MatDialogRef<EditCollectionComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data?: {
      collection?: Collection;
    }
  ) {}

  ngOnInit() {
    if (this.data?.collection) {
      this.collectionGroup.setValue(
        {
          name: this.data.collection.data.name,
        },
        { emitEvent: false }
      );
    }
  }

  async onEditCollection() {
    this.submitted = true;
    this.collectionGroup.markAllAsTouched();

    if (this.collectionGroup.valid) {
      this._matDialogRef.close({
        name: this.nameControl.value,
      });
    }
  }
}
