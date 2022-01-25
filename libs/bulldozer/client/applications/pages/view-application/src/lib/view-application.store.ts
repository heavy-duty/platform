import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { ApplicationStore } from '@heavy-duty/bulldozer-store';
import {
  RouteStore,
  TabStore,
} from '@heavy-duty/bulldozer/application/data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rx-solana';
import { ComponentStore } from '@ngrx/component-store';
import { combineLatest } from 'rxjs';
import { filter, map, startWith, tap } from 'rxjs/operators';

@Injectable()
export class ViewApplicationStore extends ComponentStore<object> {
  readonly application$ = this.select(
    this._routeStore.applicationId$,
    this._applicationStore.applications$,
    (applicationId, applications) =>
      applications.find((application) => application.id === applicationId)
  );

  constructor(
    private readonly _applicationStore: ApplicationStore,
    private readonly _router: Router,
    private readonly _tabStore: TabStore,
    private readonly _routeStore: RouteStore
  ) {
    super({});
  }

  readonly openTab$ = this.effect(() =>
    combineLatest([
      this._router.events.pipe(
        filter(
          (event): event is NavigationStart => event instanceof NavigationStart
        ),
        map((event) => event.url),
        startWith(this._router.routerState.snapshot.url),
        map((url) => url.split('/').filter((segment) => segment)),
        filter(
          (urlAsArray) =>
            urlAsArray.length === 2 && urlAsArray[0] === 'applications'
        )
      ),
      this.application$.pipe(isNotNullOrUndefined),
    ]).pipe(
      tap(([, application]) =>
        this._tabStore.openTab({
          id: application.id,
          label: application.name,
          url: `/applications/${application.id}`,
        })
      )
    )
  );
}
