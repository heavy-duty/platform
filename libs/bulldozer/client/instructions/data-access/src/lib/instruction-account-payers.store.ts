import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  Document,
  InstructionAccountPayer,
} from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { List, Map } from 'immutable';
import { EMPTY, switchMap } from 'rxjs';
import { InstructionAccountPayerApiService } from './instruction-account-payer-api.service';

interface ViewModel {
  loading: boolean;
  instructionAccountPayerIds: List<string> | null;
  instructionAccountPayersMap: Map<
    string,
    Document<InstructionAccountPayer>
  > | null;
}

const initialState: ViewModel = {
  loading: false,
  instructionAccountPayerIds: null,
  instructionAccountPayersMap: null,
};

@Injectable()
export class InstructionAccountPayersStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly instructionAccountPayerIds$ = this.select(
    ({ instructionAccountPayerIds }) => instructionAccountPayerIds
  );
  readonly instructionAccountPayersMap$ = this.select(
    ({ instructionAccountPayersMap }) => instructionAccountPayersMap
  );
  readonly instructionAccountPayers$ = this.select(
    this.instructionAccountPayersMap$,
    (instructionAccountPayersMap) =>
      instructionAccountPayersMap === null
        ? null
        : instructionAccountPayersMap.toList()
  );

  constructor(
    private readonly _instructionAccountPayerApiService: InstructionAccountPayerApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadInstructionAccountPayers(this.instructionAccountPayerIds$);
  }

  readonly setInstructionAccountPayerIds = this.updater<List<string> | null>(
    (state, instructionAccountPayerIds) => ({
      ...state,
      instructionAccountPayerIds,
    })
  );

  private readonly _loadInstructionAccountPayers =
    this.effect<List<string> | null>(
      switchMap((instructionAccountPayerIds) => {
        if (instructionAccountPayerIds === null) {
          return EMPTY;
        }

        return this._instructionAccountPayerApiService
          .findByIds(instructionAccountPayerIds.toArray())
          .pipe(
            tapResponse(
              (instructionAccountPayers) => {
                this.patchState({
                  loading: false,
                  instructionAccountPayersMap: instructionAccountPayers
                    .filter(
                      (
                        instructionAccountPayer
                      ): instructionAccountPayer is Document<InstructionAccountPayer> =>
                        instructionAccountPayer !== null
                    )
                    .reduce(
                      (instructionAccountPayersMap, instructionAccountPayer) =>
                        instructionAccountPayersMap.set(
                          instructionAccountPayer.id,
                          instructionAccountPayer
                        ),
                      Map<string, Document<InstructionAccountPayer>>()
                    ),
                });
              },
              (error) => this._notificationStore.setError({ error })
            )
          );
      })
    );
}
