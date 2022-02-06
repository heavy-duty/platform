import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Document, Workspace } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore } from '@ngrx/component-store';
import { concatMap, Observable, of, tap, withLatestFrom } from 'rxjs';
import { RouteStore } from './route.store';

export interface Tab {
  id: string;
  kind: 'workspace' | 'application' | 'collection' | 'instruction';
  url: string;
}

interface ViewModel {
  tabs: Tab[];
  selected: string | null;
}

const initialState: ViewModel = {
  tabs: [],
  selected: null,
};

@Injectable()
export class TabStore extends ComponentStore<ViewModel> {
  readonly tabs$ = this.select(({ tabs }) => tabs);
  readonly selected$ = this.select(({ selected }) => selected, {
    debounce: true,
  });
  readonly tab$ = this.select(
    this.tabs$,
    this.selected$,
    (tabs, selected) => tabs.find(({ id }) => id === selected) || null
  );

  constructor(
    private readonly _routeStore: RouteStore,
    private readonly _router: Router
  ) {
    super(initialState);
  }

  private readonly _removeTab = this.updater((state, tabId: string) => ({
    ...state,
    tabs: state.tabs.filter((tab) => tab.id !== tabId),
  }));

  readonly setWorkspace = this.updater(
    (state, workspace: Document<Workspace>) => ({
      ...state,
      workspace,
    })
  );

  readonly openTab = this.updater((state, newTab: Tab) => {
    const oldTab = state.tabs.find((tab) => tab.id === newTab.id);

    return {
      ...state,
      tabs: oldTab ? state.tabs : [...state.tabs, newTab],
      selected: newTab.id,
    };
  });

  readonly clearTabs = this.updater((state) => ({
    ...state,
    tabs: [],
    selected: null,
  }));

  readonly closeTab = this.effect((tabId$: Observable<string>) =>
    tabId$.pipe(
      tap((tabId) => this._removeTab(tabId)),
      concatMap(() =>
        of(null).pipe(
          withLatestFrom(
            this.tabs$,
            this._routeStore.workspaceId$,
            (_, tabs, workspaceId) => ({
              tab: tabs.length > 0 ? tabs[0] : null,
              workspaceId,
            })
          )
        )
      ),
      tap(({ tab, workspaceId }) => {
        if (tab) {
          this._router.navigateByUrl(tab.url);
        }

        if (!tab && workspaceId) {
          this._router.navigate(['/workspaces', workspaceId]);
        }
      })
    )
  );
}
