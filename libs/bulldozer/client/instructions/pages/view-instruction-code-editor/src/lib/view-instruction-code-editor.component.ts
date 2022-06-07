import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CollectionsStore } from '@bulldozer-client/collections-data-access';
import {
	InstructionAccountClosesStore,
	InstructionAccountCollectionsStore,
	InstructionAccountPayersStore,
	InstructionAccountQueryStore,
	InstructionAccountsStore,
	InstructionApiService,
	InstructionArgumentQueryStore,
	InstructionArgumentsStore,
	InstructionRelationQueryStore,
	InstructionRelationsStore,
	InstructionStore,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import { InstructionBodyDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { distinctUntilChanged, map } from 'rxjs';
import { ViewInstructionCodeEditorAccountsStore } from './view-instruction-code-editor-accounts.store';
import { ViewInstructionCodeEditorArgumentsStore } from './view-instruction-code-editor-arguments.store';
import { ViewInstructionCodeEditorClosesReferencesStore } from './view-instruction-code-editor-close-references.store';
import { ViewInstructionCodeEditorCollectionsReferencesStore } from './view-instruction-code-editor-collections-references.store';
import { ViewInstructionCodeEditorCollectionsStore } from './view-instruction-code-editor-collections.store';
import { ViewInstructionCodeEditorInstructionStore } from './view-instruction-code-editor-instruction.store';
import { ViewInstructionCodeEditorPayersReferencesStore } from './view-instruction-code-editor-payers-references.store';
import { ViewInstructionCodeEditorRelationsStore } from './view-instruction-code-editor-relations.store';
import { ViewInstructionCodeEditorStore } from './view-instruction-code-editor.store';

@Component({
	selector: 'bd-view-instruction-code-editor',
	template: `
		<header class="mb-8">
			<h1 class="text-4xl uppercase mb-1 bp-font">Code Editor</h1>
			<p class="text-sm font-thin mb-0">
				The code editor allows you to customize an instruction.
			</p>
		</header>

		<main class="flex-1">
			<div
				*ngIf="instruction$ | ngrxPush as instruction"
				class="flex flex-col gap-2 h-full pt-7 pb-3 px-5 bp-bg-metal justify-center items-center m-auto mb-4 relative bg-black mat-elevation-z8 rounded"
			>
				<bd-code-editor
					class="flex-1 w-full mb-2"
					[template]="(contextCode$ | ngrxPush) ?? null"
					[options]="{
						language: 'rust',
						automaticLayout: true,
						fontSize: 16,
						wordWrap: 'on',
						theme: 'vs-dark',
						readOnly: true
					}"
					customClass="h-full"
				></bd-code-editor>

				<bd-code-editor
					class="flex-1 w-full"
					[template]="(handleCode$ | ngrxPush) ?? null"
					[options]="{
						language: 'rust',
						automaticLayout: true,
						fontSize: 16,
						wordWrap: 'on',
						theme: 'vs-dark',
						readOnly: false
					}"
					(codeChange)="instructionBody = $event"
					customClass="h-full"
				></bd-code-editor>

				<div class="w-full h-4 pr-4">
					<ng-container *hdWalletAdapter="let publicKey = publicKey">
						<p
							*ngIf="
								publicKey !== null &&
								instructionBody !== null &&
								instruction.body !== instructionBody
							"
							class="ml-2 mb-0 text-right"
						>
							<mat-icon inline color="accent">report</mat-icon>
							You have unsaved changes. Remember to
							<button
								class="text-accent underline"
								(click)="
									onUpdateInstructionBody(
										publicKey.toBase58(),
										instruction.workspaceId,
										instruction.applicationId,
										instruction.id,
										{ body: instructionBody }
									)
								"
							>
								save changes.
							</button>
						</p>
					</ng-container>
				</div>
			</div>
		</main>
	`,
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		InstructionAccountPayersStore,
		InstructionAccountClosesStore,
		InstructionAccountCollectionsStore,
		InstructionStore,
		InstructionArgumentsStore,
		InstructionArgumentQueryStore,
		InstructionAccountsStore,
		InstructionAccountQueryStore,
		InstructionRelationsStore,
		InstructionRelationQueryStore,
		CollectionsStore,
		ViewInstructionCodeEditorStore,
		ViewInstructionCodeEditorInstructionStore,
		ViewInstructionCodeEditorAccountsStore,
		ViewInstructionCodeEditorRelationsStore,
		ViewInstructionCodeEditorCollectionsStore,
		ViewInstructionCodeEditorPayersReferencesStore,
		ViewInstructionCodeEditorCollectionsReferencesStore,
		ViewInstructionCodeEditorClosesReferencesStore,
		ViewInstructionCodeEditorArgumentsStore,
	],
})
export class ViewInstructionCodeEditorComponent implements OnInit {
	@HostBinding('class') class = 'flex flex-col p-8 pt-5 h-full';
	instructionBody: string | null = null;

	readonly contextCode$ = this._viewInstructionCodeEditorStore.contextCode$;
	readonly handleCode$ = this._viewInstructionCodeEditorStore.handleCode$;
	readonly instruction$ =
		this._viewInstructionCodeEditorInstructionStore.instruction$;
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

	constructor(
		private readonly _route: ActivatedRoute,
		private readonly _walletStore: WalletStore,
		private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
		private readonly _notificationStore: NotificationStore,
		private readonly _instructionApiService: InstructionApiService,
		private readonly _viewInstructionCodeEditorStore: ViewInstructionCodeEditorStore,
		private readonly _viewInstructionCodeEditorInstructionStore: ViewInstructionCodeEditorInstructionStore,
		private readonly _viewInstructionCodeEditorArgumentsStore: ViewInstructionCodeEditorArgumentsStore,
		private readonly _viewInstructionCodeEditorAccountsStore: ViewInstructionCodeEditorAccountsStore,
		private readonly _viewInstructionCodeEditorRelationsStore: ViewInstructionCodeEditorRelationsStore,
		private readonly _viewInstructionCodeEditorCollectionsStore: ViewInstructionCodeEditorCollectionsStore,
		private readonly _viewInstructionCodeEditorPayersReferencesStore: ViewInstructionCodeEditorPayersReferencesStore,
		private readonly _viewInstructionCodeEditorCollectionsReferencesStore: ViewInstructionCodeEditorCollectionsReferencesStore,
		private readonly _viewInstructionCodeEditorClosesReferencesStore: ViewInstructionCodeEditorClosesReferencesStore
	) {}

	ngOnInit() {
		this._viewInstructionCodeEditorAccountsStore.setInstructionId(
			this.instructionId$
		);
		this._viewInstructionCodeEditorRelationsStore.setInstructionId(
			this.instructionId$
		);
		this._viewInstructionCodeEditorPayersReferencesStore.setInstructionId(
			this.instructionId$
		);
		this._viewInstructionCodeEditorCollectionsReferencesStore.setInstructionId(
			this.instructionId$
		);
		this._viewInstructionCodeEditorClosesReferencesStore.setInstructionId(
			this.instructionId$
		);
		this._viewInstructionCodeEditorCollectionsStore.setApplicationId(
			this.applicationId$
		);
		this._viewInstructionCodeEditorInstructionStore.setInstructionId(
			this.instructionId$
		);
		this._viewInstructionCodeEditorArgumentsStore.setInstructionId(
			this.instructionId$
		);
	}

	onUpdateInstructionBody(
		authority: string,
		workspaceId: string,
		applicationId: string,
		instructionId: string,
		instructionBodyDto: InstructionBodyDto
	) {
		this._instructionApiService
			.updateBody({
				authority,
				workspaceId,
				applicationId,
				instructionId,
				instructionBodyDto,
			})
			.subscribe({
				next: ({ transactionSignature, transaction }) => {
					this._notificationStore.setEvent(
						'Update instruction body request sent'
					);
					this._hdBroadcasterSocketStore.send(
						JSON.stringify({
							event: 'transaction',
							data: {
								transactionSignature,
								transaction,
								topicNames: [
									`authority:${authority}`,
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
}
