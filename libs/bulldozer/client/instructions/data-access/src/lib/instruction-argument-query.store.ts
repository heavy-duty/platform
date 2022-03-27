import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionArgumentFilters } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { InstructionArgumentApiService } from './instruction-argument-api.service';

interface ViewModel {
  loading: boolean;
  instructionArgumentIds: string[] | null;
  filters: InstructionArgumentFilters | null;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  instructionArgumentIds: null,
};

@Injectable()
export class InstructionArgumentQueryStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly instructionArgumentIds$ = this.select(
    ({ instructionArgumentIds }) => instructionArgumentIds
  );

  constructor(
    private readonly _instructionArgumentApiService: InstructionArgumentApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadInstructionArgumentIds(this.filters$);
  }

  private readonly _loadInstructionArgumentIds =
    this.effect<InstructionArgumentFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        this.patchState({ loading: true });

        return this._instructionArgumentApiService.findIds(filters).pipe(
          tapResponse(
            (instructionArgumentIds) => {
              this.patchState({
                instructionArgumentIds,
                loading: false,
              });
            },
            (error) => this._notificationStore.setError(error)
          )
        );
      })
    );

  readonly setFilters = this.updater<InstructionArgumentFilters | null>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );
}
