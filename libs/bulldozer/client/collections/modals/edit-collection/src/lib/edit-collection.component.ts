import { Component, HostBinding, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '@bulldozer-client/notification-snack-bar';
import { Collection, Document } from '@heavy-duty/bulldozer-devkit';

@Component({
  selector: 'bd-edit-collection',
  template: `
    <h2 mat-dialog-title class="mat-primary">
      {{ data?.collection ? 'Edit' : 'Create' }} collection
    </h2>

    <form
      [formGroup]="form"
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
        <mat-hint align="end"
          >{{ this.form.get('name')?.value?.length || 0 }}/32</mat-hint
        >

        <mat-error
          *ngIf="submitted && this.form.get('name')?.hasError('required')"
          >The name is mandatory.</mat-error
        >
        <mat-error
          *ngIf="submitted && this.form.get('name')?.hasError('maxlength')"
          >Maximum length is 32.</mat-error
        >
      </mat-form-field>

      <button
        mat-stroked-button
        color="primary"
        class="w-full"
        [disabled]="submitted && form.invalid"
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
export class EditCollectionComponent {
  @HostBinding('class') class = 'block w-72 relative';
  readonly form: FormGroup;
  submitted = false;

  constructor(
    private readonly _matSnackBar: MatSnackBar,
    private readonly _matDialogRef: MatDialogRef<EditCollectionComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data?: {
      collection?: Document<Collection>;
    }
  ) {
    this.form = new FormGroup({
      name: new FormControl(this.data?.collection?.name ?? '', {
        validators: [Validators.required, Validators.maxLength(32)],
      }),
    });
  }

  onEditCollection() {
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
