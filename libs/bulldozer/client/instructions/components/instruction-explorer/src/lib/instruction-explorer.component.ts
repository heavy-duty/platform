import { Component, Input } from '@angular/core';
import { InstructionStore } from '@heavy-duty/bulldozer-store';
import { InstructionExplorerStore } from './instruction-explorer.store';

@Component({
  selector: 'bd-instruction-explorer',
  template: `
    <mat-expansion-panel
      togglePosition="before"
      *ngIf="applicationId$ | ngrxPush as applicationId"
    >
      <mat-expansion-panel-header class="pl-6 pr-0">
        <div class="flex justify-between items-center flex-grow">
          <mat-panel-title> Instructions </mat-panel-title>
          <button
            mat-icon-button
            [disabled]="!connected"
            aria-label="Create instruction"
            bdStopPropagation
            bdEditInstructionTrigger
            (editInstruction)="onCreateInstruction(applicationId, $event)"
          >
            <mat-icon>add</mat-icon>
          </button>
        </div>
      </mat-expansion-panel-header>
      <mat-nav-list dense>
        <mat-list-item *ngFor="let instruction of instructions$ | ngrxPush">
          <a
            class="pl-8 pr-0"
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
              (editInstruction)="onUpdateInstruction(applicationId, $event)"
              [disabled]="!connected"
            >
              <mat-icon>edit</mat-icon>
              <span>Edit instruction</span>
            </button>
            <button
              mat-menu-item
              (click)="onDeleteInstruction(applicationId, instruction.id)"
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
  @Input() set applicationId(value: string | undefined) {
    this._instructionExplorerStore.setApplicationId(value);
  }
  readonly applicationId$ = this._instructionExplorerStore.applicationId$;
  readonly instructions$ = this._instructionExplorerStore.instructions$;

  constructor(
    private readonly _instructionStore: InstructionStore,
    private readonly _instructionExplorerStore: InstructionExplorerStore
  ) {}

  onCreateInstruction(applicationId: string, instructionName: string) {
    this._instructionStore.createInstruction({
      applicationId,
      instructionName,
    });
  }

  onUpdateInstruction(instructionId: string, instructionName: string) {
    this._instructionStore.updateInstruction({
      instructionId,
      instructionName,
    });
  }

  onDeleteInstruction(applicationId: string, instructionId: string) {
    this._instructionStore.deleteInstruction({ applicationId, instructionId });
  }
}
