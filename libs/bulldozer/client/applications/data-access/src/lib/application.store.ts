import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/core-data-access';
import { Application, Document } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, startWith, switchMap } from 'rxjs';
import { ApplicationApiService } from './application-api.service';
import { ApplicationEventService } from './application-event.service';

interface ViewModel {
  applicationId: string | null;
  application: Document<Application> | null;
}

const initialState: ViewModel = {
  applicationId: null,
  application: null,
};

@Injectable()
export class ApplicationStore extends ComponentStore<ViewModel> {
  readonly application$ = this.select(({ application }) => application);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);

  constructor(
    private readonly _applicationApiService: ApplicationApiService,
    private readonly _applicationEventService: ApplicationEventService,
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

      return this._applicationApiService
        .findById(applicationId)
        .pipe(
          concatMap((application) =>
            this._applicationEventService
              .applicationChanges(applicationId)
              .pipe(startWith(application))
          )
        )
        .pipe(
          tapResponse(
            (application) => this.patchState({ application }),
            (error) => this._notificationStore.setError({ error })
          )
        );
    })
  );
}
