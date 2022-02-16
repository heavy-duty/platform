import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { HdSolanaConfigStore } from '@heavy-duty/ngx-solana';
import { LocalStorageSubject } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { distinctUntilChanged, pairwise, pipe, tap } from 'rxjs';

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
    private readonly _hdSolanaConfigStore: HdSolanaConfigStore
  ) {
    super(initialState);

    this._loadHandset(this._breakpointObserver.observe(Breakpoints.Handset));
    this._loadWorkspaceId(this._workspaceId.asObservable());
    this._handleNetworkChanges(this._hdSolanaConfigStore.selectedNetwork$);
  }

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
      tap(() => this.setWorkspaceId(null))
    )
  );

  setWorkspaceId(workspaceId: string | null) {
    this._workspaceId.next(workspaceId);
  }
}
