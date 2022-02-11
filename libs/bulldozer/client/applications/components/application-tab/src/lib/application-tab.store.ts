import { Injectable } from '@angular/core';
import {
  ApplicationApiService,
  ApplicationSocketService,
} from '@bulldozer-client/applications-data-access';
import { NotificationStore } from '@bulldozer-client/core-data-access';
import { Application, Document } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, startWith, switchMap } from 'rxjs';

interface ViewModel {
  applicationId: string | null;
  application: Document<Application> | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  applicationId: null,
  application: null,
  error: null,
};

@Injectable()
export class ApplicationTabStore extends ComponentStore<ViewModel> {
  private readonly _applicationId$ = this.select(
    ({ applicationId }) => applicationId
  );
  readonly application$ = this.select(({ application }) => application);

  constructor(
    private readonly _applicationApiService: ApplicationApiService,
    private readonly _applicationSocketService: ApplicationSocketService,
    private readonly _notificationService: NotificationStore
  ) {
    super(initialState);
  }

  readonly setApplicationId = this.updater(
    (state, applicationId: string | null) => ({ ...state, applicationId })
  );

  protected readonly loadApplication = this.effect(() =>
    this._applicationId$.pipe(
      switchMap((applicationId) => {
        if (applicationId === null) {
          return EMPTY;
        }

        return this._applicationApiService.findById(applicationId).pipe(
          concatMap((application) =>
            this._applicationSocketService
              .applicationChanges(applicationId)
              .pipe(startWith(application))
          ),
          tapResponse(
            (application) => this.patchState({ application }),
            (error) => this._notificationService.setError({ error })
          )
        );
      })
    )
  );
}
