import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  InstructionRelation,
  InstructionRelationFilters,
  Relation,
} from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { List, Map } from 'immutable';
import { EMPTY, switchMap } from 'rxjs';
import { InstructionRelationApiService } from './instruction-relation-api.service';

interface ViewModel {
  loading: boolean;
  filters: InstructionRelationFilters | null;
  instructionRelationIds: List<string> | null;
  instructionRelationsMap: Map<string, Relation<InstructionRelation>> | null;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  instructionRelationIds: null,
  instructionRelationsMap: null,
};

@Injectable()
export class InstructionRelationsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly instructionRelationIds$ = this.select(
    ({ instructionRelationIds }) => instructionRelationIds
  );
  readonly instructionRelationsMap$ = this.select(
    ({ instructionRelationsMap }) => instructionRelationsMap
  );
  readonly instructionRelations$ = this.select(
    this.instructionRelationsMap$,
    (instructionRelationsMap) =>
      instructionRelationsMap === null
        ? null
        : instructionRelationsMap
            .toList()
            .sort((a, b) => (b.createdAt.lt(a.createdAt) ? 1 : -1))
  );

  constructor(
    private readonly _instructionRelationApiService: InstructionRelationApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadInstructionRelations(this.instructionRelationIds$);
    this._loadInstructionRelationIds(this.filters$);
  }

  readonly setFilters = this.updater<InstructionRelationFilters | null>(
    (state, filters) => ({
      ...state,
      filters,
      instructionRelationIds: null,
      instructionRelationsMap: null,
    })
  );

  private readonly _loadInstructionRelationIds =
    this.effect<InstructionRelationFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        this.patchState({
          loading: true,
          instructionRelationsMap: null,
        });

        return this._instructionRelationApiService.findIds(filters).pipe(
          tapResponse(
            (instructionRelationIds) => {
              this.patchState({
                instructionRelationIds: List(instructionRelationIds),
              });
            },
            (error) => this._notificationStore.setError(error)
          )
        );
      })
    );

  private readonly _loadInstructionRelations = this.effect<List<string> | null>(
    switchMap((instructionRelationIds) => {
      if (instructionRelationIds === null) {
        return EMPTY;
      }

      return this._instructionRelationApiService
        .findByIds(instructionRelationIds.toArray())
        .pipe(
          tapResponse(
            (instructionRelations) => {
              this.patchState({
                loading: false,
                instructionRelationsMap: instructionRelations
                  .filter(
                    (
                      instructionRelation
                    ): instructionRelation is Relation<InstructionRelation> =>
                      instructionRelation !== null
                  )
                  .reduce(
                    (instructionRelationsMap, instructionRelation) =>
                      instructionRelationsMap.set(
                        instructionRelation.id,
                        instructionRelation
                      ),
                    Map<string, Relation<InstructionRelation>>()
                  ),
              });
            },
            (error) => this._notificationStore.setError({ error })
          )
        );
    })
  );
}
