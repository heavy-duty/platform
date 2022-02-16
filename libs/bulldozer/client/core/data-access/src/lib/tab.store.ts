import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSolanaConfigStore } from '@heavy-duty/ngx-solana';
import { ComponentStore } from '@ngrx/component-store';
import {
  concatMap,
  distinctUntilChanged,
  of,
  pairwise,
  pipe,
  tap,
  withLatestFrom,
} from 'rxjs';

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
    private readonly _router: Router,
    private readonly _configStore: NgxSolanaConfigStore
  ) {
    super(initialState);

    this._handleNetworkChanges(this._configStore.selectedNetwork$);
  }

  private readonly _removeTab = this.updater<string>((state, tabId) => ({
    ...state,
    tabs: state.tabs.filter((tab) => tab.id !== tabId),
  }));

  private readonly _handleNetworkChanges = this.effect(
    pipe(
      distinctUntilChanged(),
      pairwise(),
      tap(() =>
        this.patchState({
          tabs: [],
          selected: null,
        })
      )
    )
  );

  readonly openTab = this.updater<Tab>((state, newTab) => {
    const oldTab = state.tabs.find((tab) => tab.id === newTab.id);

    return {
      ...state,
      tabs: oldTab ? state.tabs : [...state.tabs, newTab],
      selected: newTab.id,
    };
  });

  readonly closeTab = this.effect<string>(
    pipe(
      tap((tabId) => this._removeTab(tabId)),
      concatMap(() =>
        of(null).pipe(
          withLatestFrom(this.tabs$, (_, tabs) =>
            tabs.length > 0 ? tabs[0] : null
          )
        )
      ),
      tap((tab) => {
        if (tab) {
          this._router.navigateByUrl(tab.url);
        } else {
          this._router.navigate(['/']);
        }
      })
    )
  );
}
