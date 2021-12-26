import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  createApplication,
  updateApplication,
} from '@heavy-duty/bulldozer-devkit';
import { EditApplicationComponent } from '@heavy-duty/bulldozer/application/features/edit-application';
import {
  Application,
  CollectionExtended,
  InstructionExtended,
} from '@heavy-duty/bulldozer/application/utils/types';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer/data-access';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { PublicKey, sendAndConfirmRawTransaction } from '@solana/web3.js';
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  defer,
  exhaustMap,
  filter,
  from,
  Observable,
  Subject,
  switchMap,
  tap,
  throwError,
  withLatestFrom,
} from 'rxjs';
import {
  ApplicationActions,
  ApplicationCreated,
  ApplicationDeleted,
  ApplicationInit,
  ApplicationUpdated,
} from './actions/application.actions';
import { WorkspaceStore } from './workspace.store';

interface ViewModel {
  applicationId: string | null;
  applications: Application[];
  error: unknown | null;
}

const initialState = {
  applicationId: null,
  applications: [],
  error: null,
};

@Injectable()
export class ApplicationStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _reload = new BehaviorSubject(null);
  readonly reload$ = this._reload.asObservable();
  private readonly _events = new BehaviorSubject<ApplicationActions>(
    new ApplicationInit()
  );
  readonly events$ = this._events.asObservable();
  readonly applications$ = this.select(({ applications }) => applications);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly application$ = this.select(
    this.applications$,
    this.applicationId$,
    (applications, applicationId) =>
      applications.find(({ id }) => id === applicationId) || null
  );

  constructor(
    private readonly _matDialog: MatDialog,
    private readonly _bulldozerProgramStore: BulldozerProgramStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _connectionStore: ConnectionStore,
    private readonly _walletStore: WalletStore
  ) {
    super(initialState);
  }

  readonly loadApplications = this.effect(() =>
    combineLatest([
      this._workspaceStore.workspaceId$.pipe(isNotNullOrUndefined),
      this.reload$,
    ]).pipe(
      switchMap(([workspaceId]) =>
        this._bulldozerProgramStore.getApplications(workspaceId).pipe(
          tapResponse(
            (applications) => this.patchState({ applications }),
            (error) => this._error.next(error)
          )
        )
      )
    )
  );

  readonly selectApplication = this.effect(
    (applicationId$: Observable<string | null>) =>
      applicationId$.pipe(
        tap((applicationId) => this.patchState({ applicationId }))
      )
  );

  readonly createApplication = this.effect((action$) =>
    combineLatest([
      this._connectionStore.connection$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
      this._bulldozerProgramStore.writer$.pipe(isNotNullOrUndefined),
      action$,
    ]).pipe(
      exhaustMap(([connection, walletPublicKey, writer]) =>
        this._matDialog
          .open(EditApplicationComponent)
          .afterClosed()
          .pipe(
            filter((data) => data),
            withLatestFrom(
              this._workspaceStore.workspaceId$.pipe(isNotNullOrUndefined)
            ),
            concatMap(([{ name }, workspaceId]) =>
              createApplication(
                connection,
                walletPublicKey,
                writer,
                new PublicKey(workspaceId),
                name
              )
            ),
            concatMap(({ transaction, signers }) =>
              this._walletStore
                .sendTransaction(transaction, connection, { signers })
                .pipe(
                  concatMap((signature) =>
                    from(defer(() => connection.confirmTransaction(signature)))
                  )
                )
            ),
            tapResponse(
              () => this._events.next(new ApplicationCreated()),
              (error) => this._error.next(error)
            )
          )
      )
    )
  );

  readonly updateApplication = this.effect(
    (application$: Observable<Application>) =>
      combineLatest([
        this._connectionStore.connection$.pipe(isNotNullOrUndefined),
        this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
        this._bulldozerProgramStore.writer$.pipe(isNotNullOrUndefined),
        application$,
      ]).pipe(
        exhaustMap(([connection, walletPublicKey, writer, application]) =>
          this._matDialog
            .open(EditApplicationComponent, { data: { application } })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap(({ name }) =>
                updateApplication(
                  connection,
                  walletPublicKey,
                  writer,
                  new PublicKey(application.id),
                  name
                )
              ),
              concatMap(({ transaction }) =>
                this._walletStore
                  .sendTransaction(transaction, connection)
                  .pipe(
                    concatMap((signature) =>
                      from(
                        defer(() => connection.confirmTransaction(signature))
                      )
                    )
                  )
              ),
              tapResponse(
                () => this._events.next(new ApplicationUpdated(application.id)),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly deleteApplication = this.effect(
    (
      request$: Observable<{
        application: Application;
        collections: CollectionExtended[];
        instructions: InstructionExtended[];
      }>
    ) =>
      combineLatest([
        this._connectionStore.connection$.pipe(isNotNullOrUndefined),
        this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
        request$,
      ]).pipe(
        concatMap(
          ([
            connection,
            walletPublicKey,
            { application, collections, instructions },
          ]) =>
            this._bulldozerProgramStore
              .getDeleteApplicationTransactions(
                connection,
                walletPublicKey,
                application,
                collections,
                instructions
              )
              .pipe(
                concatMap((transactions) => {
                  const signAllTransactions$ =
                    this._walletStore.signAllTransactions(transactions);

                  if (!signAllTransactions$) {
                    return throwError(
                      new Error('Sign all transactions method is not defined')
                    );
                  }

                  return signAllTransactions$;
                }),
                concatMap((transactions) =>
                  from(
                    defer(() =>
                      Promise.all(
                        transactions.map((transaction) =>
                          sendAndConfirmRawTransaction(
                            connection,
                            transaction.serialize()
                          )
                        )
                      )
                    )
                  )
                ),
                tapResponse(
                  () =>
                    this._events.next(new ApplicationDeleted(application.id)),
                  (error) => this._error.next(error)
                )
              )
        )
      )
  );

  reload() {
    this._reload.next(null);
  }
}
