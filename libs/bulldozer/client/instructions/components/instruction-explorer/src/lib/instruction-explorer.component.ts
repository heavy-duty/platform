import { Component, Input } from '@angular/core';
import {
  InstructionQueryStore,
  InstructionsStore,
} from '@bulldozer-client/instructions-data-access';
import { InstructionExplorerStore } from './instruction-explorer.store';

@Component({
  selector: 'bd-instruction-explorer',
  template: `
    <mat-expansion-panel togglePosition="before">
      <mat-expansion-panel-header class="pl-6 pr-0">
        <div class="flex justify-between items-center flex-grow">
          <mat-panel-title> Instructions </mat-panel-title>
          <ng-container *ngIf="workspaceId$ | ngrxPush as workspaceId">
            <button
              *ngIf="applicationId$ | ngrxPush as applicationId"
              mat-icon-button
              [disabled]="!connected"
              aria-label="Create instruction"
              bdStopPropagation
              bdEditInstructionTrigger
              (editInstruction)="
                onCreateInstruction(workspaceId, applicationId, $event)
              "
            >
              <mat-icon>add</mat-icon>
            </button>
          </ng-container>
        </div>
      </mat-expansion-panel-header>
      <mat-nav-list dense>
        <mat-list-item
          *ngFor="let instruction of instructions$ | ngrxPush"
          class="pl-8 pr-0"
        >
          <a
            class="w-32 flex justify-between gap-2 items-center flex-grow m-0"
            matLine
            [routerLink]="[
              '/workspaces',
              instruction.document.data.workspace,
              'applications',
              instruction.document.data.application,
              'instructions',
              instruction.document.id
            ]"
            [matTooltip]="
              instruction.document.name
                | bdItemUpdatingMessage: instruction:'Instruction'
            "
            matTooltipShowDelay="500"
          >
            <span
              class="flex-grow text-left overflow-hidden whitespace-nowrap overflow-ellipsis"
            >
              {{ instruction.document.name }}
            </span>
            <mat-progress-spinner
              *ngIf="instruction | bdItemShowSpinner"
              class="flex-shrink-0"
              diameter="16"
              mode="indeterminate"
            ></mat-progress-spinner>
          </a>

          <button
            mat-icon-button
            [attr.aria-label]="
              'More options of ' + instruction.document.name + ' instruction'
            "
            [matMenuTriggerFor]="instructionOptionsMenu"
          >
            <mat-icon>more_horiz</mat-icon>
          </button>
          <mat-menu #instructionOptionsMenu="matMenu">
            <button
              mat-menu-item
              bdEditInstructionTrigger
              [instruction]="instruction.document"
              (editInstruction)="
                onUpdateInstruction(
                  instruction.document.data.workspace,
                  instruction.document.data.application,
                  instruction.document.id,
                  $event
                )
              "
              [disabled]="!connected"
            >
              <mat-icon>edit</mat-icon>
              <span>Edit instruction</span>
            </button>
            <button
              mat-menu-item
              (click)="
                onDeleteInstruction(
                  instruction.document.data.workspace,
                  instruction.document.data.application,
                  instruction.document.id
                )
              "
              [disabled]="!connected"
            >
              <mat-icon>delete</mat-icon>
              <span>Delete instruction</span>
            </button>
          </mat-menu>
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
  @Input() connected = false;

  @Input() set workspaceId(value: string) {
    this._instructionExplorerStore.setWorkspaceId(value);
  }
  @Input() set applicationId(value: string) {
    this._instructionExplorerStore.setApplicationId(value);
  }

  readonly workspaceId$ = this._instructionExplorerStore.workspaceId$;
  readonly applicationId$ = this._instructionExplorerStore.applicationId$;
  readonly instructions$ = this._instructionsStore.instructions$;

  constructor(
    private readonly _instructionExplorerStore: InstructionExplorerStore,
    private readonly _instructionsStore: InstructionsStore
  ) {}

  onCreateInstruction(
    workspaceId: string,
    applicationId: string,
    instructionName: string
  ) {
    this._instructionExplorerStore.createInstruction({
      workspaceId,
      applicationId,
      instructionName,
    });
  }

  onUpdateInstruction(
    workspaceId: string,
    applicationId: string,
    instructionId: string,
    instructionName: string
  ) {
    this._instructionExplorerStore.updateInstruction({
      workspaceId,
      applicationId,
      instructionId,
      instructionName,
    });
  }

  onDeleteInstruction(
    workspaceId: string,
    applicationId: string,
    instructionId: string
  ) {
    this._instructionExplorerStore.deleteInstruction({
      workspaceId,
      applicationId,
      instructionId,
    });
  }
}
