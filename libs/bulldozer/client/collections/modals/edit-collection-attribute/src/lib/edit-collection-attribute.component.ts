import {
	Component,
	HostBinding,
	Inject,
	OnDestroy,
	OnInit,
} from '@angular/core';
import {
	UntypedFormControl,
	UntypedFormGroup,
	Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '@bulldozer-client/notification-snack-bar';
import { CollectionAttributeDto } from '@heavy-duty/bulldozer-devkit';
import { Subject, takeUntil } from 'rxjs';

@Component({
	selector: 'bd-edit-attribute',
	template: `
		<h2 class="mat-primary bp-font" mat-dialog-title>
			{{ collectionAttribute ? 'Edit' : 'Create' }} attribute
		</h2>

		<form
			class="flex flex-col gap-4"
			[formGroup]="form"
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
					type="number"
					matInput
					formControlName="max"
					required
					autocomplete="off"
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
					type="number"
					matInput
					formControlName="maxLength"
					required
					autocomplete="off"
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
					type="number"
					matInput
					formControlName="size"
					required
					autocomplete="off"
					min="1"
				/>
				<mat-error *ngIf="submitted && sizeControl.hasError('required')"
					>The size is mandatory.</mat-error
				>
				<mat-error *ngIf="submitted && sizeControl.hasError('min')"
					>The size has to be above 1</mat-error
				>
			</mat-form-field>

			<div
				class="py-2 px-5 w-full h-12 bg-bp-metal-2 shadow flex justify-center items-center m-auto mt-4 relative bg-bp-black"
			>
				<button class="bp-button flex-1" mat-dialog-close>Cancel</button>
				<button class="bp-button flex-1" [disabled]="submitted && form.invalid">
					{{ collectionAttribute ? 'Save' : 'Create' }}
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
})
export class EditCollectionAttributeComponent implements OnInit, OnDestroy {
	@HostBinding('class') class = 'block w-72 relative';
	private readonly _destroy = new Subject();
	readonly destroy$ = this._destroy.asObservable();
	submitted = false;
	readonly form: UntypedFormGroup;

	get nameControl() {
		return this.form.get('name') as UntypedFormControl;
	}
	get kindControl() {
		return this.form.get('kind') as UntypedFormControl;
	}
	get modifierControl() {
		return this.form.get('modifier') as UntypedFormControl;
	}
	get sizeControl() {
		return this.form.get('size') as UntypedFormControl;
	}
	get maxControl() {
		return this.form.get('max') as UntypedFormControl;
	}
	get maxLengthControl() {
		return this.form.get('maxLength') as UntypedFormControl;
	}

	constructor(
		private readonly _matSnackBar: MatSnackBar,
		private readonly _matDialogRef: MatDialogRef<EditCollectionAttributeComponent>,
		@Inject(MAT_DIALOG_DATA)
		public collectionAttribute?: CollectionAttributeDto
	) {
		this.form = new UntypedFormGroup({
			name: new UntypedFormControl(this.collectionAttribute?.name ?? '', {
				validators: [Validators.required],
			}),
			kind: new UntypedFormControl(this.collectionAttribute?.kind ?? 0, {
				validators: [Validators.required],
			}),
			modifier: new UntypedFormControl(
				this.collectionAttribute?.modifier ?? null
			),
			size: new UntypedFormControl(this.collectionAttribute?.size ?? null),
			max: new UntypedFormControl(this.collectionAttribute?.max ?? null),
			maxLength: new UntypedFormControl(
				this.collectionAttribute?.maxLength ?? null
			),
		});
	}

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
	}

	ngOnDestroy() {
		this._destroy.next(null);
		this._destroy.complete();
	}

	onEditAttribute() {
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
