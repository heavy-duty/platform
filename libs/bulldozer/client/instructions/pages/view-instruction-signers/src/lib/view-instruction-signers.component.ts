import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
	InstructionAccountApiService,
	InstructionAccountQueryStore,
	InstructionAccountsStore,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import { InstructionAccountDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { Keypair } from '@solana/web3.js';
import { distinctUntilChanged, map } from 'rxjs';
import { ViewInstructionSignersStore } from './view-instruction-signers.store';

@Component({
	selector: 'bd-view-instruction-signers',
	template: `
		<header class="mb-8">
			<div>
				<h1 class="text-4xl uppercase mb-1 bp-font">Signers</h1>
				<p class="text-sm font-thin mb-0">
					The signers are all the signatures required to execute the
					instruction.
				</p>
			</div>

			<ng-container *hdWalletAdapter="let publicKey = publicKey">
				<ng-container *ngrxLet="workspaceId$; let workspaceId">
					<ng-container *ngrxLet="applicationId$; let applicationId">
						<ng-container *ngrxLet="instructionId$; let instructionId">
							<button
								*ngIf="
									publicKey !== null &&
									workspaceId !== null &&
									applicationId !== null &&
									instructionId !== null
								"
								class="underline text-accent"
								(editInstructionSigner)="
									onCreateInstructionAccount(
										publicKey.toBase58(),
										workspaceId,
										applicationId,
										instructionId,
										$event
									)
								"
								bdEditInstructionSigner
							>
								New signer
							</button>
						</ng-container>
					</ng-container>
				</ng-container>
			</ng-container>
		</header>

		<main *ngrxLet="signers$; let signers">
			<div
				*ngIf="signers && signers.size > 0; else emptyList"
				class="flex gap-6 flex-wrap"
			>
				<div
					*ngFor="let signer of signers; let i = index"
					class="flex flex-col gap-2 bg-bp-metal bg-black px-4 py-5 rounded mat-elevation-z8"
				>
					<bd-card class="flex-1 flex gap-4">
						<figure
							*ngIf="!(signer | bdItemChanging)"
							class="w-16 h-16 flex justify-center items-center bg-bp-black rounded-full"
						>
							<img
								alt=""
								width="40"
								height="40"
								src="assets/icons/instruction-signer.svg"
								onerror="this.src='assets/images/default-profile.png';"
							/>
						</figure>

						<div
							*ngIf="signer | bdItemChanging"
							class="flex justify-center items-center w-16 h-16 rounded-full overflow-hidden bg-bp-black"
						>
							<span
								class="h-8 w-8 border-4 border-accent"
								hdProgressSpinner
							></span>

							<p class="m-0 text-xs text-white text-opacity-60 absolute">
								<ng-container *ngIf="signer.isCreating">
									Creating
								</ng-container>
								<ng-container *ngIf="signer.isUpdating">
									Updating
								</ng-container>
								<ng-container *ngIf="signer.isDeleting">
									Deleting
								</ng-container>
							</p>
						</div>

						<div class="flex">
							<section>
								<p
									class="m-0 text-lg font-bold overflow-hidden whitespace-nowrap overflow-ellipsis"
									[matTooltip]="
										signer.name | bdItemUpdatingMessage: signer:'Signer'
									"
									matTooltipShowDelay="500"
								>
									{{ signer.name }}
								</p>

								<p class="m-0">
									<ng-container *ngIf="signer.modifier === null">
										Non-mutable
									</ng-container>
									<ng-container
										*ngIf="signer.modifier !== null && signer.modifier.id === 1"
									>
										Mutable
									</ng-container>
								</p>
							</section>
						</div>
					</bd-card>
					<bd-card
						*hdWalletAdapter="
							let publicKey = publicKey;
							let connected = connected
						"
						class="flex"
					>
						<ng-container *ngIf="publicKey !== null">
							<button
								class="bp-button w-32"
								[attr.aria-label]="'Update signer ' + signer.name"
								[instructionSigner]="{
									name: signer.name,
									kind: signer.kind.id,
									space: null,
									payer: null,
									collection: null,
									modifier: signer.modifier?.id ?? null,
									close: null,
									uncheckedExplanation: null,
									mint: null,
									tokenAuthority: null
								}"
								[disabled]="signer | bdItemChanging"
								(editInstructionSigner)="
									onUpdateInstructionAccount(
										publicKey.toBase58(),
										signer.workspaceId,
										signer.applicationId,
										signer.instructionId,
										signer.id,
										$event
									)
								"
								bdEditInstructionSigner
							>
								Edit
							</button>

							<button
								class="bp-button w-32"
								[attr.aria-label]="'Delete signer ' + signer.name"
								[disabled]="signer | bdItemChanging"
								(click)="
									onDeleteInstructionAccount(
										publicKey.toBase58(),
										signer.workspaceId,
										signer.instructionId,
										signer.id
									)
								"
							>
								Delete
							</button>
						</ng-container>
					</bd-card>
				</div>
			</div>

			<ng-template #emptyList>
				<p class="text-center text-xl py-8">There's no signers yet.</p>
			</ng-template>
		</main>
	`,
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		InstructionAccountsStore,
		InstructionAccountQueryStore,
		ViewInstructionSignersStore,
	],
})
export class ViewInstructionSignersComponent implements OnInit {
	@HostBinding('class') class = 'block p-8 pt-5 h-full';
	readonly workspaceId$ = this._route.paramMap.pipe(
		map((paramMap) => paramMap.get('workspaceId')),
		isNotNullOrUndefined,
		distinctUntilChanged()
	);
	readonly applicationId$ = this._route.paramMap.pipe(
		map((paramMap) => paramMap.get('applicationId')),
		isNotNullOrUndefined,
		distinctUntilChanged()
	);
	readonly instructionId$ = this._route.paramMap.pipe(
		map((paramMap) => paramMap.get('instructionId')),
		isNotNullOrUndefined,
		distinctUntilChanged()
	);
	readonly signers$ = this._viewInstructionSignersStore.accounts$.pipe(
		map(
			(accounts) => accounts?.filter((account) => account.kind.id === 1) ?? null
		)
	);

