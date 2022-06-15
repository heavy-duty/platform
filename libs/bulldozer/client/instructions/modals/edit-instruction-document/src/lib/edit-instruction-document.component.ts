import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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
import { InstructionAccountDto } from '@heavy-duty/bulldozer-devkit';
import { List } from 'immutable';
import {
	BehaviorSubject,
	combineLatest,
	map,
	Observable,
	startWith,
	Subject,
	takeUntil,
} from 'rxjs';
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
				<mat-label>Seeds</mat-label>
				<input
					[matAutocomplete]="seedsAutocomplete"
					[formControl]="searchAccountControl"
					type="text"
					matInput
					placeholder="Search for account"
				/>
				<mat-autocomplete
					#seedsAutocomplete="matAutocomplete"
					[displayWith]="displayWith"
					(optionSelected)="onAccountSelected($event.option.value)"
					autoActiveFirstOption
				>
					<mat-option
						*ngFor="let option of filteredAccountOptions$ | ngrxPush"
						[value]="option"
					>
						{{ option.name }}
					</mat-option>
				</mat-autocomplete>
			</mat-form-field>

			<ng-container *ngIf="seedAccounts$ | ngrxPush as seedAccounts">
				<div
					*ngIf="seedAccounts.size > 0"
					class="flex flex-col gap-4 seeds"
					(cdkDropListDropped)="onAccountsMoved($event)"
					cdkDropList
				>
					<div
						*ngFor="
							let seed of seedAccounts$ | ngrxPush;
							let index = index;
							let last = last
						"
						class="px-6 py-4 rounded seed bg-black bg-bp-metal-2"
						cdkDrag
					>
						<div *cdkDragPlaceholder class="seed-placeholder"></div>

						<div
							class="w-full flex justify-between items-center cursor-move gap-4"
							cdkDragHandle
						>
							<div class="flex items-center gap-2">
								<div
									class="flex justify-center items-center w-8 h-8 rounded-full bg-black bg-opacity-40 font-bold"
								>
									{{ index + 1 }}
								</div>

								<p class="m-0">
									{{ seed.name }}
								</p>
							</div>

							<button
								class="bg-black h-full p-1 bp-button uppercase text-sm text-red-500"
								[attr.aria-label]="'Remove seed number ' + index"
								(click)="onAccountRemoved(index)"
								type="button"
								craneStopPropagation
							>
								<mat-icon inline>delete</mat-icon>
							</button>
						</div>
					</div>
				</div>
			</ng-container>

			<mat-form-field class="w-full" appearance="fill">
				<mat-label>Bump</mat-label>
				<input
					[matAutocomplete]="bumpAutocomplete"
					type="text"
					formControlName="bump"
					matInput
					placeholder="Choose a bump"
				/>
				<mat-autocomplete
					#bumpAutocomplete="matAutocomplete"
					[displayWith]="displayWith"
					autoActiveFirstOption
				>
					<mat-option [value]="null"> None </mat-option>
					<mat-option
						*ngFor="let option of filteredBumpOptions$ | ngrxPush"
						[value]="option"
					>
						{{ option.account?.name }}.{{ option.collectionAttribute?.name }}

						<span class="italic text-xs">
							{{ option.collection?.name }}
						</span>
					</mat-option>
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
	readonly filteredAccountOptions$: Observable<
		List<InstructionAccount> | undefined
	>;
	private readonly _seedAccounts = new BehaviorSubject<
		List<InstructionAccount>
	>(List());
	readonly seedAccounts$ = this._seedAccounts.asObservable();

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
		private readonly _matDialogRef: MatDialogRef<EditInstructionDocumentComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data?: {
			document?: InstructionAccountDto;
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
			map((value) => this._filterBumpOptions(this._bumpOptions, value))
		);

		this.filteredAccountOptions$ = this.searchAccountControl.valueChanges.pipe(
			startWith(null),
			map((value) => this._filterAccountOptions(this.data?.accounts, value))
		);
		this.filteredAccountOptions$ = combineLatest([
			this.searchAccountControl.valueChanges.pipe(startWith(null)),
			this.seedAccounts$,
		]).pipe(
			map(([searchTerm, seedAccounts]) =>
				this._filterAccountOptions(
					this.data?.accounts.filter(
						(account) =>
							!seedAccounts.some((seedAccount) => seedAccount.id === account.id)
					),
					searchTerm
				)
			)
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

	private _filterBumpOptions(
		options:
			| List<{
					collection: Collection | undefined;
					collectionAttribute: CollectionAttribute | undefined;
					account: InstructionAccount;
			  }>
			| undefined,
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
			return options;
		} else if (typeof value === 'string') {
			const segments = value.toLowerCase().split(' ');

			if (options === undefined) {
				return options;
			}

			return options.filter((option) => {
				return segments.every(
					(segment) =>
						option.collection?.name.toLowerCase().includes(segment) ||
						option.collectionAttribute?.name.toLowerCase().includes(segment) ||
						option.account.name.toLowerCase().includes(segment)
				);
			});
		} else {
			return List([value]);
		}
	}

	private _filterAccountOptions(
		options: List<InstructionAccount> | undefined,
		value: string | InstructionAccount | null
	) {
		if (value === null) {
			return options;
		} else if (typeof value === 'string') {
			const segments = value.toLowerCase().split(' ');

			if (options === undefined) {
				return options;
			}

			return options.filter((option) => {
				return segments.every((segment) =>
					option.name.toLowerCase().includes(segment)
				);
			});
		} else {
			return List([value]);
		}
	}

	onAccountSelected(account: InstructionAccount) {
		const seedAccounts = this._seedAccounts.getValue();
		this.searchAccountControl.setValue(null);
		this._seedAccounts.next(seedAccounts.push(account));
	}

	onAccountRemoved(index: number) {
		const seedAccounts = this._seedAccounts.getValue();
		this._seedAccounts.next(seedAccounts.remove(index));
	}

	onAccountsMoved(event: CdkDragDrop<string[]>) {
		const seedAccounts = this._seedAccounts.getValue();
		const seedAccountsAsArray = seedAccounts.toArray();
		moveItemInArray(
			seedAccountsAsArray,
			event.previousIndex,
			event.currentIndex
		);
		this._seedAccounts.next(List(seedAccountsAsArray));
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

	displayWith(
		data: {
			collection: Collection | undefined;
			collectionAttribute: CollectionAttribute | undefined;
			account: InstructionAccount;
		} | null
	) {
		return data?.collection !== undefined &&
			data?.collectionAttribute !== undefined
			? `${data.account.name}.${data.collectionAttribute.name} (${data.collection.name})`
			: '';
	}
}
