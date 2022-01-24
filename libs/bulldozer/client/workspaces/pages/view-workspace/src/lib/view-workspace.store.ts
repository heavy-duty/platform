import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import {
  BulldozerProgramStore,
  WorkspaceStore,
} from '@heavy-duty/bulldozer-store';
import { TabStore } from '@heavy-duty/bulldozer/application/data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rx-solana';
import { ComponentStore } from '@ngrx/component-store';
import { combineLatest } from 'rxjs';
import { filter, map, startWith, tap } from 'rxjs/operators';

@Injectable()
export class ViewWorkspaceStore extends ComponentStore<object> {
  readonly workspace$ = this.select(
    this._bulldozerProgramStore.workspaceId$,
    this._workspaceStore.workspaces$,
    (workspaceId, workspaces) =>
      workspaces.find((workspace) => workspace.id === workspaceId)
  );

  constructor(
    private readonly _bulldozerProgramStore: BulldozerProgramStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _router: Router,
    private readonly _tabStore: TabStore
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
