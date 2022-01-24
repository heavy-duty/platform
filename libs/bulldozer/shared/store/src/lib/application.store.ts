import { Injectable } from '@angular/core';
import {
  Application,
  createCreateApplicationTransaction,
  createDeleteApplicationTransaction,
  createUpdateApplicationTransaction,
  Document,
  fromApplicationChange,
  fromApplicationCreated,
  getApplications,
} from '@heavy-duty/bulldozer-devkit';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { Keypair, PublicKey } from '@solana/web3.js';
import {
  catchError,
  combineLatest,
  concatMap,
  EMPTY,
  merge,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { ConnectionStore } from './connection-store';

interface ViewModel {
  applicationsMap: Map<string, Document<Application>>;
}

const initialState: ViewModel = {
  applicationsMap: new Map<string, Document<Application>>(),
};

@Injectable()
export class ApplicationStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  readonly applicationsMap$ = this.select(
    ({ applicationsMap }) => applicationsMap
  );
  readonly applications$ = this.select(
    this.applicationsMap$,
    (applicationsMap) =>
      Array.from(applicationsMap, ([, application]) => application)
  );

  constructor(
    private readonly _connectionStore: ConnectionStore,
    private readonly _walletStore: WalletStore,
    private readonly _bulldozerProgramStore: BulldozerProgramStore
  ) {
    super(initialState);
  }

  private readonly _setApplication = this.updater(
    (state, newApplication: Document<Application>) => {
      const applicationsMap = new Map(state.applicationsMap);
      applicationsMap.set(newApplication.id, newApplication);
      return {
        ...state,
        applicationsMap,
      };
    }
  );

  private readonly _addApplication = this.updater(
    (state, newApplication: Document<Application>) => {
      if (state.applicationsMap.has(newApplication.id)) {
        return state;
      }
      const applicationsMap = new Map(state.applicationsMap);
      applicationsMap.set(newApplication.id, newApplication);
      return {
        ...state,
        applicationsMap,
      };
    }
  );

  private readonly _removeApplication = this.updater(
    (state, applicationId: string) => {
      const applicationsMap = new Map(state.applicationsMap);
      applicationsMap.delete(applicationId);
      return {
        ...state,
        applicationsMap,
      };
    }
  );

  readonly onApplicationChanges = this.effect(() =>
    combineLatest([this._connectionStore.connection$, this.applications$]).pipe(
      switchMap(([connection, applications]) => {
        if (!connection) {
          return of(null);
        }

        return merge(
          ...applications.map((application) =>
            fromApplicationChange(
              connection,
              new PublicKey(application.id)
            ).pipe(
              tap((changes) => {
                if (!changes) {
                  this._removeApplication(application.id);
                } else {
                  this._setApplication(changes);
                }
              })
            )
          )
        );
      })
    )
  );

  readonly onApplicationCreated = this.effect(() =>
    combineLatest([
      this._connectionStore.connection$,
      this._bulldozerProgramStore.workspaceId$,
      this.applications$,
    ]).pipe(
      switchMap(([connection, workspaceId]) => {
        if (!connection || !workspaceId) {
          return EMPTY;
        }

        return fromApplicationCreated(connection, {
          workspace: workspaceId,
        }).pipe(tap((application) => this._addApplication(application)));
      })
    )
  );

  readonly loadApplications = this.effect(() =>
    combineLatest([
      this._connectionStore.connection$,
      this._bulldozerProgramStore.workspaceId$,
    ]).pipe(
      concatMap(([connection, workspaceId]) => {
        if (!connection || !workspaceId) {
          return of([]);
        }

        return getApplications(connection, {
          workspace: workspaceId,
        }).pipe(
          catchError((error) => {
            console.error(error);
            return EMPTY;
          })
        );
      }),
      tap((applications) =>
        this.patchState({
          applicationsMap: applications.reduce(
            (applicationsMap, application) =>
              applicationsMap.set(application.id, application),
            new Map<string, Document<Application>>()
          ),
        })
      )
    )
  );

  readonly createApplication = this.effect(
    (applicationName$: Observable<string>) =>
      combineLatest([
        this._connectionStore.connection$,
        this._walletStore.publicKey$,
        this._bulldozerProgramStore.workspaceId$,
        applicationName$,
      ]).pipe(
        concatMap(([connection, authority, workspaceId, applicationName]) => {
          console.log({ connection, authority, workspaceId });

          if (!connection || !authority || !workspaceId) {
            return of(null);
          }

          const applicationKeypair = new Keypair();

          return createCreateApplicationTransaction(
            connection,
            authority,
            new PublicKey(workspaceId),
            applicationKeypair,
            applicationName
          ).pipe(
            this._bulldozerProgramStore.signSendAndConfirmTransactions(
              connection
            )
          );
        })
      )
  );

  readonly updateApplication = this.effect(
    (
      request$: Observable<{ applicationId: string; applicationName: string }>
    ) =>
      combineLatest([
        this._connectionStore.connection$,
        this._walletStore.publicKey$,
        request$,
      ]).pipe(
        concatMap(
          ([connection, authority, { applicationId, applicationName }]) => {
            if (!connection || !authority) {
              return of(null);
            }

            return createUpdateApplicationTransaction(
              connection,
              authority,
              new PublicKey(applicationId),
              applicationName
            ).pipe(
              this._bulldozerProgramStore.signSendAndConfirmTransactions(
                connection
              )
            );
          }
        )
      )
  );

  readonly deleteApplication = this.effect(
    (applicationId$: Observable<string>) =>
      combineLatest([
        this._connectionStore.connection$,
        this._walletStore.publicKey$,
        this._bulldozerProgramStore.workspaceId$,
        applicationId$,
      ]).pipe(
        concatMap(([connection, authority, workspaceId, applicationId]) => {
          if (!connection || !authority || !workspaceId) {
            return of(null);
          }

          return createDeleteApplicationTransaction(
            connection,
            authority,
            new PublicKey(workspaceId),
            new PublicKey(applicationId)
          ).pipe(
            this._bulldozerProgramStore.signSendAndConfirmTransactions(
              connection
            )
          );
        })
      )
  );
}
