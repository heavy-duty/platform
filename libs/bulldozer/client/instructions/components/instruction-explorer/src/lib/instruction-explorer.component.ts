import { Component, Input } from '@angular/core';
import { Document, Instruction } from '@heavy-duty/bulldozer-devkit';
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
            (click)="onCreateInstruction(applicationId)"
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
              (click)="onEditInstruction(instruction)"
              [disabled]="!connected"
            >
              <mat-icon>edit</mat-icon>
              <span>Edit instruction</span>
            </button>
            <button
              mat-menu-item
              (click)="onDeleteInstruction(instruction)"
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

  constructor(private _instructionExplorerStore: InstructionExplorerStore) {}

  onCreateInstruction(applicationId: string) {
    this._instructionExplorerStore.createInstruction({ applicationId });
  }

  onEditInstruction(instruction: Document<Instruction>) {
    this._instructionExplorerStore.updateInstruction({ instruction });
  }

  onDeleteInstruction(instruction: Document<Instruction>) {
    this._instructionExplorerStore.deleteInstruction({ instruction });
  }
}
