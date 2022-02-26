import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  Document,
  Instruction,
  InstructionFilters,
} from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  EMPTY,
  filter,
  mergeMap,
  of,
  pipe,
  switchMap,
  take,
  takeUntil,
  takeWhile,
  withLatestFrom,
} from 'rxjs';
import { InstructionApiService } from './instruction-api.service';
import { InstructionEventService } from './instruction-event.service';

interface ViewModel {
  loading: boolean;
  filters: InstructionFilters | null;
  instructionsMap: Map<string, Document<Instruction>>;
}

const initialState: ViewModel = {
  loading: false,
  filters: null,
  instructionsMap: new Map<string, Document<Instruction>>(),
};

@Injectable()
export class InstructionsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly filters$ = this.select(({ filters }) => filters);
  readonly instructionsMap$ = this.select(
    ({ instructionsMap }) => instructionsMap
  );
  readonly instructions$ = this.select(
    this.instructionsMap$,
    (instructionsMap) =>
      Array.from(instructionsMap, ([, instruction]) => instruction)
  );

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _instructionApiService: InstructionApiService,
    private readonly _instructionEventService: InstructionEventService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._handleInstructionCreated(this.filters$);
    this._loadInstructions(this.filters$);
  }

  private readonly _setInstruction = this.updater<Document<Instruction>>(
    (state, newInstruction) => {
      const instructionsMap = new Map(state.instructionsMap);
      instructionsMap.set(newInstruction.id, newInstruction);
      return {
        ...state,
        instructionsMap,
      };
    }
  );

  private readonly _addInstruction = this.updater<Document<Instruction>>(
    (state, newInstruction) => {
      if (state.instructionsMap.has(newInstruction.id)) {
        return state;
      }
      const instructionsMap = new Map(state.instructionsMap);
      instructionsMap.set(newInstruction.id, newInstruction);
      return {
        ...state,
        instructionsMap,
      };
    }
  );

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

  private readonly _handleInstructionChanges = this.effect<string>(
    mergeMap((instructionId) =>
      this._instructionEventService.instructionChanges(instructionId).pipe(
        tapResponse(
          (changes) => {
            if (changes === null) {
              this._removeInstruction(instructionId);
            } else {
              this._setInstruction(changes);
            }
          },
          (error) => this._notificationStore.setError(error)
        ),
        takeUntil(
          this.loading$.pipe(
            filter((loading) => loading),
            take(1)
          )
        ),
        takeWhile((instruction) => instruction !== null)
      )
    )
  );

  private readonly _handleInstructionCreated =
    this.effect<InstructionFilters | null>(
      switchMap((filters) => {
        if (filters === null) {
          return EMPTY;
        }

        return this._instructionEventService.instructionCreated(filters).pipe(
          tapResponse(
            (instruction) => {
              this._addInstruction(instruction);
              this._handleInstructionChanges(instruction.id);
            },
            (error) => this._notificationStore.setError(error)
          )
        );
      })
    );

  private readonly _loadInstructions = this.effect<InstructionFilters | null>(
    switchMap((filters) => {
      if (filters === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._instructionApiService.find(filters).pipe(
        tapResponse(
          (instructions) => {
            this.patchState({
              instructionsMap: instructions.reduce(
                (instructionsMap, instruction) =>
                  instructionsMap.set(instruction.id, instruction),
                new Map<string, Document<Instruction>>()
              ),
              loading: false,
            });
            instructions.forEach(({ id }) =>
              this._handleInstructionChanges(id)
            );
          },
          (error) => this._notificationStore.setError(error)
        )
      );
    })
  );

  readonly setFilters = this.updater<InstructionFilters>((state, filters) => ({
    ...state,
    filters,
  }));

  readonly createInstruction = this.effect<{
    workspaceId: string;
    applicationId: string;
    instructionName: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([{ instructionName, workspaceId, applicationId }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionApiService
            .create({
              instructionName,
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Create instruction request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );

  readonly updateInstruction = this.effect<{
    instructionId: string;
    instructionName: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ instructionId, instructionName }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._instructionApiService
          .update({
            instructionName,
            authority: authority.toBase58(),
            instructionId,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Update instruction request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );

  readonly deleteInstruction = this.effect<{
    applicationId: string;
    instructionId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ instructionId, applicationId }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._instructionApiService
          .delete({
            authority: authority.toBase58(),
            instructionId,
            applicationId,
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent(
                  'Delete instruction request sent'
                ),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );
}
