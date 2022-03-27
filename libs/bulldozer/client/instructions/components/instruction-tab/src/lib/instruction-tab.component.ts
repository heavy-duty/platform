import { Component, HostBinding, Input } from '@angular/core';
import { TabStore } from '@bulldozer-client/core-data-access';
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
          instruction.document.data.workspace,
          'applications',
          instruction.document.data.application,
          'instructions',
          instruction.document.id
        ]"
        class="w-40 flex justify-between gap-2 items-center pl-4 flex-grow"
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
          mode="indeterminate"
          diameter="16"
        ></mat-progress-spinner>
      </a>
      <button
        mat-icon-button
        [attr.aria-label]="'Close ' + instruction.document.name + ' tab'"
        (click)="onCloseTab(instruction.document.id)"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  providers: [InstructionStore, InstructionTabStore],
})
export class InstructionTabComponent {
  @HostBinding('class') class = 'block w-full';

  @Input() set instructionId(value: string) {
    this._instructionTabStore.setInstructionId(value);
  }

  readonly instruction$ = this._instructionStore.instruction$;

  constructor(
    private readonly _tabStore: TabStore,
    private readonly _instructionStore: InstructionStore,
    private readonly _instructionTabStore: InstructionTabStore
  ) {}

  onCloseTab(instructionId: string) {
    this._tabStore.closeTab(instructionId);
  }
}
