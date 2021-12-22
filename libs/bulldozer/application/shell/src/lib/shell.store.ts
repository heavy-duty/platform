import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import {
  ApplicationActionTypes,
  ApplicationStore,
  CollectionActions,
  CollectionActionTypes,
  CollectionDeleted,
  CollectionStore,
  InstructionActions,
  InstructionActionTypes,
  InstructionDeleted,
  InstructionStore,
  WorkspaceActionTypes,
  WorkspaceStore,
} from '@heavy-duty/bulldozer/application/data-access';
import {
  generateApplicationMetadata,
  generateApplicationZip,
} from '@heavy-duty/bulldozer/application/utils/services/code-generator';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ComponentStore } from '@ngrx/component-store';
import { ProgramError } from '@project-serum/anchor';
import { WalletError } from '@solana/wallet-adapter-base';
import { merge, Observable, of, Subject } from 'rxjs';
import { concatMap, filter, map, tap, withLatestFrom } from 'rxjs/operators';

export type TabKind = 'collections' | 'instructions';

export interface Tab {
  kind: TabKind;
  id: string;
}

interface ViewModel {
  tabs: Tab[];
  selected: string | null;
}

const initialState: ViewModel = {
  tabs: [],
  selected: null,
};

@Injectable()
export class ApplicationShellStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  readonly tabs$ = this.select(
    this.select(({ tabs }) => tabs),
    this._collectionStore.collections$,
    this._instructionStore.instructions$,
    (tabs, collections, instructions) =>
      tabs.map((tab) => ({
        ...tab,
        title:
          tab.kind === 'collections'
            ? collections.find(({ id }) => id === tab.id)?.data.name
            : instructions.find(({ id }) => id === tab.id)?.data.name,
      }))
  );
  readonly selected$ = this.select(({ selected }) => selected, {
    debounce: true,
  });
  readonly tab$ = this.select(
    this.tabs$,
    this.selected$,
    (tabs, selected) => tabs.find(({ id }) => id === selected) || null
  );
  readonly applicationMetadata$ = this.select(
    this._applicationStore.application$,
    this._collectionStore.collections$,
    this._instructionStore.instructions$,
    (application, collections, instructions) =>
      application &&
      generateApplicationMetadata(application, collections, instructions),
    { debounce: true }
  );

  constructor(
    private readonly _router: Router,
    private readonly _matSnackBar: MatSnackBar,
    private readonly _walletStore: WalletStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _applicationStore: ApplicationStore,
    private readonly _collectionStore: CollectionStore,
    private readonly _instructionStore: InstructionStore
  ) {
    super(initialState);
  }

  readonly openCollectionTab = this.effect(() =>
    this._collectionStore.collectionId$.pipe(
      isNotNullOrUndefined,
      tap((collectionId) => this.patchState({ selected: collectionId })),
      concatMap((collectionId) =>
        of(collectionId).pipe(
          withLatestFrom(this.tabs$),
          filter(([, tabs]) => !tabs.some(({ id }) => id === collectionId)),
          tap(([, tabs]) =>
            this.patchState({
              tabs: [...tabs, { id: collectionId, kind: 'collections' }],
            })
          )
        )
      )
    )
  );

  readonly openInstructionTab = this.effect(() =>
    this._instructionStore.instructionId$.pipe(
      isNotNullOrUndefined,
      tap((instructionId) => this.patchState({ selected: instructionId })),
      concatMap((instructionId) =>
        of(instructionId).pipe(
          withLatestFrom(this.tabs$),
          filter(([, tabs]) => !tabs.some(({ id }) => id === instructionId)),
          tap(([, tabs]) =>
            this.patchState({
              tabs: [...tabs, { id: instructionId, kind: 'instructions' }],
            })
          )
        )
      )
    )
  );

  readonly closeTabOnCollectionDelete = this.effect(() =>
    this._collectionStore.events$.pipe(
      filter<CollectionActions, CollectionDeleted>(
        (event): event is CollectionDeleted =>
          event.type === CollectionActionTypes.CollectionDeleted
      ),
      tap(({ payload }) => this.closeTab(payload))
    )
  );

  readonly closeTabOnInstructionDelete = this.effect(() =>
    this._instructionStore.events$.pipe(
      filter<InstructionActions, InstructionDeleted>(
        (event): event is InstructionDeleted =>
          event.type === InstructionActionTypes.InstructionDeleted
      ),
      tap(({ payload }) => this.closeTab(payload))
    )
  );

  readonly closeTabsOnApplicationOrWorkspaceChange = this.effect(() =>
    merge(
      this._workspaceStore.workspaceId$,
      this._applicationStore.applicationId$
    ).pipe(
      isNotNullOrUndefined,
      tap(() => this.patchState({ selected: null, tabs: [] }))
    )
  );

  readonly clearTabs = this.updater((state) => ({
    ...state,
    tabs: [],
    selected: null,
  }));

  readonly closeTab = this.effect((tabId$: Observable<string>) =>
    tabId$.pipe(
      concatMap((tabId) =>
        of(tabId).pipe(
          withLatestFrom(
            this.tabs$,
            this.selected$,
            this._applicationStore.applicationId$
          )
        )
      ),
      tap(([tabId, tabs, selectedTab, applicationId]) => {
        const filteredTabs = tabs.filter((tab) => tab.id !== tabId);

        if (filteredTabs?.length === 0) {
          this._router.navigate(['/applications', applicationId]);
          this.patchState({
            selected: null,
            tabs: [],
          });
          this._collectionStore.selectCollection(null);
          this._instructionStore.selectInstruction(null);
        } else {
          const firstTab = filteredTabs ? filteredTabs[0] : null;

          if (firstTab && tabId === selectedTab) {
            this._router.navigate([
              '/applications',
              applicationId,
              firstTab.kind,
              firstTab.id,
            ]);
            this.patchState({
              selected: firstTab.id,
              tabs: filteredTabs,
            });
          } else {
            this.patchState({
              tabs: filteredTabs,
            });
          }
        }
      })
    )
  );

  readonly notifyErrors = this.effect(() =>
    merge(
      this._workspaceStore.error$,
      this._applicationStore.error$,
      this._collectionStore.error$,
      this._instructionStore.error$,
      this._walletStore.error$
    ).pipe(
      tap((error) =>
        this._matSnackBar.open(this.getErrorMessage(error), 'Close', {
          panelClass: `error-snackbar`,
        })
      )
    )
  );

  readonly notifyWorkspaceSuccess = this.effect(() =>
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
        this._applicationStore.reload();
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
        this._collectionStore.reload();
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
        this._instructionStore.reload();
        this._matSnackBar.open(event.type, 'Close', {
          panelClass: `success-snackbar`,
          duration: 3000,
        });
      })
    )
  );

  readonly downloadCode = this.effect((action$) =>
    action$.pipe(
      concatMap(() =>
        of(null).pipe(
          withLatestFrom(
            this._applicationStore.application$,
            this._collectionStore.collections$,
            this._instructionStore.instructions$
          ),
          map(
            ([, application, collections, instructions]) =>
              application &&
              generateApplicationZip(
                application,
                generateApplicationMetadata(
                  application,
                  collections,
                  instructions
                )
              )
          )
        )
      )
    )
  );

  private getErrorMessage(error: unknown) {
    if (typeof error === 'string') {
      return error;
    } else if (error instanceof WalletError) {
      return error.name;
    } else if (error instanceof ProgramError) {
      return error.message;
    } else {
      return 'Unknown error';
    }
  }
}
