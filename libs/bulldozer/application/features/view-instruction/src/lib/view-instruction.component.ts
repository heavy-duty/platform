import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import {
  Document,
  Instruction,
  InstructionAccount,
  InstructionArgument,
  InstructionRelation,
  Relation,
} from '@heavy-duty/bulldozer-devkit';
import { ViewInstructionStore } from './view-instruction.store';

@Component({
  selector: 'bd-view-instruction',
  template: `
    <div class="flex w-full" *ngIf="instruction$ | ngrxPush as instruction">
      <div class="p-4 w-1/2 bd-custom-height-layout overflow-auto">
        <header bdPageHeader>
          <h1>
            {{ instruction.name }}
            <button
              mat-icon-button
              color="primary"
              aria-label="Reload instruction"
              (click)="onReload()"
            >
              <mat-icon>refresh</mat-icon>
            </button>
          </h1>
          <p>Visualize all the details about this instruction.</p>
        </header>

        <bd-instruction-menu
          [connected]="connected$ | ngrxPush"
          (createArgument)="
            onCreateInstructionArgument(
              instruction.data.workspace,
              instruction.data.application,
              instruction.id
            )
          "
          (createDocument)="
            onCreateInstructionDocument(
              instruction.data.workspace,
              instruction.data.application,
              instruction.id
            )
          "
          (createSigner)="
            onCreateInstructionSigner(
              instruction.data.workspace,
              instruction.data.application,
              instruction.id
            )
          "
        >
        </bd-instruction-menu>

        <main>
          <bd-list-arguments
            class="block mb-4"
            [connected]="connected$ | ngrxPush"
            [arguments]="instructionArguments$ | ngrxPush"
            (updateArgument)="onUpdateInstructionArgument($event)"
            (deleteArgument)="onDeleteInstructionArgument($event)"
          ></bd-list-arguments>

          <bd-list-documents
            class="block mb-4"
            [connected]="connected$ | ngrxPush"
            [documents]="documents$ | ngrxPush"
            (updateDocument)="onUpdateInstructionDocument($event)"
            (deleteDocument)="onDeleteInstructionDocument($event)"
            (createRelation)="
              onCreateInstructionRelation(
                instruction.data.workspace,
                instruction.data.application,
                instruction.id,
                $event
              )
            "
            (updateRelation)="onUpdateInstructionRelation($event)"
            (deleteRelation)="onDeleteInstructionRelation($event)"
          >
          </bd-list-documents>

          <bd-list-signers
            class="block mb-16"
            [connected]="connected$ | ngrxPush"
            [signers]="signers$ | ngrxPush"
            (updateSigner)="onUpdateInstructionSigner($event)"
            (deleteSigner)="onDeleteInstructionSigner($event)"
          >
          </bd-list-signers>
        </main>
      </div>
      <div class="w-1/2">
        <div class="bd-custom-height-layout overflow-hidden">
          <bd-code-editor
            [customClass]="'bd-border-bottom bd-custom-monaco-editor-splited'"
            [template]="instructionContext$ | ngrxPush"
            [options]="contextEditorOptions$ | ngrxPush"
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
            [template]="instructionBody$ | ngrxPush"
            [options]="handlerEditorOptions$ | ngrxPush"
            (codeChange)="instructionBody = $event"
          ></bd-code-editor>
        </div>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ViewInstructionStore],
})
export class ViewInstructionComponent {
  @HostBinding('class') class = 'block';
  instructionBody = '';
  readonly connected$ = this._viewInstructionStore.connected$;
  readonly instruction$ = this._viewInstructionStore.instruction$;
  readonly instructionBody$ = this._viewInstructionStore.instructionBody$;
  readonly instructionContext$ = this._viewInstructionStore.instructionContext$;
  readonly instructionArguments$ =
    this._viewInstructionStore.instructionArguments$;
  readonly documents$ = this._viewInstructionStore.documents$;
  readonly signers$ = this._viewInstructionStore.signers$;
  readonly commonEditorOptions = this._viewInstructionStore.commonEditorOptions;
  readonly contextEditorOptions$ =
    this._viewInstructionStore.contextEditorOptions$;
  readonly handlerEditorOptions$ =
    this._viewInstructionStore.handlerEditorOptions$;

  constructor(private readonly _viewInstructionStore: ViewInstructionStore) {}

  onReload() {
    // this._instructionStore.reload();
  }

  onUpdateInstructionBody(instruction: Document<Instruction>) {
    this._viewInstructionStore.updateInstructionBody({
      instruction,
      instructionBody: this.instructionBody,
    });
  }

  onCreateInstructionArgument(
    workspaceId: string,
    applicationId: string,
    instructionId: string
  ) {
    this._viewInstructionStore.createInstructionArgument({
      workspaceId,
      applicationId,
      instructionId,
    });
  }

  onUpdateInstructionArgument(
    instructionArgument: Document<InstructionArgument>
  ) {
    this._viewInstructionStore.updateInstructionArgument(instructionArgument);
  }

  onDeleteInstructionArgument(
    instructionArgument: Document<InstructionArgument>
  ) {
    this._viewInstructionStore.deleteInstructionArgument(instructionArgument);
  }

  onCreateInstructionDocument(
    workspaceId: string,
    applicationId: string,
    instructionId: string
  ) {
    this._viewInstructionStore.createInstructionDocument({
      workspaceId,
      applicationId,
      instructionId,
    });
  }

  onUpdateInstructionDocument(
    instructionAccount: Document<InstructionAccount>
  ) {
    this._viewInstructionStore.updateInstructionDocument(instructionAccount);
  }

  onDeleteInstructionDocument(
    instructionAccount: Document<InstructionAccount>
  ) {
    this._viewInstructionStore.deleteInstructionDocument(instructionAccount);
  }

  onCreateInstructionSigner(
    workspaceId: string,
    applicationId: string,
    instructionId: string
  ) {
    this._viewInstructionStore.createInstructionSigner({
      workspaceId,
      applicationId,
      instructionId,
    });
  }

  onUpdateInstructionSigner(instructionAccount: Document<InstructionAccount>) {
    this._viewInstructionStore.updateInstructionSigner(instructionAccount);
  }

  onDeleteInstructionSigner(instructionAccount: Document<InstructionAccount>) {
    this._viewInstructionStore.deleteInstructionSigner(instructionAccount);
  }

  onCreateInstructionRelation(
    workspaceId: string,
    applicationId: string,
    instructionId: string,
    documentId: string
  ) {
    this._viewInstructionStore.createInstructionRelation({
      workspaceId,
      applicationId,
      instructionId,
      documentId,
    });
  }

  onUpdateInstructionRelation(
    instructionRelation: Relation<InstructionRelation>
  ) {
    this._viewInstructionStore.updateInstructionRelation(instructionRelation);
  }

  onDeleteInstructionRelation(
    instructionRelation: Relation<InstructionRelation>
  ) {
    this._viewInstructionStore.deleteInstructionRelation(instructionRelation);
  }
}
