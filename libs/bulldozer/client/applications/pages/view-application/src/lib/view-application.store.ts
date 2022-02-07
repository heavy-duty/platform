import { Injectable } from '@angular/core';
import {
  ApplicationApiService,
  ApplicationSocketService,
} from '@bulldozer-client/applications-data-access';
import { NotificationStore } from '@bulldozer-client/notification-store';
import { TabStore } from '@bulldozer-client/tab-store';
import { Application, Document } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rx-solana';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, startWith, switchMap, tap } from 'rxjs';
import { ViewApplicationRouteStore } from './view-application-route.store';

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
    private readonly _tabStore: TabStore,
    private readonly _applicationApiService: ApplicationApiService,
    private readonly _applicationSocketService: ApplicationSocketService,
    private readonly _viewApplicationRouteStore: ViewApplicationRouteStore,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);
  }

  protected readonly loadApplication = this.effect(() =>
    this._viewApplicationRouteStore.applicationId$.pipe(
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
            (error) => this._notificationStore.setError({ error })
          )
        );
      })
    )
  );

  protected readonly openTab = this.effect(() =>
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
