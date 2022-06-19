import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
	InstructionApiService,
	InstructionStore,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { distinctUntilChanged, map, take } from 'rxjs';
import { ViewInstructionCodeEditorInstructionStore } from './view-instruction-code-editor-instruction.store';
import { ViewInstructionCodeStore } from './view-instruction-code.store';

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
				class="flex flex-col gap-2 h-full pt-7 pb-3 px-5 bg-bp-metal justify-center items-center m-auto mb-4 relative bg-black mat-elevation-z8 rounded"
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
										instructionBody
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
		InstructionStore,
		ViewInstructionCodeEditorInstructionStore,
		ViewInstructionCodeStore,
	],
})
export class ViewInstructionCodeEditorComponent implements OnInit {
	@HostBinding('class') class = 'flex flex-col p-8 pt-5 h-full';
	instructionBody: string | null = null;

	readonly contextCode$ = this._viewInstructionCodeStore.code$;
	readonly handleCode$ = this._viewInstructionCodeStore.handleCode$.pipe(
		isNotNullOrUndefined,
		take(1)
	);
	readonly instruction$ =
		this._viewInstructionCodeEditorInstructionStore.instruction$;
	readonly instructionId$ = this._route.paramMap.pipe(
		map((paramMap) => paramMap.get('instructionId')),
		isNotNullOrUndefined,
		distinctUntilChanged()
	);

	constructor(
		private readonly _route: ActivatedRoute,
		private readonly _notificationStore: NotificationStore,
		private readonly _instructionApiService: InstructionApiService,
		private readonly _viewInstructionCodeStore: ViewInstructionCodeStore,
		private readonly _viewInstructionCodeEditorInstructionStore: ViewInstructionCodeEditorInstructionStore
	) {}

	ngOnInit() {
		this._viewInstructionCodeStore.setInstructionId(this.instructionId$);
		this._viewInstructionCodeEditorInstructionStore.setInstructionId(
			this.instructionId$
		);
	}

	async onUpdateInstructionBody(
		authority: string,
		workspaceId: string,
		applicationId: string,
		instructionId: string,
		instructionBody: string
	) {
		const success = await this._instructionApiService.updateBody({
			authority,
			workspaceId,
			applicationId,
			instructionId,
			body: instructionBody,
		});

		if (success) {
			this._notificationStore.setEvent('Update instruction body request sent');
			this._viewInstructionCodeStore.reload();
		}
	}
}
