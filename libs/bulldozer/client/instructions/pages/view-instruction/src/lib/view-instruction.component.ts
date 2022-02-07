import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import {
  Document,
  Instruction,
  InstructionAccountDto,
  InstructionArgumentDto,
} from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ViewCollectionsStore } from './view-collections.store';
import { ViewInstructionAccountsStore } from './view-instruction-accounts.store';
import { ViewInstructionArgumentsStore } from './view-instruction-arguments.store';
import { ViewInstructionCodeStore } from './view-instruction-code.store';
import { ViewInstructionDocumentsStore } from './view-instruction-documents.store';
import { ViewInstructionRelationsStore } from './view-instruction-relations.store';
import { ViewInstructionSignersStore } from './view-instruction-signers.store';
import { ViewInstructionStore } from './view-instruction.store';

@Component({
  selector: 'bd-view-instruction',
  template: `
    <div class="flex w-full" *ngIf="instruction$ | ngrxPush as instruction">
      <div class="p-4 w-1/2 bd-custom-height-layout overflow-auto">
        <header bdPageHeader>
          <h1>
            {{ instruction.name }}
          </h1>
          <p>Visualize all the details about this instruction.</p>
        </header>

        <main class="mb-16">
          <bd-instruction-arguments-list
            class="block mb-4"
            [connected]="(connected$ | ngrxPush) ?? false"
            [instructionArguments]="(instructionArguments$ | ngrxPush) ?? null"
            (createInstructionArgument)="onCreateInstructionArgument($event)"
            (updateInstructionArgument)="onUpdateInstructionArgument($event)"
            (deleteInstructionArgument)="onDeleteInstructionArgument($event)"
          ></bd-instruction-arguments-list>
          <bd-instruction-documents-list
            class="block mb-4"
            [connected]="(connected$ | ngrxPush) ?? false"
            [instructionDocuments]="(instructionDocuments$ | ngrxPush) ?? null"
            (createInstructionDocument)="onCreateInstructionAccount($event)"
            (updateInstructionDocument)="onUpdateInstructionAccount($event)"
            (deleteInstructionDocument)="onDeleteInstructionAccount($event)"
            (createInstructionRelation)="onCreateInstructionRelation($event)"
            (updateInstructionRelation)="onUpdateInstructionRelation($event)"
            (deleteInstructionRelation)="onDeleteInstructionRelation($event)"
          >
          </bd-instruction-documents-list>
          <bd-instruction-signers-list
            class="block"
            [connected]="(connected$ | ngrxPush) ?? false"
            [instructionSigners]="(instructionSigners$ | ngrxPush) ?? null"
            (createInstructionSigner)="onCreateInstructionAccount($event)"
            (updateInstructionSigner)="onUpdateInstructionAccount($event)"
            (deleteInstructionSigner)="onDeleteInstructionAccount($event)"
          >
          </bd-instruction-signers-list>
        </main>
      </div>
      <div class="w-1/2">
        <div class="bd-custom-height-layout overflow-hidden">
          <bd-code-editor
            [customClass]="'bd-border-bottom bd-custom-monaco-editor-splited'"
            [template]="(contextCode$ | ngrxPush) ?? null"
            [options]="(contextEditorOptions$ | ngrxPush) ?? null"
          ></bd-code-editor>

          <ng-container *ngIf="connected$ | ngrxPush">
            <div
              *ngIf="instruction.data.body !== instructionBody"
              class="w-full flex justify-end"
            >
              <p class="ml-2 mb-0">
                Remember to save the changes below:
                <button
                  mat-raised-button
                  color="primary"
                  (click)="onUpdateInstructionBody(instruction)"
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
    ViewInstructionStore,
    ViewInstructionArgumentsStore,
    ViewCollectionsStore,
    ViewInstructionRelationsStore,
    ViewInstructionDocumentsStore,
    ViewInstructionSignersStore,
    ViewInstructionCodeStore,
  ],
})
export class ViewInstructionComponent {
  @HostBinding('class') class = 'block';
  instructionBody = '';
  readonly connected$ = this._walletStore.connected$;
  readonly instruction$ = this._viewInstructionStore.instruction$;
  readonly instructionArguments$ =
    this._viewInstructionArgumentsStore.instructionArguments$;
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
    private readonly _walletStore: WalletStore,
    private readonly _viewInstructionStore: ViewInstructionStore,
    private readonly _viewInstructionCodeStore: ViewInstructionCodeStore,
    private readonly _viewInstructionArgumentsStore: ViewInstructionArgumentsStore,
    private readonly _viewInstructionAccountsStore: ViewInstructionAccountsStore,
    private readonly _viewInstructionDocumentsStore: ViewInstructionDocumentsStore,
    private readonly _viewInstructionSignersStore: ViewInstructionSignersStore,
    private readonly _viewInstructionRelationsStore: ViewInstructionRelationsStore
  ) {}

  onUpdateInstructionBody(instruction: Document<Instruction>) {
    this._viewInstructionStore.updateInstructionBody({
      instruction,
      instructionBody: this.instructionBody,
    });
  }

  onCreateInstructionArgument(instructionArgumentDto: InstructionArgumentDto) {
    this._viewInstructionArgumentsStore.createInstructionArgument({
      instructionArgumentDto,
    });
  }

  onUpdateInstructionArgument(request: {
    instructionArgumentId: string;
    instructionArgumentDto: InstructionArgumentDto;
  }) {
    this._viewInstructionArgumentsStore.updateInstructionArgument(request);
  }

  onDeleteInstructionArgument(instructionArgumentId: string) {
    this._viewInstructionArgumentsStore.deleteInstructionArgument({
      instructionArgumentId,
    });
  }

  onCreateInstructionAccount(instructionAccountDto: InstructionAccountDto) {
    this._viewInstructionAccountsStore.createInstructionAccount({
      instructionAccountDto,
    });
  }

  onUpdateInstructionAccount(request: {
    instructionAccountId: string;
    instructionAccountDto: InstructionAccountDto;
  }) {
    this._viewInstructionAccountsStore.updateInstructionAccount(request);
  }

  onDeleteInstructionAccount(instructionAccountId: string) {
    this._viewInstructionAccountsStore.deleteInstructionAccount({
      instructionAccountId,
    });
  }

  onCreateInstructionRelation(request: {
    fromAccountId: string;
    toAccountId: string;
  }) {
    this._viewInstructionRelationsStore.createInstructionRelation(request);
  }

  onUpdateInstructionRelation(request: {
    instructionRelationId: string;
    fromAccountId: string;
    toAccountId: string;
  }) {
    this._viewInstructionRelationsStore.updateInstructionRelation(request);
  }

  onDeleteInstructionRelation(request: {
    instructionRelationId: string;
    fromAccountId: string;
    toAccountId: string;
  }) {
    this._viewInstructionRelationsStore.deleteInstructionRelation(request);
  }
}
