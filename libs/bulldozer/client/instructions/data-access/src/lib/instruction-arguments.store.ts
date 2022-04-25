import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  Document,
  InstructionArgument,
  InstructionArgumentFilters,
} from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { List, Map } from 'immutable';
import { EMPTY, switchMap } from 'rxjs';
import { InstructionArgumentApiService } from './instruction-argument-api.service';

interface ViewModel {
  loading: boolean;
  filters: InstructionArgumentFilters | null;
  instructionArgumentIds: List<string> | null;
  instructionArgumentsMap: Map<string, Document<InstructionArgument>> | null;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  instructionArgumentIds: null,
  instructionArgumentsMap: null,
};

@Injectable()
export class InstructionArgumentsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly instructionArgumentIds$ = this.select(
    ({ instructionArgumentIds }) => instructionArgumentIds
  );
  readonly instructionArgumentsMap$ = this.select(
    ({ instructionArgumentsMap }) => instructionArgumentsMap
  );
  readonly instructionArguments$ = this.select(
    this.instructionArgumentsMap$,
    (instructionArgumentsMap) =>
      instructionArgumentsMap === null
        ? null
        : instructionArgumentsMap
            .toList()
            .sort((a, b) => (b.createdAt.lt(a.createdAt) ? 1 : -1))
  );

  constructor(
    private readonly _instructionArgumentApiService: InstructionArgumentApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadInstructionArguments(this.instructionArgumentIds$);
    this._loadInstructionArgumentIds(this.filters$);
  }

  readonly setFilters = this.updater<InstructionArgumentFilters | null>(
    (state, filters) => ({
      ...state,
      filters,
      instructionArgumentIds: null,
      instructionArgumentsMap: null,
    })
  );

  private readonly _loadInstructionArgumentIds =
    this.effect<InstructionArgumentFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        this.patchState({
          loading: true,
          instructionArgumentsMap: null,
        });

        return this._instructionArgumentApiService.findIds(filters).pipe(
          tapResponse(
            (instructionArgumentIds) => {
              this.patchState({
                instructionArgumentIds: List(instructionArgumentIds),
              });
            },
            (error) => this._notificationStore.setError(error)
          )
        );
      })
    );

  private readonly _loadInstructionArguments = this.effect<List<string> | null>(
    switchMap((instructionArgumentIds) => {
      if (instructionArgumentIds === null) {
        return EMPTY;
      }

      return this._instructionArgumentApiService
        .findByIds(instructionArgumentIds.toArray())
        .pipe(
          tapResponse(
            (instructionArguments) => {
              this.patchState({
                loading: false,
                instructionArgumentsMap: instructionArguments
                  .filter(
                    (
                      instructionArgument
                    ): instructionArgument is Document<InstructionArgument> =>
                      instructionArgument !== null
                  )
                  .reduce(
                    (instructionArgumentsMap, instructionArgument) =>
                      instructionArgumentsMap.set(
                        instructionArgument.id,
                        instructionArgument
                      ),
                    Map<string, Document<InstructionArgument>>()
                  ),
              });
            },
            (error) => this._notificationStore.setError({ error })
          )
        );
    })
  );
}
