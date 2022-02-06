import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ApplicationApiService,
  ApplicationSocketService,
} from '@bulldozer-client/applications-data-access';
import { Application, Document } from '@heavy-duty/bulldozer-devkit';
import { TabStore } from '@heavy-duty/bulldozer/application/data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rx-solana';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

interface ViewModel {
  application: Document<Application> | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  application: null,
  error: null,
};

@Injectable()
export class ViewApplicationStore extends ComponentStore<ViewModel> {
  readonly application$ = this.select(({ application }) => application);

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _tabStore: TabStore,
    private readonly _applicationApiService: ApplicationApiService,
    private readonly _applicationSocketService: ApplicationSocketService
  ) {
    super(initialState);

    this.loadApplication$(
      this._route.paramMap.pipe(
        map((paramMap) => paramMap.get('applicationId'))
      )
    );
  }

  readonly loadApplication$ = this.effect(
    (applicationId$: Observable<string | null>) =>
      applicationId$.pipe(
        switchMap((applicationId) => {
          if (applicationId === null) {
            return of(null);
          }

          return this._applicationApiService
            .findByPublicKey(applicationId)
            .pipe(
              concatMap((application) => {
                if (!application) {
                  return of(null);
                }

                return this._applicationSocketService
                  .applicationChanges(applicationId)
                  .pipe(startWith(application));
              })
            );
        }),
        tapResponse(
          (application) => this.patchState({ application }),
          (error) => this.patchState({ error })
        )
      )
  );

  readonly openTab$ = this.effect(() =>
    this.application$.pipe(
      isNotNullOrUndefined,
      tap((application) =>
        this._tabStore.openTab({
          id: application.id,
          kind: 'application',
          url: `/workspaces/${application.data.workspace}/applications/${application.id}`,
        })
      )
    )
  );
}
