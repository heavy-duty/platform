import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { UserInstructionsStore } from '@bulldozer-client/users-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { HdSolanaConfigStore } from '@heavy-duty/ngx-solana';
import { isNotNullOrUndefined, LocalStorageSubject } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import {
  concatMap,
  distinctUntilChanged,
  filter,
  map,
  merge,
  of,
  pairwise,
  pipe,
  tap,
  withLatestFrom,
} from 'rxjs';

interface ViewModel {
  workspaceId: string | null;
  isHandset: boolean;
}

const initialState: ViewModel = {
  workspaceId: null,
  isHandset: false,
};

@Injectable()
export class ConfigStore extends ComponentStore<ViewModel> {
  private readonly _workspaceId = new LocalStorageSubject<string>(
    'workspaceId'
  );
  readonly isHandset$ = this.select(({ isHandset }) => isHandset);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);

  constructor(
    private readonly _breakpointObserver: BreakpointObserver,
    private readonly _hdSolanaConfigStore: HdSolanaConfigStore,
    private readonly _userInstructionsStore: UserInstructionsStore,
    private readonly _workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._loadHandset(this._breakpointObserver.observe(Breakpoints.Handset));
    this._loadWorkspaceId(this._workspaceId.asObservable());
    this._handleNetworkChanges(this._hdSolanaConfigStore.selectedNetwork$);
    this._removeActiveWorkspaceOnDelete(
      merge(
        this._workspaceInstructionsStore.lastInstructionStatus$,
        this._userInstructionsStore.lastInstructionStatus$
      ).pipe(
        isNotNullOrUndefined,
        filter(
          (instructionStatus) =>
            instructionStatus.name === 'deleteWorkspace' &&
            instructionStatus.status === 'finalized'
        ),
        map(
          (instructionStatus) =>
            instructionStatus.accounts.find(
              (account) => account.name === 'Workspace'
            )?.pubkey ?? null
        ),
        isNotNullOrUndefined
      )
    );
  }

  private readonly _removeActiveWorkspaceOnDelete = this.effect<string>(
    pipe(
      concatMap((workspaceDeletedId) =>
        of(workspaceDeletedId).pipe(withLatestFrom(this.workspaceId$))
      ),
      filter(
        ([activeWorkspaceId, workspaceDeletedId]) =>
          activeWorkspaceId === workspaceDeletedId
      ),
      tap(() => this._workspaceId.next(null))
    )
  );

  private readonly _loadHandset = this.updater<BreakpointState>(
    (state, result) => ({
      ...state,
      isHandset: result.matches,
    })
  );

  private readonly _loadWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({ ...state, workspaceId })
  );

  private readonly _handleNetworkChanges = this.effect(
    pipe(
      distinctUntilChanged(),
      pairwise(),
      tap(() =>
        this.patchState({
          workspaceId: null,
        })
      )
    )
  );

  setWorkspaceId(workspaceId: string) {
    const currentWorkspaceId = this._workspaceId.getValue();

    if (currentWorkspaceId !== workspaceId) {
      this._workspaceId.next(workspaceId);
    }
  }
}
