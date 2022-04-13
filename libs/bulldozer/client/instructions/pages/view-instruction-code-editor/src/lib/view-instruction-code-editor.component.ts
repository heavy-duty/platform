import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CollectionsStore } from '@bulldozer-client/collections-data-access';
import {
  InstructionAccountQueryStore,
  InstructionAccountsStore,
  InstructionArgumentQueryStore,
  InstructionArgumentsStore,
  InstructionRelationQueryStore,
  InstructionRelationsStore,
  InstructionStore,
} from '@bulldozer-client/instructions-data-access';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { map } from 'rxjs';
import { ViewInstructionCodeEditorStore } from './view-instruction-code-editor.store';

@Component({
  selector: 'bd-view-instruction-code-editor',
  template: `
    <header class="mb-8 border-b-2 border-yellow-500">
      <h1 class="text-2xl uppercase mb-1">Code Editor</h1>
      <p class="text-sm font-thin mb-2">
        The code editor allows you to customize an instruction.
      </p>
    </header>

    <main class="flex-1">
      <div
        class="h-full flex flex-col gap-1"
        *ngIf="instruction$ | ngrxPush as instruction"
      >
        <bd-code-editor
          class="flex-1"
          customClass="h-full"
          [template]="(contextCode$ | ngrxPush) ?? null"
          [options]="(contextEditorOptions$ | ngrxPush) ?? null"
        ></bd-code-editor>

        <bd-code-editor
          class="flex-1"
          customClass="h-full"
          [template]="(handleCode$ | ngrxPush) ?? null"
          [options]="(handleEditorOptions$ | ngrxPush) ?? null"
          (codeChange)="instructionBody = $event"
        ></bd-code-editor>

        <div class="w-full h-4">
          <ng-container *ngIf="connected$ | ngrxPush">
            <p
              *ngIf="
                instructionBody !== null &&
                instruction.data.body !== instructionBody
              "
              class="ml-2 mb-0 text-right"
            >
              <mat-icon inline color="accent">report</mat-icon>
              You have unsaved changes. Remember to
              <button
                class="text-accent underline"
                (click)="
                  onUpdateInstructionBody(
                    instruction.data.workspace,
                    instruction.data.application,
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
    InstructionArgumentsStore,
    InstructionArgumentQueryStore,
    InstructionAccountsStore,
    InstructionAccountQueryStore,
    InstructionRelationsStore,
    InstructionRelationQueryStore,
    CollectionsStore,
    ViewInstructionCodeEditorStore,
  ],
})
export class ViewInstructionCodeEditorComponent implements OnInit {
  @HostBinding('class') class =
    'flex flex-col px-8 pt-8 pb-4 bg-white bg-opacity-5 h-full';
  instructionBody: string | null = null;

  readonly connected$ = this._walletStore.connected$;
  readonly contextCode$ = this._viewInstructionCodeEditorStore.contextCode$;
  readonly contextEditorOptions$ =
    this._viewInstructionCodeEditorStore.contextEditorOptions$;
  readonly handleEditorOptions$ =
    this._viewInstructionCodeEditorStore.handleEditorOptions$;
  readonly handleCode$ = this._viewInstructionCodeEditorStore.handleCode$;
  readonly instruction$ = this._instructionStore.instruction$;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _walletStore: WalletStore,
    private readonly _instructionStore: InstructionStore,
    private readonly _viewInstructionCodeEditorStore: ViewInstructionCodeEditorStore
  ) {}

  ngOnInit() {
    this._viewInstructionCodeEditorStore.setInstructionId(
      this._route.paramMap.pipe(
        map((paramMap) => paramMap.get('instructionId'))
      )
    );
  }

  onUpdateInstructionBody(
    workspaceId: string,
    applicationId: string,
    instructionId: string,
    instructionBody: string
  ) {
    this._viewInstructionCodeEditorStore.updateInstructionBody({
      workspaceId,
      applicationId,
      instructionId,
      instructionBody,
    });
  }
}
