import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { Application, Document } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, switchMap } from 'rxjs';
import { ApplicationApiService } from './application-api.service';

export interface ApplicationView {
  document: Document<Application>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

interface ViewModel {
  loading: boolean;
  applicationIds: string[] | null;
  applicationsMap: Map<string, ApplicationView>;
}

const initialState: ViewModel = {
  loading: false,
  applicationIds: null,
  applicationsMap: new Map<string, ApplicationView>(),
};

@Injectable()
export class ApplicationsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly applicationIds$ = this.select(
    ({ applicationIds }) => applicationIds
  );
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
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadApplications(this.applicationIds$);
  }

  private readonly _setApplication = this.updater<ApplicationView>(
    (state, newApplication) => {
      const applicationsMap = new Map(state.applicationsMap);
      applicationsMap.set(newApplication.document.id, newApplication);

      return {
        ...state,
        applicationsMap,
      };
    }
  );

  private readonly _patchApplicationStatuses = this.updater<{
    applicationId: string;
    statuses: {
      isCreating?: boolean;
      isUpdating?: boolean;
      isDeleting?: boolean;
    };
  }>((state, { applicationId, statuses }) => {
    const applicationsMap = new Map(state.applicationsMap);
    const application = applicationsMap.get(applicationId);

    if (application === undefined) {
      return state;
    }

    return {
      ...state,
      applicationsMap: applicationsMap.set(applicationId, {
        ...application,
        ...statuses,
      }),
    };
  });

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

  private readonly _loadApplications = this.effect<string[] | null>(
    switchMap((applicationIds) => {
      if (applicationIds === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._applicationApiService.findByIds(applicationIds).pipe(
        tapResponse(
          (applications) => {
            this.patchState({
              loading: false,
              applicationsMap: applications
                .filter(
                  (application): application is Document<Application> =>
                    application !== null
                )
                .reduce(
                  (applicationsMap, application) =>
                    applicationsMap.set(application.id, {
                      document: application,
                      isCreating: false,
                      isUpdating: false,
                      isDeleting: false,
                    }),
                  new Map<string, ApplicationView>()
                ),
            });
          },
          (error) => this._notificationStore.setError({ error })
        )
      );
    })
  );

  readonly setApplicationIds = this.updater<string[] | null>(
    (state, applicationIds) => ({
      ...state,
      applicationIds,
    })
  );

  readonly handleApplicationInstruction = this.effect<InstructionStatus>(
    concatMap((applicationInstruction) => {
      const applicationAccountMeta = applicationInstruction.accounts.find(
        (account) => account.name === 'Application'
      );

      if (applicationAccountMeta === undefined) {
        return EMPTY;
      }

      switch (applicationInstruction.name) {
        case 'createApplication': {
          if (applicationInstruction.status === 'finalized') {
            this._patchApplicationStatuses({
              applicationId: applicationAccountMeta.pubkey,
              statuses: {
                isCreating: false,
              },
            });

            return EMPTY;
          }

          return this._applicationApiService
            .findById(applicationAccountMeta.pubkey, 'confirmed')
            .pipe(
              isNotNullOrUndefined,
              tapResponse(
                (application) =>
                  this._setApplication({
                    document: application,
                    isCreating: true,
                    isUpdating: false,
                    isDeleting: false,
                  }),
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'updateApplication': {
          if (applicationInstruction.status === 'finalized') {
            this._patchApplicationStatuses({
              applicationId: applicationAccountMeta.pubkey,
              statuses: {
                isUpdating: false,
              },
            });

            return EMPTY;
          }

          return this._applicationApiService
            .findById(applicationAccountMeta.pubkey, 'confirmed')
            .pipe(
              isNotNullOrUndefined,
              tapResponse(
                (application) =>
                  this._setApplication({
                    document: application,
                    isCreating: false,
                    isUpdating: true,
                    isDeleting: false,
                  }),
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'deleteApplication': {
          if (applicationInstruction.status === 'confirmed') {
            this._patchApplicationStatuses({
              applicationId: applicationAccountMeta.pubkey,
              statuses: { isDeleting: true },
            });
          } else {
            this._removeApplication(applicationAccountMeta.pubkey);
          }

          return EMPTY;
        }
        default:
          return EMPTY;
      }
    })
  );
}
