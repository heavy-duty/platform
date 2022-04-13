import { Injectable } from '@angular/core';
import { TabStore } from '@bulldozer-client/core-data-access';
import { UserInstructionsStore } from '@bulldozer-client/users-data-access';
import {
  WorkspaceInstructionsStore,
  WorkspaceStore,
} from '@bulldozer-client/workspaces-data-access';
import { ComponentStore } from '@ngrx/component-store';

interface ViewModel {
  workspaceId: string | null;
}

const initialState: ViewModel = {
  workspaceId: null,
};

@Injectable()
export class WorkspaceTabStore extends ComponentStore<ViewModel> {
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);

  constructor(
    private readonly _tabStore: TabStore,
    private readonly _workspaceStore: WorkspaceStore,
    userInstructionsStore: UserInstructionsStore,
    workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._workspaceStore.setWorkspaceId(this.workspaceId$);
    /* this._handleInstruction(
      this.workspaceId$.pipe(
        isNotNullOrUndefined,
        switchMap((workspaceId) =>
          workspaceInstructionsStore.instruction$.pipe(
            filter((instruction) =>
              instruction.accounts.some(
                (account) =>
                  account.name === 'Workspace' && account.pubkey === workspaceId
              )
            )
          )
        )
      )
    );
    this._handleWorkspaceDeleted(
      this.select(
        this.workspaceId$.pipe(isNotNullOrUndefined),
        workspaceInstructionsStore.instruction$.pipe(
          filter(
            (instruction) =>
              instruction.name === 'deleteWorkspace' &&
              instruction.status === 'finalized'
          )
        ),
        (workspaceId, instructionStatus) => ({
          workspaceId,
          instructionStatus,
        })
      ).pipe(
        filter(({ workspaceId, instructionStatus }) =>
          instructionStatus.accounts.some(
            (account) =>
              account.name === 'Workspace' && account.pubkey === workspaceId
          )
        )
      )
    );
    this._handleWorkspaceCreated(
      this.select(
        this.workspaceId$.pipe(isNotNullOrUndefined),
        userInstructionsStore.instruction$.pipe(
          filter((instruction) => instruction.name === 'createWorkspace')
        ),
        (workspaceId, instructionStatus) => ({
          workspaceId,
          instructionStatus,
        })
      ).pipe(
        filter(({ workspaceId, instructionStatus }) =>
          instructionStatus.accounts.some(
            (account) =>
              account.name === 'Workspace' && account.pubkey === workspaceId
          )
        ),
        map(({ instructionStatus }) => instructionStatus)
      )
    ); */
  }

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({ ...state, workspaceId })
  );

  /* private readonly _handleInstruction = this.effect<InstructionStatus>(
    tap((instructionStatus) => {
      switch (instructionStatus.name) {
        case 'updateWorkspace':
        case 'deleteWorkspace': {
          this._workspaceStore.dispatch(instructionStatus);
          break;
        }
        default:
          break;
      }
    })
  );

  private readonly _handleWorkspaceCreated = this.effect<InstructionStatus>(
    tap((instructionStatus) => this._workspaceStore.dispatch(instructionStatus))
  );

  private readonly _handleWorkspaceDeleted = this.effect<{
    workspaceId: string;
    instructionStatus: InstructionStatus;
  }>(tap(({ workspaceId }) => this._tabStore.closeTab(workspaceId))); */
}
