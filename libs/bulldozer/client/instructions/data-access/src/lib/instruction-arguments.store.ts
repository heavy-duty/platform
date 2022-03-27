import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { Document, InstructionArgument } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, switchMap } from 'rxjs';
import { InstructionArgumentApiService } from './instruction-argument-api.service';
import { ItemView } from './types';

export type InstructionArgumentItemView = ItemView<
  Document<InstructionArgument>
>;

interface ViewModel {
  loading: boolean;
  instructionArgumentIds: string[] | null;
  instructionArgumentsMap: Map<string, InstructionArgumentItemView>;
}

const initialState: ViewModel = {
  loading: false,
  instructionArgumentIds: null,
  instructionArgumentsMap: new Map<string, InstructionArgumentItemView>(),
};

@Injectable()
export class InstructionArgumentsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly instructionArgumentIds$ = this.select(
    ({ instructionArgumentIds }) => instructionArgumentIds
  );
  readonly instructionArgumentsMap$ = this.select(
    ({ instructionArgumentsMap }) => instructionArgumentsMap
  );
  readonly instructionArguments$ = this.select(
    this.instructionArgumentsMap$,
    (instructionArgumentsMap) =>
      Array.from(
        instructionArgumentsMap,
        ([, instructionArgument]) => instructionArgument
      )
  );

  constructor(
    private readonly _instructionArgumentApiService: InstructionArgumentApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadInstructionArguments(this.instructionArgumentIds$);
  }

  private readonly _setInstructionArgument =
    this.updater<InstructionArgumentItemView>(
      (state, newInstructionArgument) => {
        const instructionArgumentsMap = new Map(state.instructionArgumentsMap);
        instructionArgumentsMap.set(
          newInstructionArgument.document.id,
          newInstructionArgument
        );

        return {
          ...state,
          instructionArgumentsMap,
        };
      }
    );

  private readonly _patchStatus = this.updater<{
    instructionArgumentId: string;
    statuses: {
      isCreating?: boolean;
      isUpdating?: boolean;
      isDeleting?: boolean;
    };
  }>((state, { instructionArgumentId, statuses }) => {
    const instructionArgumentsMap = new Map(state.instructionArgumentsMap);
    const instructionArgument = instructionArgumentsMap.get(
      instructionArgumentId
    );

    if (instructionArgument === undefined) {
      return state;
    }

    return {
      ...state,
      instructionArgumentsMap: instructionArgumentsMap.set(
        instructionArgumentId,
        {
          ...instructionArgument,
          ...statuses,
        }
      ),
    };
  });

  private readonly _removeInstructionArgument = this.updater<string>(
    (state, instructionArgumentId) => {
      const instructionArgumentsMap = new Map(state.instructionArgumentsMap);
      instructionArgumentsMap.delete(instructionArgumentId);
      return {
        ...state,
        instructionArgumentsMap,
      };
    }
  );

  private readonly _loadInstructionArguments = this.effect<string[] | null>(
    switchMap((instructionArgumentIds) => {
      if (instructionArgumentIds === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._instructionArgumentApiService
        .findByIds(instructionArgumentIds)
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
                      instructionArgumentsMap.set(instructionArgument.id, {
                        document: instructionArgument,
                        isCreating: false,
                        isUpdating: false,
                        isDeleting: false,
                      }),
                    new Map<string, InstructionArgumentItemView>()
                  ),
              });
            },
            (error) => this._notificationStore.setError({ error })
          )
        );
    })
  );

  readonly setInstructionArgumentIds = this.updater<string[] | null>(
    (state, instructionArgumentIds) => ({
      ...state,
      instructionArgumentIds,
    })
  );

  readonly dispatch = this.effect<InstructionStatus>(
    concatMap((instructionArgumentStatus) => {
      const instructionArgumentAccountMeta =
        instructionArgumentStatus.accounts.find(
          (account) => account.name === 'Argument'
        );

      if (instructionArgumentAccountMeta === undefined) {
        return EMPTY;
      }

      switch (instructionArgumentStatus.name) {
        case 'createInstructionArgument': {
          if (instructionArgumentStatus.status === 'finalized') {
            this._patchStatus({
              instructionArgumentId: instructionArgumentAccountMeta.pubkey,
              statuses: {
                isCreating: false,
              },
            });

            return EMPTY;
          }

          return this._instructionArgumentApiService
            .findById(instructionArgumentAccountMeta.pubkey, 'confirmed')
            .pipe(
              isNotNullOrUndefined,
              tapResponse(
                (instructionArgument) =>
                  this._setInstructionArgument({
                    document: instructionArgument,
                    isCreating: true,
                    isUpdating: false,
                    isDeleting: false,
                  }),
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'updateInstructionArgument': {
          if (instructionArgumentStatus.status === 'finalized') {
            this._patchStatus({
              instructionArgumentId: instructionArgumentAccountMeta.pubkey,
              statuses: {
                isUpdating: false,
              },
            });

            return EMPTY;
          }

          return this._instructionArgumentApiService
            .findById(instructionArgumentAccountMeta.pubkey, 'confirmed')
            .pipe(
              isNotNullOrUndefined,
              tapResponse(
                (instructionArgument) =>
                  this._setInstructionArgument({
                    document: instructionArgument,
                    isCreating: false,
                    isUpdating: true,
                    isDeleting: false,
                  }),
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'deleteInstructionArgument': {
          if (instructionArgumentStatus.status === 'confirmed') {
            this._patchStatus({
              instructionArgumentId: instructionArgumentAccountMeta.pubkey,
              statuses: { isDeleting: true },
            });
          } else {
            this._removeInstructionArgument(
              instructionArgumentAccountMeta.pubkey
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
