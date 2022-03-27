import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CollectionQueryStore,
  CollectionsStore,
} from '@bulldozer-client/collections-data-access';
import {
  InstructionAccountsStore,
  InstructionArgumentQueryStore,
  InstructionArgumentsStore,
  InstructionRelationsStore,
  InstructionStore,
} from '@bulldozer-client/instructions-data-access';
import {
  Document,
  Instruction,
  InstructionAccountDto,
  InstructionArgumentDto,
} from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { map } from 'rxjs';
import { ViewInstructionCodeStore } from './view-instruction-code.store';
import { ViewInstructionDocumentsStore } from './view-instruction-documents.store';
import { ViewInstructionSignersStore } from './view-instruction-signers.store';
import { ViewInstructionStore } from './view-instruction.store';

@Component({
  selector: 'bd-view-instruction',
  template: `
    <div class="flex w-full" *ngIf="instruction$ | ngrxPush as instruction">
      <div
        class="p-5 w-1/2 bd-custom-height-content overflow-auto flex flex-col gap-5"
      >
        <header bdPageHeader>
          <h1>
            <span
              [matTooltip]="
                instruction.document.name
                  | bdItemUpdatingMessage: instruction:'Instruction'
              "
              matTooltipShowDelay="500"
              class="flex items-center justify-start gap-2"
            >
              {{ instruction.document.name }}
              <mat-progress-spinner
                *ngIf="instruction | bdItemShowSpinner"
                diameter="16"
                mode="indeterminate"
              ></mat-progress-spinner>
            </span>
          </h1>
          <p>Visualize all the details about this instruction.</p>
        </header>

        <main class="flex flex-col gap-4">
          <bd-instruction-arguments-list
            [connected]="(connected$ | ngrxPush) ?? false"
            [instructionArguments]="(instructionArguments$ | ngrxPush) ?? null"
            (createInstructionArgument)="
              onCreateInstructionArgument(
                instruction.document.data.workspace,
                instruction.document.data.application,
                instruction.document.id,
                $event
              )
            "
            (updateInstructionArgument)="
              onUpdateInstructionArgument(
                instruction.document.data.workspace,
                instruction.document.id,
                $event.instructionArgumentId,
                $event.instructionArgumentDto
              )
            "
            (deleteInstructionArgument)="
              onDeleteInstructionArgument(
                instruction.document.data.workspace,
                instruction.document.id,
                $event
              )
            "
          ></bd-instruction-arguments-list>
          <bd-instruction-documents-list
            [connected]="(connected$ | ngrxPush) ?? false"
            [collections]="(collections$ | ngrxPush) ?? null"
            [instructionAccounts]="(instructionAccounts$ | ngrxPush) ?? null"
            [instructionDocuments]="(instructionDocuments$ | ngrxPush) ?? null"
            (createInstructionDocument)="
              onCreateInstructionAccount(instruction.document, $event)
            "
            (updateInstructionDocument)="
              onUpdateInstructionAccount(
                instruction.document.data.workspace,
                instruction.document.id,
                $event
              )
            "
            (deleteInstructionDocument)="
              onDeleteInstructionAccount(
                instruction.document.data.workspace,
                instruction.document.id,
                $event
              )
            "
            (createInstructionRelation)="
              onCreateInstructionRelation(
                instruction.document,
                $event.fromAccountId,
                $event.toAccountId
              )
            "
            (deleteInstructionRelation)="
              onDeleteInstructionRelation(
                instruction.document.id,
                instruction.document.data.workspace,
                $event
              )
            "
          >
          </bd-instruction-documents-list>
          <bd-instruction-signers-list
            [connected]="(connected$ | ngrxPush) ?? false"
            [instructionSigners]="(instructionSigners$ | ngrxPush) ?? null"
            (createInstructionSigner)="
              onCreateInstructionAccount(instruction.document, $event)
            "
            (updateInstructionSigner)="
              onUpdateInstructionAccount(
                instruction.document.data.workspace,
                instruction.document.id,
                $event
              )
            "
            (deleteInstructionSigner)="
              onDeleteInstructionAccount(
                instruction.document.data.workspace,
                instruction.document.id,
                $event
              )
            "
          >
          </bd-instruction-signers-list>
        </main>
      </div>
      <div class="w-1/2">
        <div class="bd-custom-height-content overflow-hidden">
          <bd-code-editor
            [customClass]="'bd-border-bottom bd-custom-monaco-editor-splited'"
            [template]="(contextCode$ | ngrxPush) ?? null"
            [options]="(contextEditorOptions$ | ngrxPush) ?? null"
          ></bd-code-editor>

          <ng-container *ngIf="connected$ | ngrxPush">
            <div
              *ngIf="instruction.document.data.body !== instructionBody"
              class="w-full flex justify-end"
            >
              <p class="ml-2 mb-0">
                Remember to save the changes below:
                <button
                  mat-raised-button
                  color="primary"
                  (click)="
                    onUpdateInstructionBody(
                      instruction.document.data.workspace,
                      instruction.document.data.application,
                      instruction.document.id
                    )
                  "
                >
                  Save
                </button>
              </p>
            </div>
          </ng-container>

          <bd-code-editor
            [customClass]="'bd-custom-monaco-editor-splited'"
            [template]="(handleCode$ | ngrxPush) ?? null"
            [options]="(handleEditorOptions$ | ngrxPush) ?? null"
            (codeChange)="instructionBody = $event"
          ></bd-code-editor>
        </div>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    InstructionStore,
    InstructionArgumentsStore,
    InstructionArgumentQueryStore,
    InstructionAccountsStore,
    InstructionRelationsStore,
    CollectionsStore,
    CollectionQueryStore,
    ViewInstructionStore,
    ViewInstructionDocumentsStore,
    ViewInstructionSignersStore,
    ViewInstructionCodeStore,
  ],
})
export class ViewInstructionComponent {
  @HostBinding('class') class = 'block';
  instructionBody = '';
  readonly connected$ = this._walletStore.connected$;
  readonly collections$ = this._collectionsStore.collections$.pipe(
    map((collections) => collections.map(({ document }) => document))
  );
  readonly instruction$ = this._instructionStore.instruction$;
  readonly instructionArguments$ =
    this._instructionArgumentsStore.instructionArguments$;
  readonly instructionAccounts$ =
    this._instructionAccountsStore.instructionAccounts$;
  readonly instructionDocuments$ =
    this._viewInstructionDocumentsStore.instructionDocuments$;
  readonly instructionSigners$ =
    this._viewInstructionSignersStore.instructionSigners$;
  readonly contextCode$ = this._viewInstructionCodeStore.contextCode$;
  readonly contextEditorOptions$ =
    this._viewInstructionCodeStore.contextEditorOptions$;
  readonly handleEditorOptions$ =
    this._viewInstructionCodeStore.handleEditorOptions$;
  readonly handleCode$ = this._viewInstructionCodeStore.handleCode$;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _instructionStore: InstructionStore,
    private readonly _instructionArgumentsStore: InstructionArgumentsStore,
    private readonly _instructionAccountsStore: InstructionAccountsStore,
    private readonly _instructionRelationsStore: InstructionRelationsStore,
    private readonly _collectionsStore: CollectionsStore,
    private readonly _walletStore: WalletStore,
    private readonly _viewInstructionStore: ViewInstructionStore,
    private readonly _viewInstructionCodeStore: ViewInstructionCodeStore,
    private readonly _viewInstructionDocumentsStore: ViewInstructionDocumentsStore,
    private readonly _viewInstructionSignersStore: ViewInstructionSignersStore
  ) {
    this._instructionAccountsStore.setFilters(
      this._viewInstructionStore.instructionId$.pipe(
        isNotNullOrUndefined,
        map((instructionId) => ({ instruction: instructionId }))
      )
    );
    this._instructionRelationsStore.setFilters(
      this._viewInstructionStore.instructionId$.pipe(
        isNotNullOrUndefined,
        map((instructionId) => ({ instruction: instructionId }))
      )
    );
    this._viewInstructionStore.setWorkspaceId(
      this._route.paramMap.pipe(map((paramMap) => paramMap.get('workspaceId')))
    );
    this._viewInstructionStore.setApplicationId(
      this._route.paramMap.pipe(
        map((paramMap) => paramMap.get('applicationId'))
      )
    );
    this._viewInstructionStore.setInstructionId(
      this._route.paramMap.pipe(
        map((paramMap) => paramMap.get('instructionId'))
      )
    );
  }

  onUpdateInstructionBody(
    workspaceId: string,
    applicationId: string,
    instructionId: string
  ) {
    this._viewInstructionStore.updateInstructionBody({
      workspaceId,
      applicationId,
      instructionId,
      instructionBody: this.instructionBody,
    });
  }

  onCreateInstructionArgument(
    workspaceId: string,
    applicationId: string,
    instructionId: string,
    instructionArgumentDto: InstructionArgumentDto
  ) {
    this._viewInstructionStore.createInstructionArgument({
      workspaceId,
      applicationId,
      instructionId,
      instructionArgumentDto,
    });
  }

  onUpdateInstructionArgument(
    workspaceId: string,
    instructionId: string,
    instructionArgumentId: string,
    instructionArgumentDto: InstructionArgumentDto
  ) {
    this._viewInstructionStore.updateInstructionArgument({
      workspaceId,
      instructionId,
      instructionArgumentId,
      instructionArgumentDto,
    });
  }

  onDeleteInstructionArgument(
    workspaceId: string,
    instructionId: string,
    instructionArgumentId: string
  ) {
    this._viewInstructionStore.deleteInstructionArgument({
      workspaceId,
      instructionId,
      instructionArgumentId,
    });
  }

  onCreateInstructionAccount(
    instruction: Document<Instruction>,
    instructionAccountDto: InstructionAccountDto
  ) {
    this._instructionAccountsStore.createInstructionAccount({
      instruction,
      instructionAccountDto,
    });
  }

  onUpdateInstructionAccount(
    workspaceId: string,
    instructionId: string,
    request: {
      instructionAccountId: string;
      instructionAccountDto: InstructionAccountDto;
    }
  ) {
    this._instructionAccountsStore.updateInstructionAccount({
      ...request,
      workspaceId,
      instructionId,
    });
  }

  onDeleteInstructionAccount(
    workspaceId: string,
    instructionId: string,
    instructionAccountId: string
  ) {
    this._instructionAccountsStore.deleteInstructionAccount({
      workspaceId,
      instructionId,
      instructionAccountId,
    });
  }

  onCreateInstructionRelation(
    instruction: Document<Instruction>,
    fromAccountId: string,
    toAccountId: string
  ) {
    this._instructionRelationsStore.createInstructionRelation({
      instruction,
      fromAccountId,
      toAccountId,
    });
  }

  onDeleteInstructionRelation(
    workspaceId: string,
    instructionId: string,
    request: {
      instructionRelationId: string;
      fromAccountId: string;
      toAccountId: string;
    }
  ) {
    this._instructionRelationsStore.deleteInstructionRelation({
      ...request,
      workspaceId,
      instructionId,
    });
  }
}
