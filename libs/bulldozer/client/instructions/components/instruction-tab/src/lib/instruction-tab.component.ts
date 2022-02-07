import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { InstructionTabStore } from './instruction-tab.store';

@Component({
  selector: 'bd-instruction-tab',
  template: `
    <div
      *ngIf="instruction$ | ngrxPush as instruction"
      class="flex items-center justify-between p-0"
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
  providers: [InstructionTabStore],
})
export class InstructionTabComponent {
  @HostBinding('class') class = 'block w-full';
  @Input() set instructionId(value: string | null) {
    this._instructionTabStore.setInstructionId(value);
  }
  @Output() closeTab = new EventEmitter();
  readonly instruction$ = this._instructionTabStore.instruction$;

  constructor(private readonly _instructionTabStore: InstructionTabStore) {}

  onCloseTab() {
    this.closeTab.emit();
  }
}
