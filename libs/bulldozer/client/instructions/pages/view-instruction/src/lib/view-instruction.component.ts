import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { Document, Instruction } from '@heavy-duty/bulldozer-devkit';
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
            [applicationId]="instruction.data.application"
            [instructionId]="instruction.id"
            [connected]="(connected$ | ngrxPush) ?? false"
          ></bd-instruction-arguments-list>
          <bd-instruction-documents-list
            class="block mb-4"
            [applicationId]="instruction.data.application"
            [instructionId]="instruction.id"
            [connected]="(connected$ | ngrxPush) ?? false"
          >
          </bd-instruction-documents-list>
          <bd-instruction-signers-list
            class="block"
            [applicationId]="instruction.data.application"
            [instructionId]="instruction.id"
            [connected]="(connected$ | ngrxPush) ?? false"
          >
          </bd-instruction-signers-list>
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
  readonly commonEditorOptions = this._viewInstructionStore.commonEditorOptions;
  readonly contextEditorOptions$ =
    this._viewInstructionStore.contextEditorOptions$;
  readonly handlerEditorOptions$ =
    this._viewInstructionStore.handlerEditorOptions$;

  constructor(private readonly _viewInstructionStore: ViewInstructionStore) {}

  onUpdateInstructionBody(instruction: Document<Instruction>) {
    this._viewInstructionStore.updateInstructionBody({
      instruction,
      instructionBody: this.instructionBody,
    });
  }
}
