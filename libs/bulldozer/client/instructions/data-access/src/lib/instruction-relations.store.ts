import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { InstructionRelation, Relation } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, switchMap } from 'rxjs';
import { InstructionRelationApiService } from './instruction-relation-api.service';
import { ItemView } from './types';

export type InstructionRelationItemView = ItemView<
  Relation<InstructionRelation>
>;

interface ViewModel {
  loading: boolean;
  instructionRelationIds: string[] | null;
  instructionRelationsMap: Map<string, InstructionRelationItemView>;
}

const initialState: ViewModel = {
  loading: false,
  instructionRelationIds: null,
  instructionRelationsMap: new Map<string, InstructionRelationItemView>(),
};

@Injectable()
export class InstructionRelationsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly instructionRelationIds$ = this.select(
    ({ instructionRelationIds }) => instructionRelationIds
  );
  readonly instructionRelationsMap$ = this.select(
    ({ instructionRelationsMap }) => instructionRelationsMap
  );
  readonly instructionRelations$ = this.select(
    this.instructionRelationsMap$,
    (instructionRelationsMap) =>
      Array.from(
        instructionRelationsMap,
        ([, instructionRelation]) => instructionRelation
      )
  );

  constructor(
    private readonly _instructionRelationApiService: InstructionRelationApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadInstructionRelations(this.instructionRelationIds$);
  }

  private readonly _setInstructionRelation =
    this.updater<InstructionRelationItemView>(
      (state, newInstructionRelation) => {
        const instructionRelationsMap = new Map(state.instructionRelationsMap);
        instructionRelationsMap.set(
          newInstructionRelation.document.id,
          newInstructionRelation
        );

        return {
          ...state,
          instructionRelationsMap,
        };
      }
    );

  private readonly _patchStatus = this.updater<{
    instructionRelationId: string;
    statuses: {
      isCreating?: boolean;
      isUpdating?: boolean;
      isDeleting?: boolean;
    };
  }>((state, { instructionRelationId, statuses }) => {
    const instructionRelationsMap = new Map(state.instructionRelationsMap);
    const instructionRelation = instructionRelationsMap.get(
      instructionRelationId
    );

    if (instructionRelation === undefined) {
      return state;
    }

    return {
      ...state,
      instructionRelationsMap: instructionRelationsMap.set(
        instructionRelationId,
        {
          ...instructionRelation,
          ...statuses,
        }
      ),
    };
  });

  private readonly _removeInstructionRelation = this.updater<string>(
    (state, instructionRelationId) => {
      const instructionRelationsMap = new Map(state.instructionRelationsMap);
      instructionRelationsMap.delete(instructionRelationId);
      return {
        ...state,
        instructionRelationsMap,
      };
    }
  );

  private readonly _loadInstructionRelations = this.effect<string[] | null>(
    switchMap((instructionRelationIds) => {
      if (instructionRelationIds === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._instructionRelationApiService
        .findByIds(instructionRelationIds)
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
                      instructionRelationsMap.set(instructionRelation.id, {
                        document: instructionRelation,
                        isCreating: false,
                        isUpdating: false,
                        isDeleting: false,
                      }),
                    new Map<string, InstructionRelationItemView>()
                  ),
              });
            },
            (error) => this._notificationStore.setError({ error })
          )
        );
    })
  );

  readonly setInstructionRelationIds = this.updater<string[] | null>(
    (state, instructionRelationIds) => ({
      ...state,
      instructionRelationIds,
    })
  );

  readonly dispatch = this.effect<InstructionStatus>(
    concatMap((instructionRelationStatus) => {
      const instructionRelationAccountMeta =
        instructionRelationStatus.accounts.find(
          (account) => account.name === 'Relation'
        );

      if (instructionRelationAccountMeta === undefined) {
        return EMPTY;
      }

      switch (instructionRelationStatus.name) {
        case 'createInstructionRelation': {
          if (instructionRelationStatus.status === 'finalized') {
            this._patchStatus({
              instructionRelationId: instructionRelationAccountMeta.pubkey,
              statuses: {
                isCreating: false,
              },
            });

            return EMPTY;
          }

          return this._instructionRelationApiService
            .findById(instructionRelationAccountMeta.pubkey, 'confirmed')
            .pipe(
              isNotNullOrUndefined,
              tapResponse(
                (instructionRelation) =>
                  this._setInstructionRelation({
                    document: instructionRelation,
                    isCreating: true,
                    isUpdating: false,
                    isDeleting: false,
                  }),
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'deleteInstructionRelation': {
          if (instructionRelationStatus.status === 'confirmed') {
            this._patchStatus({
              instructionRelationId: instructionRelationAccountMeta.pubkey,
              statuses: { isDeleting: true },
            });
          } else {
            this._removeInstructionRelation(
              instructionRelationAccountMeta.pubkey
            );
          }

          return EMPTY;
        }
        default:
          return EMPTY;
      }
    })
  );
}
