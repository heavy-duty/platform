import { Injectable } from '@angular/core';
import {
  ApplicationApiService,
  ApplicationEventService,
} from '@bulldozer-client/applications-data-access';
import { NotificationStore } from '@bulldozer-client/core-data-access';
import { Application, Document } from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  EMPTY,
  filter,
  first,
  mergeMap,
  Observable,
  of,
  switchMap,
  takeUntil,
  takeWhile,
  tap,
  withLatestFrom,
} from 'rxjs';

interface ViewModel {
  loading: boolean;
  workspaceId: string | null;
  applicationsMap: Map<string, Document<Application>>;
}

const initialState: ViewModel = {
  loading: false,
  workspaceId: null,
  applicationsMap: new Map<string, Document<Application>>(),
};

@Injectable()
export class ApplicationExplorerStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly applicationsMap$ = this.select(
    ({ applicationsMap }) => applicationsMap
  );
  readonly applications$ = this.select(
    this.applicationsMap$,
    (applicationsMap) =>
      Array.from(applicationsMap, ([, application]) => application)
  );

  constructor(
    private readonly _applicationApiService: ApplicationApiService,
    private readonly _applicationEventService: ApplicationEventService,
    private readonly _walletStore: WalletStore,
    private readonly _notificationStore: NotificationStore
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

  readonly setWorkspaceId = this.updater(
    (state, workspaceId: string | null) => ({ ...state, workspaceId })
  );

  private readonly _handleApplicationChanges = this.effect(
    (applicationId$: Observable<string>) =>
      applicationId$.pipe(
        mergeMap((applicationId) =>
          this._applicationEventService.applicationChanges(applicationId).pipe(
            tapResponse(
              (changes) => {
                if (changes === null) {
                  this._removeApplication(applicationId);
                } else {
                  this._setApplication(changes);
                }
              },
              (error) => this._notificationStore.setError(error)
            ),
            takeUntil(
              this.loading$.pipe(
                filter((loading) => loading),
                first()
              )
            ),
            takeWhile((application) => application !== null)
          )
        )
      )
  );

  protected readonly _handleApplicationCreated = this.effect(() =>
    this.workspaceId$.pipe(
      switchMap((workspaceId) => {
        if (workspaceId === null) {
          return EMPTY;
        }

        return this._applicationEventService
          .applicationCreated({
            workspace: workspaceId,
          })
          .pipe(
            tapResponse(
              (application) => {
                this._addApplication(application);
                this._handleApplicationChanges(application.id);
              },
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );

  protected readonly _loadApplications = this.effect(() =>
    this.workspaceId$.pipe(
      tap(() => this.patchState({ loading: true })),
      switchMap((workspaceId) => {
        if (workspaceId === null) {
          return EMPTY;
        }

        return this._applicationApiService
          .find({ workspace: workspaceId })
          .pipe(
            tapResponse(
              (applications) => {
                this.patchState({
                  applicationsMap: applications.reduce(
                    (applicationsMap, application) =>
                      applicationsMap.set(application.id, application),
                    new Map<string, Document<Application>>()
                  ),
                  loading: false,
                });
                applications.forEach(({ id }) => {
                  this._handleApplicationChanges(id);
                });
              },
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );

  readonly createApplication = this.effect(
    ($: Observable<{ applicationName: string }>) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(
            withLatestFrom(this.workspaceId$, this._walletStore.publicKey$)
          )
        ),
        concatMap(([{ applicationName }, workspaceId, authority]) => {
          if (workspaceId === null || authority === null) {
            return EMPTY;
          }

          return this._applicationApiService
            .create({
              applicationName,
              authority: authority.toBase58(),
              workspaceId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Create application request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        })
      )
  );

  readonly updateApplication = this.effect(
    (
      $: Observable<{
        applicationId: string;
        applicationName: string;
      }>
    ) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
        ),
        concatMap(([{ applicationId, applicationName }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._applicationApiService
            .update({
              applicationName,
              authority: authority.toBase58(),
              applicationId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Update application request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        })
      )
  );

  readonly deleteApplication = this.effect(
    ($: Observable<{ applicationId: string }>) =>
      $.pipe(
        concatMap((request) =>
          of(request).pipe(
            withLatestFrom(this.workspaceId$, this._walletStore.publicKey$)
          )
        ),
        concatMap(([{ applicationId }, workspaceId, authority]) => {
          if (workspaceId === null || authority === null) {
            return EMPTY;
          }

          return this._applicationApiService
            .delete({
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Delete application request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        })
      )
  );
}
