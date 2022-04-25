import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  Document,
  InstructionAccount,
  InstructionAccountFilters,
} from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { List, Map } from 'immutable';
import { EMPTY, switchMap } from 'rxjs';
import { InstructionAccountApiService } from './instruction-account-api.service';

interface ViewModel {
  loading: boolean;
  filters: InstructionAccountFilters | null;
  instructionAccountIds: List<string> | null;
  instructionAccountsMap: Map<string, Document<InstructionAccount>> | null;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  instructionAccountIds: null,
  instructionAccountsMap: null,
};

@Injectable()
export class InstructionAccountsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly instructionAccountIds$ = this.select(
    ({ instructionAccountIds }) => instructionAccountIds
  );
  readonly instructionAccountsMap$ = this.select(
    ({ instructionAccountsMap }) => instructionAccountsMap
  );
  readonly instructionAccounts$ = this.select(
    this.instructionAccountsMap$,
    (instructionAccountsMap) =>
      instructionAccountsMap === null
        ? null
        : instructionAccountsMap
            .toList()
            .sort((a, b) => (b.createdAt.lt(a.createdAt) ? 1 : -1))
  );

  constructor(
    private readonly _instructionAccountApiService: InstructionAccountApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadInstructionAccounts(this.instructionAccountIds$);
    this._loadInstructionAccountIds(this.filters$);
  }

  readonly setFilters = this.updater<InstructionAccountFilters | null>(
    (state, filters) => ({
      ...state,
      filters,
      instructionAccountIds: null,
      instructionAccountsMap: null,
    })
  );

  private readonly _loadInstructionAccountIds =
    this.effect<InstructionAccountFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        this.patchState({
          loading: true,
          instructionAccountsMap: null,
        });

        return this._instructionAccountApiService.findIds(filters).pipe(
          tapResponse(
            (instructionAccountIds) => {
              this.patchState({
                instructionAccountIds: List(instructionAccountIds),
              });
            },
            (error) => this._notificationStore.setError(error)
          )
        );
      })
    );

  private readonly _loadInstructionAccounts = this.effect<List<string> | null>(
    switchMap((instructionAccountIds) => {
      if (instructionAccountIds === null) {
        return EMPTY;
      }

      if (instructionAccountIds.size === 0) {
        this.patchState({
          loading: false,
          instructionAccountsMap: Map<string, Document<InstructionAccount>>(),
        });

        return EMPTY;
      }

      return this._instructionAccountApiService
        .findByIds(instructionAccountIds.toArray())
        .pipe(
          tapResponse(
            (instructionAccounts) => {
              this.patchState({
                loading: false,
                instructionAccountsMap: instructionAccounts
                  .filter(
                    (
                      instructionAccount
                    ): instructionAccount is Document<InstructionAccount> =>
                      instructionAccount !== null
                  )
                  .reduce(
                    (instructionAccountsMap, instructionAccount) =>
                      instructionAccountsMap.set(
                        instructionAccount.id,
                        instructionAccount
                      ),
                    Map<string, Document<InstructionAccount>>()
                  ),
              });
            },
            (error) => this._notificationStore.setError({ error })
          )
        );
    })
  );
}
