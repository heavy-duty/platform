import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  Document,
  InstructionAccountCollection,
} from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { List, Map } from 'immutable';
import { EMPTY, switchMap } from 'rxjs';
import { InstructionAccountCollectionApiService } from './instruction-account-collection-api.service';

interface ViewModel {
  loading: boolean;
  instructionAccountCollectionIds: List<string> | null;
  instructionAccountCollectionsMap: Map<
    string,
    Document<InstructionAccountCollection>
  > | null;
}

const initialState: ViewModel = {
  loading: false,
  instructionAccountCollectionIds: null,
  instructionAccountCollectionsMap: null,
};

@Injectable()
export class InstructionAccountCollectionsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly instructionAccountCollectionIds$ = this.select(
    ({ instructionAccountCollectionIds }) => instructionAccountCollectionIds
  );
  readonly instructionAccountCollectionsMap$ = this.select(
    ({ instructionAccountCollectionsMap }) => instructionAccountCollectionsMap
  );
  readonly instructionAccountCollections$ = this.select(
    this.instructionAccountCollectionsMap$,
    (instructionAccountCollectionsMap) =>
      instructionAccountCollectionsMap === null
        ? null
        : instructionAccountCollectionsMap.toList()
  );

  constructor(
    private readonly _instructionAccountCollectionApiService: InstructionAccountCollectionApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadInstructionAccountCollections(
      this.instructionAccountCollectionIds$
    );
  }

  readonly setInstructionAccountCollectionIds =
    this.updater<List<string> | null>(
      (state, instructionAccountCollectionIds) => ({
        ...state,
        instructionAccountCollectionIds,
      })
    );

  private readonly _loadInstructionAccountCollections =
    this.effect<List<string> | null>(
      switchMap((instructionAccountCollectionIds) => {
        if (instructionAccountCollectionIds === null) {
          return EMPTY;
        }

        return this._instructionAccountCollectionApiService
          .findByIds(instructionAccountCollectionIds.toArray())
          .pipe(
            tapResponse(
              (instructionAccountCollections) => {
                this.patchState({
                  loading: false,
                  instructionAccountCollectionsMap:
                    instructionAccountCollections
                      .filter(
                        (
                          instructionAccountCollection
                        ): instructionAccountCollection is Document<InstructionAccountCollection> =>
                          instructionAccountCollection !== null
                      )
                      .reduce(
                        (
                          instructionAccountCollectionsMap,
                          instructionAccountCollection
                        ) =>
                          instructionAccountCollectionsMap.set(
                            instructionAccountCollection.id,
                            instructionAccountCollection
                          ),
                        Map<string, Document<InstructionAccountCollection>>()
                      ),
                });
              },
              (error) => this._notificationStore.setError({ error })
            )
          );
      })
    );
}
