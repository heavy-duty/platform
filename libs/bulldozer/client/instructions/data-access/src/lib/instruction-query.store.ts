import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionFilters } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { InstructionApiService } from './instruction-api.service';

interface ViewModel {
  loading: boolean;
  instructionIds: string[] | null;
  filters: InstructionFilters | null;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  instructionIds: null,
};

@Injectable()
export class InstructionQueryStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly instructionIds$ = this.select(
    ({ instructionIds }) => instructionIds
  );

  constructor(
    private readonly _instructionApiService: InstructionApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadInstructionIds(this.filters$);
  }

  private readonly _loadInstructionIds = this.effect<InstructionFilters | null>(
    switchMap((filters) => {
      if (filters === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._instructionApiService.findIds(filters).pipe(
        tapResponse(
          (instructionIds) => {
            this.patchState({
              instructionIds,
              loading: false,
            });
          },
          (error) => this._notificationStore.setError(error)
        )
      );
    })
  );

  readonly setFilters = this.updater<InstructionFilters | null>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );
}
