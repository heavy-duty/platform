import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	Inject,
} from '@angular/core';
import {
	FormControl,
	UntypedFormControl,
	UntypedFormGroup,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {} from '@bulldozer-client/instructions-data-access';
import { SnackBarComponent } from '@bulldozer-client/notification-snack-bar';
import { InstructionAccountDto } from '@heavy-duty/bulldozer-devkit';
import { List } from 'immutable';
import { BehaviorSubject, map, Observable, startWith } from 'rxjs';
import {
	Collection,
	CollectionAttribute,
	InstructionAccount,
	InstructionAccountDerivation,
	InstructionAccountsCollectionsLookup,
} from './types';

@Component({
	selector: 'bd-edit-document-derivation',
	template: `
		<h2 class="mat-primary bp-font" mat-dialog-title>
			{{ data?.document ? 'Edit' : 'Create' }} document derivation
		</h2>

		<form
			*ngrxLet="seedAccounts$; let seedAccounts"
			class="flex flex-col gap-4"
			[formGroup]="form"
			(ngSubmit)="onEditDocumentDerivation(seedAccounts)"
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
					autocomplete="off"
					maxlength="32"
				/>
				<mat-hint align="end">{{ nameControl.value?.length || 0 }}/32</mat-hint>

				<mat-error *ngIf="submitted && nameControl.hasError('maxlength')"
					>Maximum length is 32.</mat-error
				>
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
export class EditInstructionDocumentDerivationComponent {
	@HostBinding('class') class = 'block w-72 relative';
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

	readonly form = new UntypedFormGroup({
		name: new UntypedFormControl(this.data?.derivation?.name ?? null),
		bump: new UntypedFormControl(
			this._bumpOptions?.find(
				({ collectionAttribute }) =>
					collectionAttribute?.id === this.data?.derivation?.bumpPath?.path?.id
			) ?? null
		),
	});
	readonly searchAccountControl = new FormControl();
	submitted = false;

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
	get bumpControl() {
		return this.form.get('bump') as UntypedFormControl;
	}

	constructor(
		private readonly _matSnackBar: MatSnackBar,
		private readonly _matDialogRef: MatDialogRef<
			EditInstructionDocumentDerivationComponent,
			{
				name: string | null;
				seedPaths: List<string>;
				bumpPath: {
					referenceId: string;
					pathId: string;
					collectionId: string;
				} | null;
			}
		>,
		@Inject(MAT_DIALOG_DATA)
		public data?: {
			derivation: InstructionAccountDerivation | null;
			document?: InstructionAccountDto;
			collections: List<Collection>;
			collectionAttributes: List<CollectionAttribute>;
			accounts: List<InstructionAccount>;
			instructionAccountsCollectionsLookup: List<InstructionAccountsCollectionsLookup>;
		}
	) {
		if (this.data?.derivation?.seedPaths) {
			this._seedAccounts.next(
				List(
					this.data?.derivation.seedPaths.filter(
						(seedPath): seedPath is InstructionAccount => seedPath !== null
					)
				)
			);
		}

		this.filteredBumpOptions$ = this.bumpControl.valueChanges.pipe(
			startWith(null),
			map((value) => this._filterBumpOptions(this._bumpOptions, value))
		);
		this.filteredAccountOptions$ = this.searchAccountControl.valueChanges.pipe(
			startWith(null),
			map((value) => this._filterAccountOptions(this.data?.accounts, value))
		);
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

	onEditDocumentDerivation(accounts: List<InstructionAccount>) {
		this.submitted = true;
		this.form.markAllAsTouched();

		if (this.form.valid) {
			const { name, bump } = this.form.value;

			this._matDialogRef.close({
				name: name === '' ? null : name,
				bumpPath: bump
					? {
							collectionId: bump.collection.id,
							referenceId: bump.account.id,
							pathId: bump.collectionAttribute.id,
					  }
					: null,
				seedPaths: accounts.map((account) => account.id),
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
			? `${data.account.name}.${data.collectionAttribute.name}`
			: '';
	}
}
