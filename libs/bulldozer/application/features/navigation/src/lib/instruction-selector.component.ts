import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Instruction } from '@heavy-duty/bulldozer/application/utils/types';

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
              (click)="onDeleteInstruction(instruction.id)"
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
  @Input() instructions?: Instruction[] | null = null;
  @Output() createInstruction = new EventEmitter();
  @Output() updateInstruction = new EventEmitter<Instruction>();
  @Output() deleteInstruction = new EventEmitter<string>();

  onCreateInstruction(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.createInstruction.emit();
  }

  onEditInstruction(instruction: Instruction) {
    this.updateInstruction.emit(instruction);
  }

  onDeleteInstruction(instructionId: string) {
    this.deleteInstruction.emit(instructionId);
  }
}
