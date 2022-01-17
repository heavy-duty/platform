import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Document, Workspace } from '@heavy-duty/bulldozer-devkit';
import {
  ApplicationDeleted,
  ApplicationUpdated,
  BulldozerActions,
  BulldozerProgramStore,
  CollectionDeleted,
  CollectionUpdated,
  InstructionDeleted,
  InstructionUpdated,
  WorkspaceDeleted,
  WorkspaceUpdated,
} from '@heavy-duty/bulldozer-store';
import { isNotNullOrUndefined } from '@heavy-duty/rx-solana';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, of } from 'rxjs';
import { concatMap, filter, tap, withLatestFrom } from 'rxjs/operators';

export interface Tab {
  id: string;
  label: string;
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
    private readonly _bulldozerProgramStore: BulldozerProgramStore,
    private readonly _router: Router
  ) {
    super(initialState);
  }

  private readonly _selectTab = this.updater((state, selected: string) => ({
    ...state,
    selected,
  }));

  private readonly _setTabLabel = this.updater(
    (state, { tabId, label }: { tabId: string; label: string }) => ({
      ...state,
      tabs: state.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, label } : tab
      ),
    })
  );

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

  readonly keepTabsUpdated = this.effect(() =>
    this._bulldozerProgramStore.events$.pipe(
      filter(
        (
          event: BulldozerActions
        ): event is
          | WorkspaceUpdated
          | ApplicationUpdated
          | CollectionUpdated
          | InstructionUpdated =>
          event instanceof WorkspaceUpdated ||
          event instanceof ApplicationUpdated ||
          event instanceof CollectionUpdated ||
          event instanceof InstructionUpdated
      ),
      tap((event) =>
        this._setTabLabel({
          tabId: event.payload.id,
          label: event.payload.name,
        })
      )
    )
  );

  readonly closeTabsOnDelete = this.effect(() =>
    this._bulldozerProgramStore.events$.pipe(
      filter(
        (
          event: BulldozerActions
        ): event is
          | WorkspaceDeleted
          | ApplicationDeleted
          | CollectionDeleted
          | InstructionDeleted =>
          event instanceof WorkspaceDeleted ||
          event instanceof ApplicationDeleted ||
          event instanceof CollectionDeleted ||
          event instanceof InstructionDeleted
      ),
      tap((event) => this.closeTab(event.payload))
    )
  );

  readonly closeTab = this.effect((tabId$: Observable<string>) =>
    tabId$.pipe(
      tap((tabId) => this._removeTab(tabId)),
      concatMap(() =>
        of(null).pipe(
          withLatestFrom(this.tabs$, (_, tabs) =>
            tabs.length > 0 ? tabs[0] : null
          )
        )
      ),
      isNotNullOrUndefined,
      tap((tab) => this._router.navigateByUrl(tab.url))
    )
  );
}
