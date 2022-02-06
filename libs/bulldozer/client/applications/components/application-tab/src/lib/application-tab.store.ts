import { Injectable } from '@angular/core';
import {
  ApplicationApiService,
  ApplicationSocketService,
} from '@bulldozer-client/applications-data-access';
import { Application, Document } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, Observable, of, startWith, switchMap, tap } from 'rxjs';

interface ViewModel {
  application: Document<Application> | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  application: null,
  error: null,
};

@Injectable()
export class ApplicationTabStore extends ComponentStore<ViewModel> {
  readonly application$ = this.select(({ application }) => application);

  constructor(
    private readonly _applicationApiService: ApplicationApiService,
    private readonly _applicationSocketService: ApplicationSocketService
  ) {
    super(initialState);
  }

  readonly loadApplication$ = this.effect(
    (applicationId$: Observable<string | null>) =>
      applicationId$.pipe(
        switchMap((applicationId) => {
          if (applicationId === null) {
            return of(null);
          }

          console.log('am I called?', applicationId);

          return this._applicationApiService
            .findByPublicKey(applicationId)
            .pipe(
              concatMap((application) => {
                if (!application) {
                  return of(null);
                }

                return this._applicationSocketService
                  .applicationChanges(applicationId)
                  .pipe(
                    tap({
                      next: (app) => console.log('app changed', app),
                      complete: () => console.log('i complete'),
                      unsubscribe: () => console.log('i unsubscribe'),
                    }),
                    startWith(application)
                  );
              })
            );
        }),
        tapResponse(
          (application) => this.patchState({ application }),
          (error) => this.patchState({ error })
        )
      )
  );
}
