import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, of, Subject } from 'rxjs';
import { concatMap, filter, tap, withLatestFrom } from 'rxjs/operators';

import { ApplicationStore } from './application.store';
import { CollectionStore } from './collection.store';
import { InstructionStore } from './instruction.store';

export type TabKind = 'collections' | 'instructions';

export interface Tab {
  kind: TabKind;
  id: string;
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
export class TabsStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  readonly tabs$ = this.select(
    this.select(({ tabs }) => tabs),
    this._collectionStore.collections$,
    this._instructionStore.instructions$,
    (tabs, collections, instructions) =>
      tabs.map((tab) => ({
        ...tab,
        title:
          tab.kind === 'collections'
            ? collections.find(({ id }) => id === tab.id)?.data.name
            : instructions.find(({ id }) => id === tab.id)?.data.name,
      }))
  );

  readonly selected$ = this.select(({ selected }) => selected, {
    debounce: true,
  });
  readonly tab$ = this.select(
    this.tabs$,
    this.selected$,
    (tabs, selected) => tabs.find(({ id }) => id === selected) || null
  );

  constructor(
    private readonly _applicationStore: ApplicationStore,
    private readonly _collectionStore: CollectionStore,
    private readonly _instructionStore: InstructionStore,
    private readonly _router: Router
  ) {
    super(initialState);
  }

  openCollectionTab = this.effect(() =>
    this._collectionStore.collectionId$.pipe(
      isNotNullOrUndefined,
      tap((collectionId) => this.patchState({ selected: collectionId })),
      concatMap((collectionId) =>
        of(collectionId).pipe(
          withLatestFrom(this.tabs$),
          filter(([, tabs]) => !tabs.some(({ id }) => id === collectionId)),
          tap(([, tabs]) =>
            this.patchState({
              tabs: [...tabs, { id: collectionId, kind: 'collections' }],
            })
          )
        )
      )
    )
  );

  openInstructionTab = this.effect(() =>
    this._instructionStore.instructionId$.pipe(
      isNotNullOrUndefined,
      tap((instructionId) => this.patchState({ selected: instructionId })),
      concatMap((instructionId) =>
        of(instructionId).pipe(
          withLatestFrom(this.tabs$),
          filter(([, tabs]) => !tabs.some(({ id }) => id === instructionId)),
          tap(([, tabs]) =>
            this.patchState({
              tabs: [...tabs, { id: instructionId, kind: 'instructions' }],
            })
          )
        )
      )
    )
  );

  clearTabs = this.updater((state) => ({
    ...state,
    tabs: [],
    selected: null,
  }));

  closeTab = this.effect((tabId$: Observable<string>) =>
    tabId$.pipe(
      concatMap((tabId) =>
        of(tabId).pipe(
          withLatestFrom(
            this.tabs$,
            this.selected$,
            this._applicationStore.applicationId$
          )
        )
      ),
      tap(([tabId, tabs, selectedTab, applicationId]) => {
        const filteredTabs = tabs.filter((tab) => tab.id !== tabId);

        if (filteredTabs?.length === 0) {
          this._router.navigate(['/applications', applicationId]);
          this.patchState({
            selected: null,
            tabs: [],
          });
          this._collectionStore.selectCollection(null);
          this._instructionStore.selectInstruction(null);
        } else {
          const firstTab = filteredTabs ? filteredTabs[0] : null;

          if (firstTab && tabId === selectedTab) {
            this._router.navigate([
              '/applications',
              applicationId,
              firstTab.kind,
              firstTab.id,
            ]);
            this.patchState({
              selected: firstTab.id,
              tabs: filteredTabs,
            });
          } else {
            this.patchState({
              tabs: filteredTabs,
            });
          }
        }
      })
    )
  );
}
