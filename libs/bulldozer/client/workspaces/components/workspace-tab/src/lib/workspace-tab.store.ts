import { Injectable } from '@angular/core';
import { TabStore } from '@bulldozer-client/core-data-access';
import {
  InstructionStatus,
  WorkspaceInstructionsStore,
  WorkspaceStore,
} from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { combineLatest, concatMap, filter, from, pipe, tap } from 'rxjs';

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
    workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._workspaceStore.setWorkspaceId(this.workspaceId$);
    this._handleWorkspaceDeleted(
      combineLatest({
        workspaceId: this.workspaceId$.pipe(isNotNullOrUndefined),
        instructionStatus:
          workspaceInstructionsStore.lastInstructionStatus$.pipe(
            isNotNullOrUndefined
          ),
      })
    );
    this._handleWorkspaceInstructions(
      combineLatest({
        workspaceId: this.workspaceId$.pipe(isNotNullOrUndefined),
        instructionStatuses: workspaceInstructionsStore.instructionStatuses$,
      })
    );
    this._handleLastWorkspaceInstruction(
      combineLatest({
        workspaceId: this.workspaceId$.pipe(isNotNullOrUndefined),
        instructionStatus:
          workspaceInstructionsStore.lastInstructionStatus$.pipe(
            isNotNullOrUndefined
          ),
      })
    );
  }

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({ ...state, workspaceId })
  );

  private readonly _handleWorkspaceInstructions = this.effect<{
    workspaceId: string;
    instructionStatuses: InstructionStatus[];
  }>(
    concatMap(({ workspaceId, instructionStatuses }) =>
      from(instructionStatuses).pipe(
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

  private readonly _handleLastWorkspaceInstruction = this.effect<{
    workspaceId: string;
    instructionStatus: InstructionStatus;
  }>(
    pipe(
      filter(
        ({ workspaceId, instructionStatus }) =>
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
      tap(({ instructionStatus }) =>
        this._workspaceStore.handleWorkspaceInstruction(instructionStatus)
      )
    )
  );

  private readonly _handleWorkspaceDeleted = this.effect<{
    workspaceId: string;
    instructionStatus: InstructionStatus;
  }>(
    pipe(
      filter(
        ({ workspaceId, instructionStatus }) =>
          instructionStatus.name === 'deleteWorkspace' &&
          instructionStatus.status === 'finalized' &&
          instructionStatus.accounts.some(
            (account) =>
              account.name === 'Workspace' && account.pubkey === workspaceId
          )
      ),
      tap(({ workspaceId }) => this._tabStore.closeTab(workspaceId))
    )
  );
}
