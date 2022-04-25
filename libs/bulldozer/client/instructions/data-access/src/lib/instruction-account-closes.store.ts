import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  Document,
  InstructionAccountClose,
} from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { List, Map } from 'immutable';
import { EMPTY, switchMap } from 'rxjs';
import { InstructionAccountCloseApiService } from './instruction-account-close-api.service';

interface ViewModel {
  loading: boolean;
  instructionAccountCloseIds: List<string> | null;
  instructionAccountClosesMap: Map<
    string,
    Document<InstructionAccountClose>
  > | null;
}

const initialState: ViewModel = {
  loading: false,
  instructionAccountCloseIds: null,
  instructionAccountClosesMap: null,
};

@Injectable()
export class InstructionAccountClosesStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly instructionAccountCloseIds$ = this.select(
    ({ instructionAccountCloseIds }) => instructionAccountCloseIds
  );
  readonly instructionAccountClosesMap$ = this.select(
    ({ instructionAccountClosesMap }) => instructionAccountClosesMap
  );
  readonly instructionAccountCloses$ = this.select(
    this.instructionAccountClosesMap$,
    (instructionAccountClosesMap) =>
      instructionAccountClosesMap === null
        ? null
        : instructionAccountClosesMap.toList()
  );

  constructor(
    private readonly _instructionAccountCloseApiService: InstructionAccountCloseApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadInstructionAccountCloses(this.instructionAccountCloseIds$);
  }

  readonly setInstructionAccountCloseIds = this.updater<List<string> | null>(
    (state, instructionAccountCloseIds) => ({
      ...state,
      instructionAccountCloseIds,
    })
  );

  private readonly _loadInstructionAccountCloses =
    this.effect<List<string> | null>(
      switchMap((instructionAccountCloseIds) => {
        if (instructionAccountCloseIds === null) {
          return EMPTY;
        }

        return this._instructionAccountCloseApiService
          .findByIds(instructionAccountCloseIds.toArray())
          .pipe(
            tapResponse(
              (instructionAccountCloses) => {
                this.patchState({
                  loading: false,
                  instructionAccountClosesMap: instructionAccountCloses
                    .filter(
                      (
                        instructionAccountClose
                      ): instructionAccountClose is Document<InstructionAccountClose> =>
                        instructionAccountClose !== null
                    )
                    .reduce(
                      (instructionAccountClosesMap, instructionAccountClose) =>
                        instructionAccountClosesMap.set(
                          instructionAccountClose.id,
                          instructionAccountClose
                        ),
                      Map<string, Document<InstructionAccountClose>>()
                    ),
                });
              },
              (error) => this._notificationStore.setError({ error })
            )
          );
      })
    );
}
