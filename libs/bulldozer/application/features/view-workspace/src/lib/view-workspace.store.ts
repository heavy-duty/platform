import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import {
  TabStore,
  WorkspaceStore,
} from '@heavy-duty/bulldozer/application/data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rx-solana';
import { ComponentStore } from '@ngrx/component-store';
import { combineLatest } from 'rxjs';
import { filter, map, startWith, tap } from 'rxjs/operators';

@Injectable()
export class ViewWorkspaceStore extends ComponentStore<object> {
  readonly workspace$ = this._workspaceStore.workspace$;

  constructor(
    private readonly _workspaceStore: WorkspaceStore,
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
            urlAsArray.length === 2 && urlAsArray[0] === 'workspaces'
        )
      ),
      this.workspace$.pipe(isNotNullOrUndefined),
    ]).pipe(
      tap(([, workspace]) =>
        this._tabStore.openTab({
          id: workspace.id,
          label: workspace.name,
          url: `/workspaces/${workspace.id}`,
        })
      )
    )
  );
}
