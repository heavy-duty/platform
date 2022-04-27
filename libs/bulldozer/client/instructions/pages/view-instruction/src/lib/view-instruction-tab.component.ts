import { Component, HostBinding, Input } from '@angular/core';
import { TabStore } from '@bulldozer-client/core-data-access';
import { InstructionStore } from '@bulldozer-client/instructions-data-access';
import { ViewInstructionStore } from './view-instruction.store';

@Component({
  selector: 'bd-view-instruction-tab',
  template: `
    <div
      *ngIf="instructionId$ | ngrxPush as instructionId"
      class="flex items-center p-0"
    >
      <div
        *ngIf="(loading$ | ngrxPush) === false; else loading"
        class="w-40 h-10 flex items-center"
      >
        <a
          [routerLink]="url"
          class="w-full h-full flex justify-between gap-2 items-center pl-4 flex-grow"
        >
          <ng-container
            *ngIf="instruction$ | ngrxPush as instruction; else notFound"
          >
            <span
              class="flex-grow text-left overflow-hidden whitespace-nowrap overflow-ellipsis"
              [matTooltip]="
                instruction.name
                  | bdItemUpdatingMessage: instruction:'Instruction'
              "
              matTooltipShowDelay="500"
            >
              {{ instruction.name }}
            </span>
            <span
              hdProgressSpinner
              *ngIf="instruction | bdItemChanging"
              class="flex-shrink-0 h-4 w-4 border-4 border-accent"
            ></span>
          </ng-container>

          <ng-template #notFound>
            <span class="m-0 pl-4">Not found</span>
          </ng-template>
        </a>
      </div>

      <ng-template #loading>
        <p class="w-full h-1/2 m-0 bg-white bg-opacity-10 animate-pulse"></p>
      </ng-template>

      <button
        mat-icon-button
        [attr.aria-label]="'Close ' + instructionId + ' tab'"
        (click)="onCloseTab(instructionId)"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  providers: [InstructionStore, ViewInstructionStore],
})
export class ViewInstructionTabComponent {
  @HostBinding('class') class = 'block w-full';

  @Input() url: string | null = null;
  @Input() set instructionId(value: string) {
    this._viewInstructionStore.setInstructionId(value);
  }

  readonly instructionId$ = this._viewInstructionStore.instructionId$;
  readonly instruction$ = this._viewInstructionStore.instruction$;
  readonly loading$ = this._instructionStore.loading$;

  constructor(
    private readonly _tabStore: TabStore,
    private readonly _instructionStore: InstructionStore,
    private readonly _viewInstructionStore: ViewInstructionStore
  ) {}

  onCloseTab(instructionId: string) {
    this._tabStore.closeTab(instructionId);
  }
}
