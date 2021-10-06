import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  Collection,
  Instruction,
  ProgramStore,
} from '@heavy-duty/bulldozer/data-access';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Observable, of, Subject } from 'rxjs';
import { concatMap, filter, tap, withLatestFrom } from 'rxjs/operators';

import { ApplicationStore } from './application.store';
import { CollectionStore } from './collection.store';
import { InstructionStore } from './instruction.store';

export type TabKind = 'collections' | 'instructions';

interface ViewModel {
  tabs: ({ kind: TabKind } & (Collection | Instruction))[];
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
    private readonly _programStore: ProgramStore,
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
          filter(
            ([collectionId, tabs]) =>
              !tabs.some(({ id }) => id === collectionId)
          )
        )
      ),
      concatMap(([collectionId, tabs]) =>
        this._programStore.getCollection(collectionId).pipe(
          tapResponse(
            (collection) =>
              this.patchState({
                tabs: [...tabs, { ...collection, kind: 'collections' }],
              }),
            (error) => this._error.next(error)
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
          filter(
            ([instructionId, tabs]) =>
              !tabs.some(({ id }) => id === instructionId)
          )
        )
      ),
      concatMap(([instructionId, tabs]) =>
        this._programStore.getInstruction(instructionId).pipe(
          tapResponse(
            (instruction) =>
              this.patchState({
                tabs: [...tabs, { ...instruction, kind: 'instructions' }],
              }),
            (error) => this._error.next(error)
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
