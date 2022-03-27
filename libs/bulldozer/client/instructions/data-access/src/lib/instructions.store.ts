import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { Document, Instruction } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, switchMap } from 'rxjs';
import { InstructionApiService } from './instruction-api.service';
import { ItemView } from './types';

export type InstructionItemView = ItemView<Document<Instruction>>;

interface ViewModel {
  loading: boolean;
  instructionIds: string[] | null;
  instructionsMap: Map<string, InstructionItemView>;
}

const initialState: ViewModel = {
  loading: false,
  instructionIds: null,
  instructionsMap: new Map<string, InstructionItemView>(),
};

@Injectable()
export class InstructionsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly instructionIds$ = this.select(
    ({ instructionIds }) => instructionIds
  );
  readonly instructionsMap$ = this.select(
    ({ instructionsMap }) => instructionsMap
  );
  readonly instructions$ = this.select(
    this.instructionsMap$,
    (instructionsMap) =>
      Array.from(instructionsMap, ([, instruction]) => instruction)
  );

  constructor(
    private readonly _instructionApiService: InstructionApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadInstructions(this.instructionIds$);
  }

  private readonly _setInstruction = this.updater<InstructionItemView>(
    (state, newInstruction) => {
      const instructionsMap = new Map(state.instructionsMap);
      instructionsMap.set(newInstruction.document.id, newInstruction);

      return {
        ...state,
        instructionsMap,
      };
    }
  );

  private readonly _patchStatus = this.updater<{
    instructionId: string;
    statuses: {
      isCreating?: boolean;
      isUpdating?: boolean;
      isDeleting?: boolean;
    };
  }>((state, { instructionId, statuses }) => {
    const instructionsMap = new Map(state.instructionsMap);
    const instruction = instructionsMap.get(instructionId);

    if (instruction === undefined) {
      return state;
    }

    return {
      ...state,
      instructionsMap: instructionsMap.set(instructionId, {
        ...instruction,
        ...statuses,
      }),
    };
  });

  private readonly _removeInstruction = this.updater<string>(
    (state, instructionId) => {
      const instructionsMap = new Map(state.instructionsMap);
      instructionsMap.delete(instructionId);
      return {
        ...state,
        instructionsMap,
      };
    }
  );

  private readonly _loadInstructions = this.effect<string[] | null>(
    switchMap((instructionIds) => {
      if (instructionIds === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._instructionApiService.findByIds(instructionIds).pipe(
        tapResponse(
          (instructions) => {
            this.patchState({
              loading: false,
              instructionsMap: instructions
                .filter(
                  (instruction): instruction is Document<Instruction> =>
                    instruction !== null
                )
                .reduce(
                  (instructionsMap, instruction) =>
                    instructionsMap.set(instruction.id, {
                      document: instruction,
                      isCreating: false,
                      isUpdating: false,
                      isDeleting: false,
                    }),
                  new Map<string, InstructionItemView>()
                ),
            });
          },
          (error) => this._notificationStore.setError({ error })
        )
      );
    })
  );

  readonly setInstructionIds = this.updater<string[] | null>(
    (state, instructionIds) => ({
      ...state,
      instructionIds,
    })
  );

  readonly dispatch = this.effect<InstructionStatus>(
    concatMap((instructionStatus) => {
      const instructionAccountMeta = instructionStatus.accounts.find(
        (account) => account.name === 'Instruction'
      );

      if (instructionAccountMeta === undefined) {
        return EMPTY;
      }

      switch (instructionStatus.name) {
        case 'createInstruction': {
          if (instructionStatus.status === 'finalized') {
            this._patchStatus({
              instructionId: instructionAccountMeta.pubkey,
              statuses: {
                isCreating: false,
              },
            });

            return EMPTY;
          }

          return this._instructionApiService
            .findById(instructionAccountMeta.pubkey, 'confirmed')
            .pipe(
              isNotNullOrUndefined,
              tapResponse(
                (instruction) =>
                  this._setInstruction({
                    document: instruction,
                    isCreating: true,
                    isUpdating: false,
                    isDeleting: false,
                  }),
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'updateInstruction': {
          if (instructionStatus.status === 'finalized') {
            this._patchStatus({
              instructionId: instructionAccountMeta.pubkey,
              statuses: {
                isUpdating: false,
              },
            });

            return EMPTY;
          }

          return this._instructionApiService
            .findById(instructionAccountMeta.pubkey, 'confirmed')
            .pipe(
              isNotNullOrUndefined,
              tapResponse(
                (instruction) =>
                  this._setInstruction({
                    document: instruction,
                    isCreating: false,
                    isUpdating: true,
                    isDeleting: false,
                  }),
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'deleteInstruction': {
          if (instructionStatus.status === 'confirmed') {
            this._patchStatus({
              instructionId: instructionAccountMeta.pubkey,
              statuses: { isDeleting: true },
            });
          } else {
            this._removeInstruction(instructionAccountMeta.pubkey);
          }

          return EMPTY;
        }
        default:
          return EMPTY;
      }
    })
  );
}
