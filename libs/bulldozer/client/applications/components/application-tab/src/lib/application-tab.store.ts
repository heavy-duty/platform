import { Injectable } from '@angular/core';
import { ApplicationStore } from '@bulldozer-client/applications-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { Application, Document } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore } from '@ngrx/component-store';
import { filter, pairwise, pipe, tap } from 'rxjs';

@Injectable()
export class ApplicationTabStore extends ComponentStore<object> {
  constructor(
    private readonly _tabStore: TabStore,
    applicationStore: ApplicationStore
  ) {
    super({});

    this._handleApplicationDeleted(applicationStore.application$);
  }

  private readonly _handleApplicationDeleted =
    this.effect<Document<Application> | null>(
      pipe(
        pairwise(),
        filter(
          ([previousApplication, currentApplication]) =>
            previousApplication !== null && currentApplication === null
        ),
        tap(([application]) => {
          if (application !== null) {
            this._tabStore.closeTab(application.id);
          }
        })
      )
    );

  closeTab(tabId: string) {
    this._tabStore.closeTab(tabId);
  }
}
