import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionRelationFilters } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { EMPTY, switchMap } from 'rxjs';
import { InstructionRelationApiService } from './instruction-relation-api.service';

interface ViewModel {
  loading: boolean;
  instructionRelationIds: string[] | null;
  filters: InstructionRelationFilters | null;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  instructionRelationIds: null,
};

@Injectable()
export class InstructionRelationQueryStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly instructionRelationIds$ = this.select(
    ({ instructionRelationIds }) => instructionRelationIds
  );

  constructor(
    private readonly _instructionRelationApiService: InstructionRelationApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadInstructionRelationIds(this.filters$);
  }

  private readonly _loadInstructionRelationIds =
    this.effect<InstructionRelationFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        this.patchState({ loading: true });

        return this._instructionRelationApiService.findIds(filters).pipe(
          tapResponse(
            (instructionRelationIds) => {
              this.patchState({
                instructionRelationIds,
                loading: false,
              });
            },
            (error) => this._notificationStore.setError(error)
          )
        );
      })
    );

  readonly setFilters = this.updater<InstructionRelationFilters | null>(
    (state, filters) => ({
      ...state,
      filters,
    })
  );
}
