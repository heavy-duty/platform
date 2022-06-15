import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	Inject,
	OnDestroy,
	OnInit,
} from '@angular/core';
import {
	FormControl,
	UntypedFormControl,
	UntypedFormGroup,
	Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {} from '@bulldozer-client/instructions-data-access';
import { SnackBarComponent } from '@bulldozer-client/notification-snack-bar';
import { InstructionAccountModel } from '@heavy-duty/bulldozer-devkit';
import { List } from 'immutable';
import { map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import {
	Collection,
	CollectionAttribute,
	InstructionAccount,
	InstructionAccountsCollectionsLookup,
} from './types';

@Component({
	selector: 'bd-edit-document',
	template: `
		<h2 class="mat-primary bp-font" mat-dialog-title>
			{{ data?.document ? 'Edit' : 'Create' }} document
		</h2>

		<form
			class="flex flex-col gap-4"
			[formGroup]="form"
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
					type="number"
					matInput
					formControlName="space"
					required
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

			<mat-form-field class="w-full" appearance="fill">
				<mat-label>Bump</mat-label>
				<input
					[matAutocomplete]="auto"
					type="text"
					formControlName="bump"
					matInput
					placeholder="Select a bump"
				/>
				<mat-autocomplete
					#auto="matAutocomplete"
					[displayWith]="displayWith"
					autoActiveFirstOption
				>
					<mat-option [value]="null"> None </mat-option>
					<ng-container
						*ngIf="filteredBumpOptions$ | ngrxPush as filteredBumpOptions"
					>
						<mat-option
							*ngFor="let option of filteredBumpOptions"
							[value]="option"
						>
							{{ option.collection?.name }}.{{
								option.collectionAttribute?.name
							}}
						</mat-option>
					</ng-container>
				</mat-autocomplete>
			</mat-form-field>

			<div
				class="py-2 px-5 w-full h-12 bg-bp-metal-2 shadow flex justify-center items-center m-auto mt-4 relative bg-bp-black"
			>
				<button class="bp-button flex-1" mat-dialog-close>Cancel</button>
				<button class="bp-button flex-1" [disabled]="submitted && form.invalid">
					{{ data?.document ? 'Save' : 'Create' }}
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
	styles: [
		`
			.cdk-drag-preview {
				box-sizing: border-box;
				border-radius: 4px;
				box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
					0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
			}

			.cdk-drag-animating {
				transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
			}

			.seeds.cdk-drop-list-dragging .seed:not(.cdk-drag-placeholder) {
				transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
			}

			.seed-placeholder {
				background: #ccc;
				border: dotted 3px #999;
				min-height: 60px;
				transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditInstructionDocumentComponent implements OnInit, OnDestroy {
	@HostBinding('class') class = 'block w-72 relative';
	private readonly _destroy = new Subject();
	readonly destroy$ = this._destroy.asObservable();
	readonly form: UntypedFormGroup;
	readonly searchAccountControl = new FormControl();
	submitted = false;
	private readonly _bumpOptions = this.data?.accounts
		.filter((account) => account.kind.id === 0)
		.map((account) => {
			const collectionId = this.data?.instructionAccountsCollectionsLookup.find(
				(collectionLooup) => collectionLooup.id === account.collection
			)?.collection;

			return {
				account,
				collection: this.data?.collections.find(
					(collection) => collection.id === collectionId
				),
				collectionAttributes: this.data?.collectionAttributes.filter(
					(collectionAttribute) =>
						collectionAttribute.collectionId === collectionId
				),
			};
		})
		.reduce(
			(list, { account, collection, collectionAttributes }) => {
				if (collectionAttributes === undefined) {
					return list;
				}

				return list.concat(
					collectionAttributes
						.filter(
							(collectionAttribute) =>
								collectionAttribute.kind.id === 1 &&
								collectionAttribute.kind.size < 257
						)
						.map((collectionAttribute) => ({
							account,
							collection,
							collectionAttribute,
						}))
				);
			},
			List<{
				collection: Collection | undefined;
				collectionAttribute: CollectionAttribute | undefined;
				account: InstructionAccount;
			}>()
		);
	readonly filteredBumpOptions$: Observable<
		| List<{
				collection: Collection | undefined;
				collectionAttribute: CollectionAttribute | undefined;
				account: InstructionAccount;
		  }>
		| undefined
	>;

	get nameControl() {
		return this.form.get('name') as UntypedFormControl;
	}
	get modifierControl() {
		return this.form.get('modifier') as UntypedFormControl;
	}
	get collectionControl() {
		return this.form.get('collection') as UntypedFormControl;
	}
	get spaceControl() {
		return this.form.get('space') as UntypedFormControl;
	}
	get payerControl() {
		return this.form.get('payer') as UntypedFormControl;
	}
	get closeControl() {
		return this.form.get('close') as UntypedFormControl;
	}
	get bumpControl() {
		return this.form.get('bump') as UntypedFormControl;
	}

	constructor(
		private readonly _matSnackBar: MatSnackBar,
		private readonly _matDialogRef: MatDialogRef<
			EditInstructionDocumentComponent,
			InstructionAccountModel
		>,
		@Inject(MAT_DIALOG_DATA)
		public data?: {
			document?: InstructionAccountModel;
			collections: List<Collection>;
			collectionAttributes: List<CollectionAttribute>;
			accounts: List<InstructionAccount>;
			instructionAccountsCollectionsLookup: List<InstructionAccountsCollectionsLookup>;
		}
	) {
		this.form = new UntypedFormGroup({
			name: new UntypedFormControl(this.data?.document?.name ?? '', {
				validators: [Validators.required],
			}),
			modifier: new UntypedFormControl(this.data?.document?.modifier ?? null),
			collection: new UntypedFormControl(
				this.data?.document?.collection ?? null,
				{
					validators: [Validators.required],
				}
			),
			space: new UntypedFormControl(this.data?.document?.space ?? null),
			payer: new UntypedFormControl(this.data?.document?.payer ?? null),
			close: new UntypedFormControl(this.data?.document?.close ?? null),
			bump: new UntypedFormControl(null),
		});

		this.filteredBumpOptions$ = this.bumpControl.valueChanges.pipe(
			startWith(null),
			map((value) => this._filter(value))
		);
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

	private _filter(
		value:
			| string
			| {
					collection: Collection | undefined;
					collectionAttribute: CollectionAttribute | undefined;
					account: InstructionAccount;
			  }
			| null
	) {
		if (value === null) {
			return this._bumpOptions;
		} else if (typeof value === 'string') {
			const segments = value.toLowerCase().split(' ');

			if (this._bumpOptions === undefined) {
				return this._bumpOptions;
			}

			return this._bumpOptions.filter((option) => {
				return segments.every(
					(segment) =>
						option.collection?.name.toLowerCase().includes(segment) ||
						option.collectionAttribute?.name.toLowerCase().includes(segment)
				);
			});
		} else {
			return List([value]);
		}
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
				uncheckedExplanation: null,
				mint: null,
				tokenAuthority: null,
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

	displayWith(
		data: {
			collection: Collection | undefined;
			collectionAttribute: CollectionAttribute | undefined;
			account: InstructionAccount;
		} | null
	) {
		return data?.collection !== undefined &&
			data?.collectionAttribute !== undefined
			? `${data.collection.name}.${data.collectionAttribute.name}`
			: '';
	}
}
