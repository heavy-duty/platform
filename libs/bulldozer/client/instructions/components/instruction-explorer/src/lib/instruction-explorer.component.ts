import { Component, Input } from '@angular/core';
import { InstructionsStore } from '@bulldozer-client/instructions-data-access';

@Component({
  selector: 'bd-instruction-explorer',
  template: `
    <mat-expansion-panel togglePosition="before">
      <mat-expansion-panel-header class="pl-6 pr-0">
        <div class="flex justify-between items-center flex-grow">
          <mat-panel-title> Instructions </mat-panel-title>
          <button
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
        </div>
      </mat-expansion-panel-header>
      <mat-nav-list dense>
        <mat-list-item
          *ngFor="let instruction of instructions$ | ngrxPush"
          class="pl-8 pr-0"
        >
          <a
            matLine
            [routerLink]="[
              '/workspaces',
              instruction.data.workspace,
              'applications',
              instruction.data.application,
              'instructions',
              instruction.id
            ]"
            [matTooltip]="instruction.name"
            matTooltipShowDelay="500"
          >
            {{ instruction.name }}
          </a>

          <button
            mat-icon-button
            [attr.aria-label]="
              'More options of ' + instruction.name + ' instruction'
            "
            [matMenuTriggerFor]="instructionOptionsMenu"
          >
            <mat-icon>more_horiz</mat-icon>
          </button>
          <mat-menu #instructionOptionsMenu="matMenu">
            <button
              mat-menu-item
              bdEditInstructionTrigger
              [instruction]="instruction"
              (editInstruction)="
                onUpdateInstruction(
                  instruction.data.workspace,
                  instruction.id,
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
                  instruction.data.workspace,
                  instruction.data.application,
                  instruction.id
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
  providers: [InstructionsStore],
})
export class InstructionExplorerComponent {
  @Input() connected = false;

  private _workspaceId!: string;
  @Input() set workspaceId(value: string) {
    this._workspaceId = value;
  }
  get workspaceId() {
    return this._workspaceId;
  }

  private _applicationId!: string;
  @Input() set applicationId(value: string) {
    this._applicationId = value;
    this._instructionsStore.setFilters({
      application: this.applicationId,
    });
  }
  get applicationId() {
    return this._applicationId;
  }

  readonly instructions$ = this._instructionsStore.instructions$;

  constructor(private readonly _instructionsStore: InstructionsStore) {}

  onCreateInstruction(
    workspaceId: string,
    applicationId: string,
    instructionName: string
  ) {
    this._instructionsStore.createInstruction({
      workspaceId,
      applicationId,
      instructionName,
    });
  }

  onUpdateInstruction(
    workspaceId: string,
    instructionId: string,
    instructionName: string
  ) {
    this._instructionsStore.updateInstruction({
      workspaceId,
      instructionId,
      instructionName,
    });
  }

  onDeleteInstruction(
    workspaceId: string,
    applicationId: string,
    instructionId: string
  ) {
    this._instructionsStore.deleteInstruction({
      workspaceId,
      applicationId,
      instructionId,
    });
  }
}
