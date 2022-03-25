import { Injectable } from '@angular/core';
import { TabStore } from '@bulldozer-client/core-data-access';
import { UserInstructionsStore } from '@bulldozer-client/users-data-access';
import {
  WorkspaceInstructionsStore,
  WorkspaceStore,
  WorkspaceView,
} from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import {
  concatMap,
  filter,
  from,
  merge,
  pairwise,
  pipe,
  switchMap,
  take,
  tap,
} from 'rxjs';

@Injectable()
export class WorkspaceTabStore extends ComponentStore<object> {
  constructor(
    private readonly _tabStore: TabStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _workspaceInstructionsStore: WorkspaceInstructionsStore,
    private readonly _userInstructionsStore: UserInstructionsStore
  ) {
    super({});

    this._handleWorkspaceDeleted(this._workspaceStore.workspace$);
    this._watchWorkspace(this._workspaceStore.workspaceId$);
  }

  private readonly _watchWorkspace = this.effect<string | null>(
    switchMap((workspaceId) =>
      merge(
        this._workspaceInstructionsStore.instructionStatuses$.pipe(
          take(1),
          concatMap((instructionStatuses) => from(instructionStatuses))
        ),
        this._workspaceInstructionsStore.lastInstructionStatus$.pipe(
          isNotNullOrUndefined
        ),
        this._userInstructionsStore.instructionStatuses$.pipe(
          take(1),
          concatMap((instructionStatuses) => from(instructionStatuses))
        ),
        this._userInstructionsStore.lastInstructionStatus$.pipe(
          isNotNullOrUndefined
        )
      ).pipe(
        filter(
          (instructionStatus) =>
            (instructionStatus.name === 'createWorkspace' ||
              instructionStatus.name === 'updateWorkspace' ||
              instructionStatus.name === 'deleteWorkspace') &&
            (instructionStatus.status === 'confirmed' ||
              instructionStatus.status === 'finalized') &&
            instructionStatus.accounts.some(
              (account) =>
                account.name === 'Workspace' && account.pubkey === workspaceId
            )
        ),
        tap((workspaceInstruction) =>
          this._workspaceStore.handleWorkspaceInstruction(workspaceInstruction)
        )
      )
    )
  );

  private readonly _handleWorkspaceDeleted = this.effect<WorkspaceView | null>(
    pipe(
      pairwise(),
      filter(
        ([previousWorkspace, currentWorkspace]) =>
          previousWorkspace !== null && currentWorkspace === null
      ),
      tap(([workspace]) => {
        if (workspace !== null) {
          this._tabStore.closeTab(workspace.document.id);
        }
      })
    )
  );

  closeTab(tabId: string) {
    this._tabStore.closeTab(tabId);
  }
}
