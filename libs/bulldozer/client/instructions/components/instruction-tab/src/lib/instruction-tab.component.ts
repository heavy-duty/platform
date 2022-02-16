import { Component, HostBinding, Input } from '@angular/core';
import { InstructionStore } from '@bulldozer-client/instructions-data-access';
import { InstructionTabStore } from './instruction-tab.store';

@Component({
  selector: 'bd-instruction-tab',
  template: `
    <div
      *ngIf="instruction$ | ngrxPush as instruction"
      class="flex items-stretch p-0"
    >
      <a
        [routerLink]="[
          '/workspaces',
          instruction.data.workspace,
          'applications',
          instruction.data.application,
          'instructions',
          instruction.id
        ]"
        class="flex items-center pl-4 flex-grow"
      >
        {{ instruction.name }}
      </a>
      <button
        mat-icon-button
        [attr.aria-label]="'Close ' + instruction.name + ' tab'"
        (click)="onCloseTab()"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  providers: [InstructionStore, InstructionTabStore],
})
export class InstructionTabComponent {
  @HostBinding('class') class = 'block w-full';

  private _instructionId!: string;
  @Input() set instructionId(value: string) {
    this._instructionId = value;
    this._instructionStore.setInstructionId(value);
  }
  get instructionId() {
    return this._instructionId;
  }

  readonly instruction$ = this._instructionStore.instruction$;

  constructor(
    private readonly _instructionStore: InstructionStore,
    private readonly _instructionTabStore: InstructionTabStore
  ) {}

  onCloseTab() {
    this._instructionTabStore.closeTab(this.instructionId);
  }
}
