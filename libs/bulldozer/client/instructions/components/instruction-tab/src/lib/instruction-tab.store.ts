import { Injectable } from '@angular/core';
import { TabStore } from '@bulldozer-client/core-data-access';
import { InstructionStore } from '@bulldozer-client/instructions-data-access';
import { Document, Instruction } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore } from '@ngrx/component-store';
import { filter, pairwise, pipe, tap } from 'rxjs';

@Injectable()
export class InstructionTabStore extends ComponentStore<object> {
  constructor(
    private readonly _tabStore: TabStore,
    instructionStore: InstructionStore
  ) {
    super({});

    this._handleInstructionDeleted(instructionStore.instruction$);
  }

  private readonly _handleInstructionDeleted =
    this.effect<Document<Instruction> | null>(
      pipe(
        pairwise(),
        filter(
          ([previousInstruction, currentInstruction]) =>
            previousInstruction !== null && currentInstruction === null
        ),
        tap(([instruction]) => {
          if (instruction !== null) {
            this._tabStore.closeTab(instruction.id);
          }
        })
      )
    );

  closeTab(tabId: string) {
    this._tabStore.closeTab(tabId);
  }
}
