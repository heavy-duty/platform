import { Component, Input } from '@angular/core';
import { InstructionExplorerStore } from './instruction-explorer.store';

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
            (editInstruction)="onCreateInstruction($event)"
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
              (editInstruction)="onUpdateInstruction(instruction.id, $event)"
              [disabled]="!connected"
            >
              <mat-icon>edit</mat-icon>
              <span>Edit instruction</span>
            </button>
            <button
              mat-menu-item
              (click)="onDeleteInstruction(instruction.id)"
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
  providers: [InstructionExplorerStore],
})
export class InstructionExplorerComponent {
  @Input() connected = false;
  @Input() set applicationId(value: string | null) {
    this._instructionExplorerStore.setApplicationId(value);
  }
  @Input() set workspaceId(value: string | null) {
    this._instructionExplorerStore.setWorkspaceId(value);
  }
  readonly applicationId$ = this._instructionExplorerStore.applicationId$;
  readonly instructions$ = this._instructionExplorerStore.instructions$;

  constructor(
    private readonly _instructionExplorerStore: InstructionExplorerStore
  ) {}

  onCreateInstruction(name: string) {
    this._instructionExplorerStore.createInstruction({
      instructionName: name,
    });
  }

  onUpdateInstruction(instructionId: string, instructionName: string) {
    this._instructionExplorerStore.updateInstruction({
      instructionId,
      instructionName,
    });
  }

  onDeleteInstruction(instructionId: string) {
    this._instructionExplorerStore.deleteInstruction({
      instructionId,
    });
  }
}
