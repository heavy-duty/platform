import { Component, Input } from '@angular/core';
import {
	InstructionApiService,
	InstructionQueryStore,
	InstructionsStore,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import { InstructionDto } from '@heavy-duty/bulldozer-devkit';
import { Keypair } from '@solana/web3.js';
import { InstructionExplorerStore } from './instruction-explorer.store';
import { InstructionItemView } from './types';

@Component({
	selector: 'bd-instruction-explorer',
	template: `
		<mat-expansion-panel togglePosition="before">
			<mat-expansion-panel-header class="pl-6 pr-0">
				<div class="flex justify-between items-center flex-grow">
					<mat-panel-title class="font-bold"> Instructions </mat-panel-title>

					<ng-container
						*hdWalletAdapter="
							let publicKey = publicKey;
							let connected = connected
						"
					>
						<ng-container *ngIf="workspaceId$ | ngrxPush as workspaceId">
							<ng-container *ngIf="applicationId$ | ngrxPush as applicationId">
								<button
									*ngIf="
										publicKey !== null &&
										workspaceId !== null &&
										applicationId !== null
									"
									[disabled]="!connected"
									[disabled]="disableCreate"
									(editInstruction)="
										onCreateInstruction(
											publicKey.toBase58(),
											workspaceId,
											applicationId,
											$event
										)
									"
									mat-icon-button
									aria-label="Create instruction"
									bdStopPropagation
									bdEditInstruction
								>
									<mat-icon>add</mat-icon>
								</button>
							</ng-container>
						</ng-container>
					</ng-container>
				</div>
			</mat-expansion-panel-header>
			<mat-nav-list dense>
				<mat-list-item
					*ngFor="
						let instruction of instructions$ | ngrxPush;
						trackBy: identify
					"
					class="pr-0"
				>
					<a
						class="w-full flex justify-between gap-2 items-center flex-grow m-0 pl-0"
						[routerLink]="[
							'/workspaces',
							instruction.workspaceId,
							'applications',
							instruction.applicationId,
							'instructions',
							instruction.id
						]"
						[matTooltip]="
							instruction.name
								| bdItemUpdatingMessage: instruction:'Instruction'
						"
						matLine
						matTooltipShowDelay="500"
					>
						<span
							class="pl-12 flex-grow text-left overflow-hidden whitespace-nowrap overflow-ellipsis"
						>
							{{ instruction.name }}
						</span>
						<span
							*ngIf="instruction | bdItemChanging"
							class="flex-shrink-0 h-4 w-4 border-4 border-accent"
							hdProgressSpinner
						></span>
					</a>

					<ng-container
						*hdWalletAdapter="
							let publicKey = publicKey;
							let connected = connected
						"
					>
						<ng-container *ngIf="publicKey !== null">
							<button
								[attr.aria-label]="
									'More options of ' + instruction.name + ' instruction'
								"
								[matMenuTriggerFor]="instructionOptionsMenu"
								mat-icon-button
							>
								<mat-icon>more_horiz</mat-icon>
							</button>
							<mat-menu
								#instructionOptionsMenu="matMenu"
								class="bg-bp-wood bg-bp-brown"
							>
								<button
									[instruction]="instruction"
									[disabled]="!connected || (instruction | bdItemChanging)"
									(editInstruction)="
										onUpdateInstruction(
											publicKey.toBase58(),
											instruction.workspaceId,
											instruction.applicationId,
											instruction.id,
											$event
										)
									"
									mat-menu-item
									bdEditInstruction
								>
									<mat-icon>edit</mat-icon>
									<span>Edit instruction</span>
								</button>
								<button
									[disabled]="!connected || (instruction | bdItemChanging)"
									(click)="
										onDeleteInstruction(
											publicKey.toBase58(),
											instruction.workspaceId,
											instruction.applicationId,
											instruction.id
										)
									"
									mat-menu-item
								>
									<mat-icon>delete</mat-icon>
									<span>Delete instruction</span>
								</button>
							</mat-menu>
						</ng-container>
					</ng-container>
				</mat-list-item>
			</mat-nav-list>
		</mat-expansion-panel>
	`,
	providers: [
		InstructionsStore,
		InstructionQueryStore,
		InstructionExplorerStore,
	],
})
export class InstructionExplorerComponent {
	@Input() disableCreate = false;
	@Input() set workspaceId(value: string) {
		this._instructionExplorerStore.setWorkspaceId(value);
	}
	@Input() set applicationId(value: string) {
		this._instructionExplorerStore.setApplicationId(value);
	}

	readonly workspaceId$ = this._instructionExplorerStore.workspaceId$;
	readonly applicationId$ = this._instructionExplorerStore.applicationId$;
	readonly instructions$ = this._instructionExplorerStore.instructions$;

	constructor(
		private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
		private readonly _notificationStore: NotificationStore,
		private readonly _instructionApiService: InstructionApiService,
		private readonly _instructionExplorerStore: InstructionExplorerStore
	) {}

	onCreateInstruction(
		authority: string,
		workspaceId: string,
		applicationId: string,
		instructionDto: InstructionDto
	) {
		const instructionKeypair = Keypair.generate();

		this._instructionApiService
			.create(instructionKeypair, {
				authority,
				workspaceId,
				applicationId,
				instructionDto,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Create instruction request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`applications:${applicationId}:instructions`,
									`instructions:${instructionKeypair.publicKey.toBase58()}`,
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

	onUpdateInstruction(
		authority: string,
		workspaceId: string,
		applicationId: string,
		instructionId: string,
		instructionDto: InstructionDto
	) {
		this._instructionApiService
			.update({
				authority,
				workspaceId,
				applicationId,
				instructionDto,
				instructionId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Update instruction request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`applications:${applicationId}:instructions`,
									`instructions:${instructionId}`,
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

	onDeleteInstruction(
		authority: string,
		workspaceId: string,
		applicationId: string,
		instructionId: string
	) {
		this._instructionApiService
			.delete({
				authority,
				workspaceId,
				applicationId,
				instructionId,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent('Delete instruction request sent');
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
									`applications:${applicationId}:instructions`,
									`instructions:${instructionId}`,
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

	identify(_: number, instruction: InstructionItemView) {
		return instruction.id;
	}
}
