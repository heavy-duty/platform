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

interface ViewModel {
  applicationId: string | null;
  application: Document<Application> | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  loading: boolean;
}

const initialState: ViewModel = {
  applicationId: null,
  application: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  loading: false,
};

@Injectable()
export class ApplicationStore extends ComponentStore<ViewModel> {
  private readonly _reload = new BehaviorSubject(null);
  private readonly reload$ = this._reload.asObservable();
  readonly application$ = this.select(({ application }) => application);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly isCreating$ = this.select(({ isCreating }) => isCreating);
  readonly isUpdating$ = this.select(({ isUpdating }) => isUpdating);
  readonly isDeleting$ = this.select(({ isDeleting }) => isDeleting);
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

  private readonly _loadApplication = this.effect<string | null>(
    switchMap((applicationId) => {
      if (applicationId === null) {
        this.patchState({ application: null });
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._applicationApiService.findById(applicationId).pipe(
        tapResponse(
          (application) => this.patchState({ application, loading: false }),
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
            this.patchState({ isCreating: false });
            return EMPTY;
          }

          return this._applicationApiService
            .findById(applicationAccountMeta.pubkey, 'confirmed')
            .pipe(
              tapResponse(
                (application) => {
                  this.patchState({
                    application,
                    isCreating: true,
                  });
                },
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'updateApplication': {
          if (applicationInstruction.status === 'finalized') {
            this.patchState({ isUpdating: false });
            return EMPTY;
          }

          return this._applicationApiService
            .findById(applicationAccountMeta.pubkey, 'confirmed')
            .pipe(
              tapResponse(
                (application) =>
                  this.patchState({
                    application,
                    isUpdating: true,
                  }),
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'deleteApplication': {
          if (applicationInstruction.status === 'confirmed') {
            this.patchState({ isDeleting: true });
          } else {
            this.patchState({ application: null, isDeleting: false });
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
