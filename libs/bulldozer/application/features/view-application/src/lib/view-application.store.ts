import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import {
  ApplicationStore,
  TabStore,
  WorkspaceStore,
} from '@heavy-duty/bulldozer/application/data-access';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ComponentStore } from '@ngrx/component-store';
import { combineLatest } from 'rxjs';
import { filter, map, startWith, tap } from 'rxjs/operators';

@Injectable()
export class ViewApplicationStore extends ComponentStore<object> {
  readonly application$ = this._applicationStore.application$;

  constructor(
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _applicationStore: ApplicationStore,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _tabStore: TabStore
  ) {
    super({});
  }

  readonly loadWorkspaceId$ = this.effect(() =>
    this._router.events.pipe(
      filter(
        (event): event is NavigationStart => event instanceof NavigationStart
      ),
      map((event) => event.url.split('/').filter((segment) => segment)[1]),
      startWith(this._route.snapshot.paramMap.get('workspaceId')),
      tap((workspaceId) => this._workspaceStore.setWorkspaceId(workspaceId))
    )
  );

  readonly loadApplicationId$ = this.effect(() =>
    this._router.events.pipe(
      filter(
        (event): event is NavigationStart => event instanceof NavigationStart
      ),
      map((event) => event.url.split('/').filter((segment) => segment)[3]),
      startWith(this._route.snapshot.paramMap.get('applicationId')),
      tap((applicationId) =>
        this._applicationStore.setApplicationId(applicationId)
      )
    )
  );

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
            urlAsArray.length === 4 &&
            urlAsArray[0] === 'workspaces' &&
            urlAsArray[2] === 'applications'
        )
      ),
      this.application$.pipe(isNotNullOrUndefined),
    ]).pipe(
      tap(([, application]) =>
        this._tabStore.openTab({
          id: application.id,
          label: application.data.name,
          url: `/workspaces/${application.data.workspace}/applications/${application.id}`,
        })
      )
    )
  );
}
