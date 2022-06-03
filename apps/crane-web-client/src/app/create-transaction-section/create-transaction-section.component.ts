import { Component, HostBinding, Output } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { filter, map } from 'rxjs';
import { PluginsService } from '../plugins';
import { isNotNull, Option } from '../utils';
import { CreateTransactionSectionStore } from './create-transaction-section.store';
import { InstructionOption } from './instruction-autocomplete.component';
import {
	TransactionFormModel,
	TransactionFormService,
} from './transaction-form.service';

@Component({
	selector: 'crane-create-transaction-section',
	template: `
		<header
			class="flex justify-between bp-bg-stone-rotated bg-bp-black p-4 absolute w-full z-10 shadow-md"
			style="height: 88px"
		>
			<div class="flex items-center pr-4">
				<figure
					class="flex justify-center items-center w-10 h-10 rounded-full overflow-hidden"
				>
					<img
						alt=""
						src="assets/images/logo.webp"
						class="w-8/12"
						width="26"
						height="34"
					/>
				</figure>
				<h1 class="text-3xl">Crane Playground</h1>
			</div>

			<button (click)="onRestartTransactionForm()" class="underline">
				Restart form
			</button>
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
					*ngIf="transactionForm$ | async as transactionForm"
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
	providers: [TransactionFormService, CreateTransactionSectionStore],
})
export class CreateTransactionSectionComponent {
	@HostBinding('class') class = 'relative';
	readonly transactionForm$ = this._transactionFormService.transactionForm$;
	readonly disabled$ = this._createTransactionSectionStore.disabled$;
	readonly authority$ = this._walletStore.publicKey$;

	@Output() transactionCreated =
		this._createTransactionSectionStore.serviceState$.pipe(
			isNotNull,
			filter((state) => state?.matches('Transaction created') ?? false),
			map(({ context: { transaction } }) => transaction ?? null)
		);

	constructor(
		private readonly _walletStore: WalletStore,
		private readonly _pluginsService: PluginsService,
		private readonly _transactionFormService: TransactionFormService,
		private readonly _createTransactionSectionStore: CreateTransactionSectionStore
	) {}

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
		this._transactionFormService.addInstruction(instructionOption);
	}

	onRestartTransactionForm() {
		this._transactionFormService.restart();
	}
}
