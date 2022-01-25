import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ApplicationStore,
  CollectionAttributeStore,
  CollectionStore,
  InstructionAccountStore,
  InstructionArgumentStore,
  InstructionRelationStore,
  InstructionStore,
  WorkspaceStore,
} from '@heavy-duty/bulldozer-store';
import {
  NotificationStore,
  TabStore,
} from '@heavy-duty/bulldozer/application/data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rx-solana';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { Subject, tap } from 'rxjs';

interface ViewModel {
  isHandset: boolean;
}

const initialState: ViewModel = {
  isHandset: false,
};

@Injectable()
export class ShellStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  readonly isHandset$ = this.select(({ isHandset }) => isHandset);
  readonly tabs$ = this._tabStore.tabs$;
  readonly selectedTab$ = this._tabStore.selected$;
  readonly connected$ = this._walletStore.connected$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _tabStore: TabStore,
    private readonly _matSnackBar: MatSnackBar,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _applicationStore: ApplicationStore,
    private readonly _collectionStore: CollectionStore,
    private readonly _collectionAttributeStore: CollectionAttributeStore,
    private readonly _instructionStore: InstructionStore,
    private readonly _instructionArgumentStore: InstructionArgumentStore,
    private readonly _instructionAccountStore: InstructionAccountStore,
    private readonly _instructionRelationStore: InstructionRelationStore,
    private readonly _breakpointObserver: BreakpointObserver,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);
  }

  readonly loadHandset = this.effect(() =>
    this._breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(tap((result) => this.patchState({ isHandset: result.matches })))
  );

  readonly notifyErrors = this.effect(() =>
    this._notificationStore.error$.pipe(
      isNotNullOrUndefined,
      tap((error) =>
        this._matSnackBar.open(error, 'Close', {
          panelClass: `error-snackbar`,
        })
      )
    )
  );

  /* readonly notifyWorkspaceSuccess = this.effect(() =>
    this._workspaceStore.events$.pipe(
      filter((event) => event.type !== WorkspaceActionTypes.WorkspaceInit),
      tap((event) => {
        this._workspaceStore.reload();
        this._matSnackBar.open(event.type, 'Close', {
          panelClass: `success-snackbar`,
          duration: 3000,
        });
      })
    )
  );

  readonly notifyApplicationSuccess = this.effect(() =>
    this._applicationStore.events$.pipe(
      filter((event) => event.type !== ApplicationActionTypes.ApplicationInit),
      tap((event) => {
        this._matSnackBar.open(event.type, 'Close', {
          panelClass: `success-snackbar`,
          duration: 3000,
        });
      })
    )
  );

  readonly notifyCollectionSuccess = this.effect(() =>
    this._collectionStore.events$.pipe(
      filter((event) => event.type !== CollectionActionTypes.CollectionInit),
      tap((event) => {
        this._matSnackBar.open(event.type, 'Close', {
          panelClass: `success-snackbar`,
          duration: 3000,
        });
      })
    )
  );

  readonly notifyCollectionAttributeSuccess = this.effect(() =>
    this._collectionAttributeStore.events$.pipe(
      filter((event) => event.type !== CollectionActionTypes.CollectionInit),
      tap((event) => {
        this._matSnackBar.open(event.type, 'Close', {
          panelClass: `success-snackbar`,
          duration: 3000,
        });
      })
    )
  );

  readonly notifyInstructionSuccess = this.effect(() =>
    this._instructionStore.events$.pipe(
      filter((event) => event.type !== InstructionActionTypes.InstructionInit),
      tap((event) => {
        this._matSnackBar.open(event.type, 'Close', {
          panelClass: `success-snackbar`,
          duration: 3000,
        });
      })
    )
  );

  readonly notifyInstructionArgumentSuccess = this.effect(() =>
    this._instructionArgumentStore.events$.pipe(
      filter((event) => event.type !== InstructionActionTypes.InstructionInit),
      tap((event) => {
        this._matSnackBar.open(event.type, 'Close', {
          panelClass: `success-snackbar`,
          duration: 3000,
        });
      })
    )
  );

  readonly notifyInstructionDocumentSuccess = this.effect(() =>
    this._instructionAccountStore.events$.pipe(
      filter((event) => event.type !== InstructionActionTypes.InstructionInit),
      tap((event) => {
        this._matSnackBar.open(event.type, 'Close', {
          panelClass: `success-snackbar`,
          duration: 3000,
        });
      })
    )
  );

  readonly notifyInstructionRelationSuccess = this.effect(() =>
    this._instructionRelationStore.events$.pipe(
      filter((event) => event.type !== InstructionActionTypes.InstructionInit),
      tap((event) => {
        this._matSnackBar.open(event.type, 'Close', {
          panelClass: `success-snackbar`,
          duration: 3000,
        });
      })
    )
  ); */

  closeTab(event: Event, tabId: string) {
    event.stopPropagation();
    event.preventDefault();
    this._tabStore.closeTab(tabId);
  }
}
