import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {
  Application,
  Collection,
  Document,
  Instruction,
  Workspace,
} from '@heavy-duty/bulldozer-devkit';
import {
  ApplicationActionTypes,
  ApplicationStore,
  CollectionActionTypes,
  CollectionAttributeStore,
  CollectionStore,
  InstructionAccountStore,
  InstructionActionTypes,
  InstructionArgumentStore,
  InstructionRelationStore,
  InstructionStore,
  TabStore,
  WorkspaceActionTypes,
  WorkspaceStore,
} from '@heavy-duty/bulldozer/application/data-access';
import { EditApplicationComponent } from '@heavy-duty/bulldozer/application/features/edit-application';
import { EditCollectionComponent } from '@heavy-duty/bulldozer/application/features/edit-collection';
import { EditInstructionComponent } from '@heavy-duty/bulldozer/application/features/edit-instruction';
import { EditWorkspaceComponent } from '@heavy-duty/bulldozer/application/features/edit-workspace';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { ProgramError } from '@project-serum/anchor';
import { WalletError } from '@solana/wallet-adapter-base';
import {
  concatMap,
  exhaustMap,
  filter,
  merge,
  Observable,
  Subject,
  tap,
} from 'rxjs';

export type TabKind = 'collections' | 'instructions';

export interface Tab {
  kind: TabKind;
  id: string;
  workspaceId: string;
}

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
  readonly workspace$ = this._workspaceStore.workspace$;
  readonly workspaces$ = this._workspaceStore.workspaces$;
  readonly tabs$ = this._tabStore.tabs$;
  readonly selectedTab$ = this._tabStore.selected$;
  readonly connected$ = this._walletStore.connected$;
  readonly workspaceId$ = this._workspaceStore.workspaceId$;
  readonly applications$ = this._applicationStore.applications$;
  readonly collections$ = this._collectionStore.collections$;
  readonly instructions$ = this._instructionStore.instructions$;
  readonly application$ = this._applicationStore.application$;

  constructor(
    private readonly _router: Router,
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
    private readonly _matDialog: MatDialog
  ) {
    super(initialState);
  }

  readonly loadHandset = this.effect(() =>
    this._breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(tap((result) => this.patchState({ isHandset: result.matches })))
  );

  readonly redirectUnauthorized = this.effect(() =>
    this._walletStore.connected$.pipe(
      filter((connected) => !connected),
      tap(() =>
        this._router.navigate(['/unauthorized-access'], {
          queryParams: {
            redirect: this._router.routerState.snapshot.url,
          },
        })
      )
    )
  );

  readonly notifyErrors = this.effect(() =>
    merge(
      this._workspaceStore.error$,
      this._applicationStore.error$,
      this._collectionStore.error$,
      this._collectionAttributeStore.error$,
      this._instructionStore.error$,
      this._instructionArgumentStore.error$,
      this._instructionAccountStore.error$,
      this._instructionRelationStore.error$
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
  );

  readonly loadData = this.effect((action$) =>
    action$.pipe(
      concatMap(() => {
        this._workspaceStore.loadWorkspaces();

        return merge(
          this._workspaceStore.workspace$.pipe(
            isNotNullOrUndefined,
            tap((workspace) =>
              this._applicationStore.loadApplications(workspace.id)
            )
          ),
          this._applicationStore.applicationId$.pipe(
            isNotNullOrUndefined,
            tap((applicationId) => {
              this._collectionStore.loadCollections(applicationId);
              this._instructionStore.loadInstructions(applicationId);
            })
          ),
          this._collectionStore.collectionId$.pipe(
            isNotNullOrUndefined,
            tap((collectionId) => {
              this._collectionAttributeStore.loadCollectionAttributes(
                collectionId
              );
            })
          ),
          this._instructionStore.instructionId$.pipe(
            isNotNullOrUndefined,
            tap((instructionId) => {
              this._instructionArgumentStore.loadInstructionArguments(
                instructionId
              );
              this._instructionAccountStore.loadInstructionAccounts(
                instructionId
              );
              this._instructionRelationStore.loadInstructionRelations(
                instructionId
              );
            })
          )
        );
      })
    )
  );

  readonly createWorkspace = this.effect((action$) =>
    action$.pipe(
      exhaustMap(() =>
        this._matDialog
          .open(EditWorkspaceComponent)
          .afterClosed()
          .pipe(
            isNotNullOrUndefined,
            tap((data) => this._workspaceStore.createWorkspace({ data }))
          )
      )
    )
  );

  readonly updateWorkspace = this.effect(
    (workspace$: Observable<Document<Workspace>>) =>
      workspace$.pipe(
        exhaustMap((workspace) =>
          this._matDialog
            .open(EditWorkspaceComponent, { data: { workspace } })
            .afterClosed()
            .pipe(
              isNotNullOrUndefined,
              tap((changes) =>
                this._workspaceStore.updateWorkspace({
                  workspace,
                  changes,
                })
              )
            )
        )
      )
  );

  readonly deleteWorkspace = this.effect(
    (workspace$: Observable<Document<Workspace>>) =>
      workspace$.pipe(
        tap((workspace) => this._workspaceStore.deleteWorkspace(workspace))
      )
  );

  readonly downloadWorkspace = this.effect(
    (workspace$: Observable<Document<Workspace>>) =>
      workspace$.pipe(
        tap((workspace) => this._workspaceStore.downloadWorkspace(workspace))
      )
  );

  readonly createApplication = this.effect((workspaceId$: Observable<string>) =>
    workspaceId$.pipe(
      exhaustMap((workspaceId) =>
        this._matDialog
          .open(EditApplicationComponent)
          .afterClosed()
          .pipe(
            isNotNullOrUndefined,
            tap((data) =>
              this._applicationStore.createApplication({
                workspaceId,
                data,
              })
            )
          )
      )
    )
  );

  readonly updateApplication = this.effect(
    (application$: Observable<Document<Application>>) =>
      application$.pipe(
        exhaustMap((application) =>
          this._matDialog
            .open(EditApplicationComponent, { data: { application } })
            .afterClosed()
            .pipe(
              filter((changes) => changes),
              tap((changes) =>
                this._applicationStore.updateApplication({
                  application,
                  changes,
                })
              )
            )
        )
      )
  );

  readonly deleteApplication = this.effect(
    (application$: Observable<Document<Application>>) =>
      application$.pipe(
        tap((application) =>
          this._applicationStore.deleteApplication(application)
        )
      )
  );

  readonly createCollection = this.effect(
    (request$: Observable<{ workspaceId: string; applicationId: string }>) =>
      request$.pipe(
        exhaustMap(({ workspaceId, applicationId }) =>
          this._matDialog
            .open(EditCollectionComponent)
            .afterClosed()
            .pipe(
              filter((data) => data),
              tap((data) =>
                this._collectionStore.createCollection({
                  workspaceId,
                  applicationId,
                  data,
                })
              )
            )
        )
      )
  );

  readonly updateCollection = this.effect(
    (collection$: Observable<Document<Collection>>) =>
      collection$.pipe(
        exhaustMap((collection) =>
          this._matDialog
            .open(EditCollectionComponent, { data: { collection } })
            .afterClosed()
            .pipe(
              filter((changes) => changes),
              tap((changes) =>
                this._collectionStore.updateCollection({
                  collection,
                  changes,
                })
              )
            )
        )
      )
  );

  readonly deleteCollection = this.effect(
    (collection$: Observable<Document<Collection>>) =>
      collection$.pipe(
        tap((collection) => this._collectionStore.deleteCollection(collection))
      )
  );

  readonly createInstruction = this.effect(
    (request$: Observable<{ workspaceId: string; applicationId: string }>) =>
      request$.pipe(
        exhaustMap(({ workspaceId, applicationId }) =>
          this._matDialog
            .open(EditInstructionComponent)
            .afterClosed()
            .pipe(
              filter((data) => data),
              tap((data) =>
                this._instructionStore.createInstruction({
                  workspaceId,
                  applicationId,
                  data,
                })
              )
            )
        )
      )
  );

  readonly updateInstruction = this.effect(
    (instruction$: Observable<Document<Instruction>>) =>
      instruction$.pipe(
        exhaustMap((instruction) =>
          this._matDialog
            .open(EditInstructionComponent, { data: { instruction } })
            .afterClosed()
            .pipe(
              isNotNullOrUndefined,
              tap(({ name }) =>
                this._instructionStore.updateInstruction({
                  instruction,
                  changes: { name },
                })
              )
            )
        )
      )
  );

  readonly deleteInstruction = this.effect(
    (instruction$: Observable<Document<Instruction>>) =>
      instruction$.pipe(
        tap((instruction) =>
          this._instructionStore.deleteInstruction(instruction)
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

  closeTab(event: Event, tabId: string) {
    event.stopPropagation();
    event.preventDefault();
    this._tabStore.closeTab(tabId);
  }
}
