import { Injectable } from '@angular/core';
import {
  ApplicationApiService,
  ApplicationEventService,
} from '@bulldozer-client/applications-data-access';
import { NotificationStore } from '@bulldozer-client/core-data-access';
import {
  Application,
  ApplicationFilters,
  Document,
} from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  EMPTY,
  filter,
  first,
  mergeMap,
  of,
  pipe,
  switchMap,
  takeUntil,
  takeWhile,
  withLatestFrom,
} from 'rxjs';

interface ViewModel {
  loading: boolean;
  applicationsMap: Map<string, Document<Application>>;
  filters: ApplicationFilters | null;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  applicationsMap: new Map<string, Document<Application>>(),
};

@Injectable()
export class ApplicationsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly applicationsMap$ = this.select(
    ({ applicationsMap }) => applicationsMap
  );
  readonly applications$ = this.select(
    this.applicationsMap$,
    (applicationsMap) =>
      Array.from(applicationsMap, ([, application]) => application)
  );

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _applicationApiService: ApplicationApiService,
    private readonly _applicationEventService: ApplicationEventService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._handleApplicationCreated(this.filters$);
    this._loadApplications(this.filters$);
  }

  private readonly _setApplication = this.updater<Document<Application>>(
    (state, newApplication) => {
      const applicationsMap = new Map(state.applicationsMap);
      applicationsMap.set(newApplication.id, newApplication);
      return {
        ...state,
        applicationsMap,
      };
    }
  );

  private readonly _addApplication = this.updater<Document<Application>>(
    (state, newApplication) => {
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

  private readonly _removeApplication = this.updater<string>(
    (state, applicationId) => {
      const applicationsMap = new Map(state.applicationsMap);
      applicationsMap.delete(applicationId);
      return {
        ...state,
        applicationsMap,
      };
    }
  );

  private readonly _handleApplicationChanges = this.effect<string>(
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
  );

  private readonly _handleApplicationCreated =
    this.effect<ApplicationFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        return this._applicationEventService.applicationCreated(filters).pipe(
          tapResponse(
            (application) => {
              this._addApplication(application);
              this._handleApplicationChanges(application.id);
            },
            (error) => this._notificationStore.setError(error)
          )
        );
      })
    );

  private readonly _loadApplications = this.effect<ApplicationFilters | null>(
    switchMap((filters) => {
      if (filters === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._applicationApiService.find(filters).pipe(
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
            applications.forEach(({ id }) =>
              this._handleApplicationChanges(id)
            );
          },
          (error) => this._notificationStore.setError(error)
        )
      );
    })
  );

  readonly setFilters = this.updater<ApplicationFilters | null>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );

  readonly createApplication = this.effect<{
    workspaceId: string;
    applicationName: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ applicationName, workspaceId }, authority]) => {
        if (authority === null) {
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

  readonly updateApplication = this.effect<{
    applicationId: string;
    applicationName: string;
  }>(
    pipe(
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

  readonly deleteApplication = this.effect<{
    workspaceId: string;
    applicationId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ workspaceId, applicationId }, authority]) => {
        if (authority === null) {
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
