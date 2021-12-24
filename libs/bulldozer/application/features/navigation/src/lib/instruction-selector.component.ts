import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InstructionExtended } from '@heavy-duty/bulldozer/application/utils/types';

@Component({
  selector: 'bd-instruction-selector',
  template: `
    <mat-expansion-panel>
      <mat-expansion-panel-header>
        <div class="flex justify-between items-center flex-grow">
          <mat-panel-title> Instructions </mat-panel-title>
          <button
            mat-icon-button
            [disabled]="connected === false"
            aria-label="Create instruction"
            (click)="onCreateInstruction($event)"
          >
            <mat-icon>add</mat-icon>
          </button>
        </div>
      </mat-expansion-panel-header>
      <mat-nav-list dense>
        <mat-list-item *ngFor="let instruction of instructions">
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
            [matTooltip]="instruction.data.name"
            matTooltipShowDelay="500"
          >
            {{ instruction.data.name }}
          </a>

          <button
            mat-icon-button
            [attr.aria-label]="
              'More options of ' + instruction.data.name + ' instruction'
            "
            [matMenuTriggerFor]="instructionOptionsMenu"
          >
            <mat-icon>more_horiz</mat-icon>
          </button>
          <mat-menu #instructionOptionsMenu="matMenu">
            <button
              mat-menu-item
              (click)="onEditInstruction(instruction)"
              [disabled]="connected === false"
            >
              <mat-icon>edit</mat-icon>
              <span>Edit instruction</span>
            </button>
            <button
              mat-menu-item
              (click)="onDeleteInstruction(instruction)"
              [disabled]="connected === false"
            >
              <mat-icon>delete</mat-icon>
              <span>Delete instruction</span>
            </button>
          </mat-menu>
        </mat-list-item>
      </mat-nav-list>
    </mat-expansion-panel>
  `,
})
export class InstructionSelectorComponent {
  @Input() connected?: boolean | null = null;
  @Input() instructions?: InstructionExtended[] | null = null;
  @Output() createInstruction = new EventEmitter();
  @Output() updateInstruction = new EventEmitter<InstructionExtended>();
  @Output() deleteInstruction = new EventEmitter<InstructionExtended>();

  onCreateInstruction(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.createInstruction.emit();
  }

  onEditInstruction(instruction: InstructionExtended) {
    this.updateInstruction.emit(instruction);
  }

  onDeleteInstruction(instruction: InstructionExtended) {
    this.deleteInstruction.emit(instruction);
  }
}
