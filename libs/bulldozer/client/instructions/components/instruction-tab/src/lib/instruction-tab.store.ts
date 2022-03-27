import { Injectable } from '@angular/core';
import { TabStore } from '@bulldozer-client/core-data-access';
import { InstructionStore } from '@bulldozer-client/instructions-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { filter, switchMap, tap } from 'rxjs';

interface ViewModel {
  instructionId: string | null;
}

const initialState: ViewModel = {
  instructionId: null,
};

@Injectable()
export class InstructionTabStore extends ComponentStore<ViewModel> {
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);

  constructor(
    private readonly _tabStore: TabStore,
    private readonly _instructionStore: InstructionStore,
    workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._instructionStore.setInstructionId(this.instructionId$);
    this._handleInstruction(
      this.instructionId$.pipe(
        isNotNullOrUndefined,
        switchMap((instructionId) =>
          workspaceInstructionsStore.instruction$.pipe(
            filter((instruction) =>
              instruction.accounts.some(
                (account) =>
                  account.name === 'Instruction' &&
                  account.pubkey === instructionId
              )
            )
          )
        )
      )
    );
    this._handleInstructionDeleted(
      this.select(
        this.instructionId$.pipe(isNotNullOrUndefined),
        workspaceInstructionsStore.instruction$.pipe(
          filter(
            (instruction) =>
              instruction.name === 'deleteInstruction' &&
              instruction.status === 'finalized'
          )
        ),
        (instructionId, instructionStatus) => ({
          instructionId,
          instructionStatus,
        })
      ).pipe(
        filter(({ instructionId, instructionStatus }) =>
          instructionStatus.accounts.some(
            (account) =>
              account.name === 'Instruction' && account.pubkey === instructionId
          )
        )
      )
    );
  }

  readonly setInstructionId = this.updater<string | null>(
    (state, instructionId) => ({ ...state, instructionId })
  );

  private readonly _handleInstruction = this.effect<InstructionStatus>(
    tap((instructionStatus) => {
      switch (instructionStatus.name) {
        case 'createInstruction':
        case 'updateInstruction':
        case 'deleteInstruction': {
          this._instructionStore.dispatch(instructionStatus);
          break;
        }
        default:
          break;
      }
    })
  );

  private readonly _handleInstructionDeleted = this.effect<{
    instructionId: string;
    instructionStatus: InstructionStatus;
  }>(tap(({ instructionId }) => this._tabStore.closeTab(instructionId)));
}
