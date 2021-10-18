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
} from '@heavy-duty/bulldozer/application/utils/types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'bd-edit-document',
  template: `
    <h2 mat-dialog-title class="mat-primary">
      {{ data?.document ? 'Edit' : 'Create' }} document
    </h2>

    <form
      [formGroup]="documentGroup"
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
        hintLabel="Select a modifier."
      >
        <mat-label>Modifier</mat-label>
        <mat-select formControlName="modifier">
          <mat-option [value]="0">None</mat-option>
          <mat-option [value]="1">Init</mat-option>
          <mat-option [value]="2">Mut</mat-option>
        </mat-select>
        <mat-error *ngIf="submitted">The modifier is required.</mat-error>
      </mat-form-field>

      <mat-form-field
        class="w-full"
        appearance="fill"
        hintLabel="Select a collection."
      >
        <mat-label>Collection</mat-label>
        <mat-select formControlName="collection">
          <mat-option
            *ngFor="let collection of data?.collections"
            [value]="collection.id"
          >
            {{ collection.data.name }} |
            {{ collection.id | obscureAddress }}
          </mat-option>
        </mat-select>
        <mat-error *ngIf="submitted">The collection is required.</mat-error>
      </mat-form-field>

      <mat-form-field
        *ngIf="modifierControl.value === 1"
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
        <mat-error *ngIf="submitted && spaceControl.errors?.required"
          >The space is mandatory.</mat-error
        >
        <mat-error *ngIf="submitted && spaceControl.errors?.min"
          >Space is meant to be positive.</mat-error
        >
        <mat-error *ngIf="submitted && spaceControl.errors?.max"
          >Maximum is 65536.</mat-error
        >
      </mat-form-field>

      <mat-form-field
        *ngIf="modifierControl.value === 1"
        class="w-full"
        appearance="fill"
        hintLabel="Select a payer."
      >
        <mat-label>Payer</mat-label>
        <mat-select formControlName="payer">
          <mat-option
            *ngFor="let account of data?.accounts"
            [value]="account.id"
          >
            {{ account.data.name }} |
            {{ account.id | obscureAddress }}
          </mat-option>
        </mat-select>
        <mat-error *ngIf="submitted">The payer is required.</mat-error>
      </mat-form-field>

      <mat-form-field
        *ngIf="modifierControl.value === 2"
        class="w-full"
        appearance="fill"
        hintLabel="Select target for close."
      >
        <mat-label>Close</mat-label>
        <mat-select formControlName="close">
          <mat-option
            *ngFor="let account of data?.accounts"
            [value]="account.id"
          >
            {{ account.data.name }} |
            {{ account.id | obscureAddress }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <button
        mat-stroked-button
        color="primary"
        class="w-full"
        [disabled]="submitted && documentGroup.invalid"
      >
        {{ data?.document ? 'Save' : 'Create' }}
      </button>
    </form>

    <button
      mat-icon-button
      aria-label="Close edit document form"
      class="w-8 h-8 leading-none absolute top-0 right-0"
      mat-dialog-close
    >
      <mat-icon>close</mat-icon>
    </button>
  `,
})
export class EditDocumentComponent implements OnInit, OnDestroy {
  @HostBinding('class') class = 'block w-72 relative';
  private readonly _destroy = new Subject();
  readonly destroy$ = this._destroy.asObservable();
  submitted = false;
  readonly documentGroup = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
    modifier: new FormControl(0, { validators: [Validators.required] }),
    collection: new FormControl(null, { validators: [Validators.required] }),
    space: new FormControl(null),
    payer: new FormControl(null),
    close: new FormControl(null),
  });
  get nameControl() {
    return this.documentGroup.get('name') as FormControl;
  }
  get modifierControl() {
    return this.documentGroup.get('modifier') as FormControl;
  }
  get collectionControl() {
    return this.documentGroup.get('collection') as FormControl;
  }
  get spaceControl() {
    return this.documentGroup.get('space') as FormControl;
  }
  get payerControl() {
    return this.documentGroup.get('payer') as FormControl;
  }
  get closeControl() {
    return this.documentGroup.get('close') as FormControl;
  }

  constructor(
    private readonly _matSnackBar: MatSnackBar,
    private readonly _matDialogRef: MatDialogRef<EditDocumentComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data?: {
      document?: InstructionAccountExtended;
      collections: Collection[];
      accounts: InstructionAccountExtended[];
    }
  ) {}

  ngOnInit() {
    this.modifierControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((modifier) => {
        if (modifier === 1) {
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

    if (this.data?.document) {
      this.documentGroup.setValue(
        {
          name: this.data.document.data.name,
          modifier: this.data.document.data.modifier.id,
          collection: this.data.document.data.collection?.id || null,
          space: this.data.document.data.space,
          payer: this.data.document.data.payer?.id || null,
          close: this.data.document.data.close?.id || null,
        },
        { emitEvent: false }
      );
    }
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }

  async onEditDocument() {
    this.submitted = true;
    this.documentGroup.markAllAsTouched();

    if (this.documentGroup.valid) {
      this._matDialogRef.close({
        name: this.nameControl.value,
        modifier: this.modifierControl.value,
        collection: this.collectionControl.value,
        space: this.spaceControl.value,
        payer: this.payerControl.value,
        close: this.closeControl.value,
      });
    } else {
      this._matSnackBar.open('Invalid information', 'close', {
        panelClass: 'warning-snackbar',
        duration: 5000,
      });
    }
  }
}
