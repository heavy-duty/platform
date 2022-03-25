import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { Application, Document } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  EMPTY,
  map,
  switchMap,
} from 'rxjs';
import { ApplicationApiService } from './application-api.service';
import { ItemView } from './types';

export type ApplicationView = ItemView<Document<Application>>;

interface ViewModel {
  applicationId: string | null;
  application: ApplicationView | null;
  loading: boolean;
}

const initialState: ViewModel = {
  applicationId: null,
  application: null,
  loading: false,
};

@Injectable()
export class ApplicationStore extends ComponentStore<ViewModel> {
  private readonly _reload = new BehaviorSubject(null);
  private readonly reload$ = this._reload.asObservable();
  readonly application$ = this.select(({ application }) => application);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly loading$ = this.select(({ loading }) => loading);

  constructor(
    private readonly _applicationApiService: ApplicationApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadApplication(
      combineLatest([this.applicationId$, this.reload$]).pipe(
        map(([applicationId]) => applicationId)
      )
    );
  }

  readonly setApplicationId = this.updater<string | null>(
    (state, applicationId) => ({
      ...state,
      applicationId,
    })
  );

  private readonly _patchApplicationStatuses = this.updater<{
    isCreating?: boolean;
    isUpdating?: boolean;
    isDeleting?: boolean;
  }>((state, statuses) => ({
    ...state,
    application: state.application
      ? {
          ...state.application,
          ...statuses,
        }
      : null,
  }));

  private readonly _setApplication = this.updater<ItemView<
    Document<Application>
  > | null>((state, application) => ({
    ...state,
    application,
  }));

  private readonly _loadApplication = this.effect<string | null>(
    switchMap((applicationId) => {
      if (applicationId === null) {
        this.patchState({ application: null });
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._applicationApiService.findById(applicationId).pipe(
        tapResponse(
          (application) => {
            if (application !== null) {
              this._setApplication({
                document: application,
                isCreating: false,
                isUpdating: false,
                isDeleting: false,
              });
            }
            this.patchState({ loading: false });
          },
          (error) => this._notificationStore.setError({ error, loading: false })
        )
      );
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
            this._patchApplicationStatuses({ isCreating: false });
            return EMPTY;
          }

          return this._applicationApiService
            .findById(applicationAccountMeta.pubkey, 'confirmed')
            .pipe(
              tapResponse(
                (application) => {
                  if (application !== null) {
                    this._setApplication({
                      document: application,
                      isCreating: false,
                      isUpdating: false,
                      isDeleting: false,
                    });
                  }
                  this._patchApplicationStatuses({ isCreating: true });
                },
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'updateApplication': {
          if (applicationInstruction.status === 'finalized') {
            this._patchApplicationStatuses({ isUpdating: false });
            return EMPTY;
          }

          return this._applicationApiService
            .findById(applicationAccountMeta.pubkey, 'confirmed')
            .pipe(
              tapResponse(
                (application) => {
                  if (application !== null) {
                    this._setApplication({
                      document: application,
                      isCreating: false,
                      isUpdating: false,
                      isDeleting: false,
                    });
                  }
                  this._patchApplicationStatuses({ isUpdating: true });
                },
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'deleteApplication': {
          if (applicationInstruction.status === 'confirmed') {
            this._patchApplicationStatuses({ isDeleting: true });
          } else {
            this.patchState({ application: null });
            this._patchApplicationStatuses({ isDeleting: false });
          }

          return EMPTY;
        }
        default:
          return EMPTY;
      }
    })
  );

  reload() {
    this._reload.next(null);
  }
}
