import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {} from '@bulldozer-client/instructions-data-access';
import { SnackBarComponent } from '@bulldozer-client/notification-snack-bar';
import { InstructionAccountDto } from '@heavy-duty/bulldozer-devkit';
import { List } from 'immutable';
import { Subject, takeUntil } from 'rxjs';
import { Collection, InstructionAccount } from './types';

@Component({
  selector: 'bd-edit-document',
  template: `
    <h2 mat-dialog-title class="mat-primary bd-font">
      {{ data?.document ? 'Edit' : 'Create' }} document
    </h2>

    <form
      [formGroup]="form"
      class="flex flex-col gap-4"
      (ngSubmit)="onEditDocument()"
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
        hintLabel="Select a collection."
      >
        <mat-label>Collection</mat-label>
        <mat-select formControlName="collection" required>
          <mat-option
            *ngFor="let collection of data?.collections"
            [value]="collection.id"
          >
            {{ collection.name }} |
            {{ collection.id | obscureAddress }}
          </mat-option>
        </mat-select>
        <mat-error *ngIf="submitted">The collection is required.</mat-error>
      </mat-form-field>

      <mat-radio-group
        class="w-full bg-white bg-opacity-5 px-2 py-1 flex flex-col gap-2"
        ariaLabel="Document modifier"
        formControlName="modifier"
      >
        <mat-radio-button [value]="null">Read-only.</mat-radio-button>
        <mat-radio-button [value]="0">Create new document.</mat-radio-button>
        <mat-radio-button [value]="1">Save changes.</mat-radio-button>
      </mat-radio-group>

      <mat-form-field
        *ngIf="modifierControl.value === 0"
        class="w-full"
        appearance="fill"
        hintLabel="Enter the space."
        autocomplete="off"
      >
        <mat-label>Space</mat-label>
        <input
          matInput
          formControlName="space"
          required
          type="number"
          min="0"
          max="65536"
        />
        <mat-error *ngIf="submitted && spaceControl.hasError('required')"
          >The space is mandatory.</mat-error
        >
        <mat-error *ngIf="submitted && spaceControl.hasError('min')"
          >Space is meant to be positive.</mat-error
        >
        <mat-error *ngIf="submitted && spaceControl.hasError('max')"
          >Maximum is 65536.</mat-error
        >
      </mat-form-field>

      <mat-form-field
        *ngIf="modifierControl.value === 0"
        class="w-full"
        appearance="fill"
        hintLabel="Select a payer."
      >
        <mat-label>Payer</mat-label>
        <mat-select formControlName="payer" required>
          <mat-option
            *ngFor="let account of data?.accounts"
            [value]="account.id"
          >
            {{ account.name }} |
            {{ account.id | obscureAddress }}
          </mat-option>
        </mat-select>
        <mat-error *ngIf="submitted">The payer is required.</mat-error>
      </mat-form-field>

      <mat-form-field
        *ngIf="modifierControl.value === 1"
        class="w-full"
        appearance="fill"
        hintLabel="Select target for close."
      >
        <mat-label>Close</mat-label>
        <mat-select formControlName="close">
          <mat-option [value]="null"> None </mat-option>
          <mat-option
            *ngFor="let account of data?.accounts"
            [value]="account.id"
          >
            {{ account.name }} |
            {{ account.id | obscureAddress }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <div
        class="py-2 px-5 w-full h-12 bd-bg-image-11 shadow flex justify-center items-center m-auto mt-4 relative bg-bd-black"
      >
        <button class="bd-button flex-1" [disabled]="submitted && form.invalid">
          {{ data?.document ? 'Save' : 'Create' }}
        </button>
        <button class="bd-button flex-1" mat-dialog-close>Cancel</button>

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditInstructionDocumentComponent implements OnInit, OnDestroy {
  @HostBinding('class') class = 'block w-72 relative';
  private readonly _destroy = new Subject();
  readonly destroy$ = this._destroy.asObservable();
  readonly form: FormGroup;
  submitted = false;

  get nameControl() {
    return this.form.get('name') as FormControl;
  }
  get modifierControl() {
    return this.form.get('modifier') as FormControl;
  }
  get collectionControl() {
    return this.form.get('collection') as FormControl;
  }
  get spaceControl() {
    return this.form.get('space') as FormControl;
  }
  get payerControl() {
    return this.form.get('payer') as FormControl;
  }
  get closeControl() {
    return this.form.get('close') as FormControl;
  }

  constructor(
    private readonly _matSnackBar: MatSnackBar,
    private readonly _matDialogRef: MatDialogRef<EditInstructionDocumentComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data?: {
      document?: InstructionAccountDto;
      collections: List<Collection>;
      accounts: List<InstructionAccount>;
    }
  ) {
    this.form = new FormGroup({
      name: new FormControl(this.data?.document?.name ?? '', {
        validators: [Validators.required],
      }),
      modifier: new FormControl(this.data?.document?.modifier ?? null),
      collection: new FormControl(this.data?.document?.collection ?? null, {
        validators: [Validators.required],
      }),
      space: new FormControl(this.data?.document?.space ?? null),
      payer: new FormControl(this.data?.document?.payer ?? null),
      close: new FormControl(this.data?.document?.close ?? null),
    });
  }

  ngOnInit() {
    this.modifierControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((modifier) => {
        if (modifier === 0) {
          this.spaceControl.setValidators([
            Validators.required,
            Validators.min(0),
            Validators.max(65536),
          ]);
          this.payerControl.setValidators([Validators.required]);
        } else {
          this.spaceControl.clearValidators();
          this.payerControl.clearValidators();
        }

        this.spaceControl.updateValueAndValidity();
        this.payerControl.updateValueAndValidity();
      });
  }

  ngOnDestroy() {
    this._destroy.next(null);
    this._destroy.complete();
  }

  onEditDocument() {
    this.submitted = true;
    this.form.markAllAsTouched();

    if (this.form.valid) {
      this._matDialogRef.close({
        name: this.nameControl.value,
        kind: 0,
        modifier: this.modifierControl.value,
        collection: this.collectionControl.value,
        space:
          this.modifierControl.value === 0 ? this.spaceControl.value : null,
        payer:
          this.modifierControl.value === 0 ? this.payerControl.value : null,
        close:
          this.modifierControl.value === 1 ? this.closeControl.value : null,
      });
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
