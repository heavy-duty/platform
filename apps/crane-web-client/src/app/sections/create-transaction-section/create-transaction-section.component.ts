import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	importProvidersFrom,
	inject,
	Output,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_LEGACY_FORM_FIELD_DEFAULT_OPTIONS as MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { BlueprintScrewCardComponent } from '@heavy-duty/blueprint-card';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ReactiveComponentModule } from '@ngrx/component';
import { FormlyModule } from '@ngx-formly/core';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { filter, map } from 'rxjs';
import { PluginsService } from '../../plugins';
import { isNotNull, Option } from '../../utils';
import { CreateTransactionSectionStore } from './create-transaction-section.store';
import {
	InstructionAutocompleteComponent,
	InstructionOption,
} from './instruction-autocomplete.component';
import {
	TransactionFormModel,
	TransactionFormStore,
} from './transaction-form.store';

importProvidersFrom;

@Component({
	selector: 'crane-create-transaction-section',
	template: `
		<header
			class="flex justify-between bg-bp-stone-rotated bg-bp-black p-4 absolute w-full z-10 shadow-md"
			style="height: 88px"
		>
			<div class="flex items-center pr-4">
				<figure
					class="flex justify-center items-center w-10 h-10 rounded-full overflow-hidden"
				>
					<img
						class="w-8/12"
						alt=""
						src="assets/images/logo.webp"
						width="26"
						height="34"
					/>
				</figure>
				<h1 class="text-3xl">Crane Playground</h1>
			</div>

			<bp-screw-card
				class="bg-black bg-bp-metal-2 px-8 py-2 rounded inline-block"
			>
				<button
					class="bg-black h-full px-4 py-1 bp-button uppercase text-sm flex gap-2 items-center"
					(click)="onRestartTransactionForm()"
					type="button"
				>
					<span>Restart <mat-icon inline>refresh</mat-icon></span>
				</button>
			</bp-screw-card>
		</header>

		<section
			class="pl-4 pr-2 pb-4 overflow-y-scroll h-full"
			style="padding-top: 104px"
		>
			<crane-instruction-autocomplete
				(instructionSelected)="onInstructionSelected($event)"
			></crane-instruction-autocomplete>

			<ng-container *ngrxLet="authority$; let authority">
				<form
					*ngIf="transactionForm$ | ngrxPush as transactionForm"
					[formGroup]="transactionForm.form"
					(ngSubmit)="onBuildTransaction(authority, transactionForm.model)"
				>
					<formly-form
						[form]="transactionForm.form"
						[fields]="[transactionForm.fields]"
						[model]="transactionForm.model"
					></formly-form>
				</form>
			</ng-container>
		</section>
	`,
	providers: [
		TransactionFormStore,
		CreateTransactionSectionStore,
		{
			provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
			useValue: { appearance: 'fill' },
		},
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		ReactiveComponentModule,
		FormlyModule,
		InstructionAutocompleteComponent,
		BlueprintScrewCardComponent,
		MatIconModule,
	],
})
export class CreateTransactionSectionComponent {
	private readonly _walletStore = inject(WalletStore);
	private readonly _pluginsService = inject(PluginsService);
	private readonly _transactionFormStore = inject(TransactionFormStore);
	private readonly _createTransactionSectionStore = inject(
		CreateTransactionSectionStore
	);

	@HostBinding('class') class = 'relative';
	readonly transactionForm$ = this._transactionFormStore.transactionForm$;
	readonly disabled$ = this._createTransactionSectionStore.disabled$;
	readonly authority$ = this._walletStore.publicKey$;

	@Output() transactionCreated =
		this._createTransactionSectionStore.serviceState$.pipe(
			isNotNull,
			filter((state) => state?.matches('Transaction created') ?? false),
			map(({ context: { transaction } }) => transaction ?? null)
		);

	onBuildTransaction(
		authority: Option<PublicKey>,
		model: TransactionFormModel
	) {
		const instructions = Object.values(model).reduce(
			(
				instructions: TransactionInstruction[],
				{ namespace, name, instruction, accounts, args }
			) => {
				const transactionInstruction =
					this._pluginsService
						.getPlugin(namespace, name)
						?.getTransactionInstruction(instruction, args, accounts) ?? null;

				if (transactionInstruction === null) {
					throw new Error('Invalid instruction.');
				}

				return [...instructions, transactionInstruction];
			},
			[]
		);

		this._createTransactionSectionStore.createTransaction({
			feePayer: authority,
			instructions,
		});
	}

	onInstructionSelected(instructionOption: InstructionOption) {
		this._transactionFormStore.addInstruction(instructionOption);
	}

	onRestartTransactionForm() {
		this._transactionFormStore.restart();
	}
}
