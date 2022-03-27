import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionAccountFilters } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { InstructionAccountApiService } from './instruction-account-api.service';

interface ViewModel {
  loading: boolean;
  instructionAccountIds: string[] | null;
  filters: InstructionAccountFilters | null;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  instructionAccountIds: null,
};

@Injectable()
export class InstructionAccountQueryStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly instructionAccountIds$ = this.select(
    ({ instructionAccountIds }) => instructionAccountIds
  );

  constructor(
    private readonly _instructionAccountApiService: InstructionAccountApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadInstructionAccountIds(this.filters$);
  }

  private readonly _loadInstructionAccountIds =
    this.effect<InstructionAccountFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        this.patchState({ loading: true });

        return this._instructionAccountApiService.findIds(filters).pipe(
          tapResponse(
            (instructionAccountIds) => {
              this.patchState({
                instructionAccountIds,
                loading: false,
              });
            },
            (error) => this._notificationStore.setError(error)
          )
        );
      })
    );

  readonly setFilters = this.updater<InstructionAccountFilters | null>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );
}
