import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { WorkspaceEventService } from '@bulldozer-client/workspaces-data-access';
import { HdSolanaConfigStore } from '@heavy-duty/ngx-solana';
import { LocalStorageSubject } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { PublicKey } from '@solana/web3.js';
import {
  distinctUntilChanged,
  EMPTY,
  pairwise,
  pipe,
  switchMap,
  tap,
} from 'rxjs';

interface ViewModel {
  workspaceIds: string[] | null;
  workspaceId: string | null;
  isHandset: boolean;
}

const initialState: ViewModel = {
  workspaceIds: null,
  workspaceId: null,
  isHandset: false,
};

@Injectable()
export class ConfigStore extends ComponentStore<ViewModel> {
  private readonly _workspaceId = new LocalStorageSubject<string>(
    'workspaceId'
  );
  private readonly _loadedWorkspaces = new LocalStorageSubject<string[]>(
    'loadedWorkspaces'
  );
  readonly isHandset$ = this.select(({ isHandset }) => isHandset);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly workspaceIds$ = this.select(({ workspaceIds }) => workspaceIds);

  constructor(
    private readonly _breakpointObserver: BreakpointObserver,
    private readonly _hdSolanaConfigStore: HdSolanaConfigStore,
    private readonly _workspaceEventService: WorkspaceEventService,
    private readonly _walletStore: WalletStore
  ) {
    super(initialState);

    this._loadHandset(this._breakpointObserver.observe(Breakpoints.Handset));
    this._loadWorkspaceId(this._workspaceId.asObservable());
    this._loadWorkspaces(this._loadedWorkspaces.asObservable());
    this._handleNetworkChanges(this._hdSolanaConfigStore.selectedNetwork$);
    this._handleWorkspaceCreated(this._walletStore.publicKey$);
    this._handleWorkspaceRemoved(
      this.select(
        this.workspaceId$,
        this.workspaceIds$,
        (workspaceId, workspaceIds) => ({ workspaceId, workspaceIds })
      )
    );
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

  private readonly _loadWorkspaces = this.updater<string[] | null>(
    (state, workspaceIds) => ({ ...state, workspaceIds })
  );

  private readonly _handleWorkspaceRemoved = this.effect<{
    workspaceId: string | null;
    workspaceIds: string[] | null;
  }>(
    tap(({ workspaceId, workspaceIds }) => {
      if (
        workspaceId !== null &&
        workspaceIds !== null &&
        !workspaceIds.some((id) => id === workspaceId)
      ) {
        this.setWorkspaceId(null);
      }
    })
  );

  private readonly _handleNetworkChanges = this.effect(
    pipe(
      distinctUntilChanged(),
      pairwise(),
      tap(() =>
        this.patchState({
          workspaceId: null,
          workspaceIds: null,
        })
      )
    )
  );

  private readonly _handleWorkspaceCreated = this.effect<PublicKey | null>(
    switchMap((walletPublicKey) => {
      if (walletPublicKey === null) {
        return EMPTY;
      }

      return this._workspaceEventService
        .workspaceCreated({
          authority: walletPublicKey.toBase58(),
        })
        .pipe(tap((workspace) => this.addWorkspace(workspace.id)));
    })
  );

  setWorkspaceId(workspaceId: string | null) {
    this._workspaceId.next(workspaceId);
  }

  addWorkspace(workspaceId: string) {
    const { workspaceIds } = this.get();

    if (workspaceIds === null) {
      this._loadedWorkspaces.next([workspaceId]);
    } else {
      this._loadedWorkspaces.next([...new Set([...workspaceIds, workspaceId])]);
    }
  }

  removeWorkspace(workspaceId: string) {
    const { workspaceIds } = this.get();

    if (workspaceIds !== null) {
      this._loadedWorkspaces.next(
        workspaceIds.filter(
          (loadedWorkspaceId) => loadedWorkspaceId !== workspaceId
        )
      );
    }
  }
}
