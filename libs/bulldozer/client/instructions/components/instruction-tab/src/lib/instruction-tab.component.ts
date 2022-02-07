import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { filter, first, pairwise } from 'rxjs';
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
  providers: [InstructionTabStore],
})
export class InstructionTabComponent implements OnInit {
  @HostBinding('class') class = 'block w-full';
  @Input() set instructionId(value: string | null) {
    this._instructionTabStore.setInstructionId(value);
  }
  @Output() closeTab = new EventEmitter();
  readonly instruction$ = this._instructionTabStore.instruction$;

  constructor(private readonly _instructionTabStore: InstructionTabStore) {}

  ngOnInit() {
    this.instruction$
      .pipe(
        pairwise(),
        filter(([, instruction]) => instruction === null),
        first()
      )
      .subscribe(() => this.onCloseTab());
  }

  onCloseTab() {
    this.closeTab.emit();
  }
}