	constructor(
		private readonly _route: ActivatedRoute,
		private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
		private readonly _notificationStore: NotificationStore,
		private readonly _instructionAccountApiService: InstructionAccountApiService,
		private readonly _viewInstructionSignersStore: ViewInstructionSignersStore
	) {}

	ngOnInit() {
		this._viewInstructionSignersStore.setInstructionId(this.instructionId$);
	}

	onCreateInstructionAccount(
		authority: string,
		workspaceId: string,
		applicationId: string,
		instructionId: string,
		instructionAccountDto: InstructionAccountDto
	) {
		const instructionaccountKeypair = Keypair.generate();

		this._instructionAccountApiService
			.create(instructionaccountKeypair, {
				instructionAccountDto,
				authority,
				workspaceId,
				applicationId,
				instructionId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Create signer request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`instructions:${instructionId}:accounts`,
								],
							},
						})
					);
				},
				error: (error) => {
					this._notificationStore.setError(error);
				},
			});
	}

	onUpdateInstructionAccount(
		authority: string,
		workspaceId: string,
		applicationId: string,
		instructionId: string,
		instructionAccountId: string,
		instructionAccountDto: InstructionAccountDto
	) {
		this._instructionAccountApiService
			.update({
				authority,
				workspaceId,
				applicationId,
				instructionId,
				instructionAccountDto,
				instructionAccountId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Update signer request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`instructions:${instructionId}:accounts`,
								],
							},
						})
					);
				},
				error: (error) => {
					this._notificationStore.setError(error);
				},
			});
	}

	onDeleteInstructionAccount(
		authority: string,
		workspaceId: string,
		instructionId: string,
		instructionAccountId: string
	) {
		this._instructionAccountApiService
			.delete({
				authority,
				workspaceId,
				instructionAccountId,
				instructionId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Delete signer request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`instructions:${instructionId}:accounts`,
								],
							},
						})
					);
				},
				error: (error) => {
					this._notificationStore.setError(error);
				},
			});
	}
}
