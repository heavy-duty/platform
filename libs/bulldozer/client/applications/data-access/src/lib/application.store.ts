import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { Application, Document } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { ApplicationApiService } from './application-api.service';

interface ViewModel {
  loading: boolean;
  applicationId: string | null;
  application: Document<Application> | null;
}

const initialState: ViewModel = {
  loading: false,
  applicationId: null,
  application: null,
};

@Injectable()
export class ApplicationStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly application$ = this.select(({ application }) => application);

  constructor(
    private readonly _applicationApiService: ApplicationApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadApplication(this.applicationId$);
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
        return EMPTY;
      }

      this.patchState({ loading: true, application: null });

      return this._applicationApiService.findById(applicationId).pipe(
        tapResponse(
          (application) => {
            this.patchState({
              loading: false,
              application,
            });
          },
          (error) => this._notificationStore.setError({ error })
        )
      );
    })
  );
}
