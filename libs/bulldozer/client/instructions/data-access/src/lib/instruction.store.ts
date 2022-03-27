import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { Document, Instruction } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  EMPTY,
  map,
  switchMap,
} from 'rxjs';
import { InstructionApiService } from './instruction-api.service';
import { ItemView } from './types';

export type InstructionView = ItemView<Document<Instruction>>;

interface ViewModel {
  instructionId: string | null;
  instruction: InstructionView | null;
  loading: boolean;
}

const initialState: ViewModel = {
  instructionId: null,
  instruction: null,
  loading: false,
};

@Injectable()
export class InstructionStore extends ComponentStore<ViewModel> {
  private readonly _reload = new BehaviorSubject(null);
  private readonly reload$ = this._reload.asObservable();
  readonly instruction$ = this.select(({ instruction }) => instruction);
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);
  readonly loading$ = this.select(({ loading }) => loading);

  constructor(
    private readonly _instructionApiService: InstructionApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadInstruction(
      combineLatest([this.instructionId$, this.reload$]).pipe(
        map(([instructionId]) => instructionId)
      )
    );
  }

  readonly setInstructionId = this.updater<string | null>(
    (state, instructionId) => ({
      ...state,
      instructionId,
    })
  );

  private readonly _patchStatus = this.updater<{
    isCreating?: boolean;
    isUpdating?: boolean;
    isDeleting?: boolean;
  }>((state, statuses) => ({
    ...state,
    instruction: state.instruction
      ? {
          ...state.instruction,
          ...statuses,
        }
      : null,
  }));

  private readonly _setInstruction = this.updater<InstructionView | null>(
    (state, instruction) => ({
      ...state,
      instruction,
    })
  );

  private readonly _loadInstruction = this.effect<string | null>(
    switchMap((instructionId) => {
      if (instructionId === null) {
        this.patchState({ instruction: null });
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._instructionApiService.findById(instructionId).pipe(
        tapResponse(
          (instruction) => {
            if (instruction !== null) {
              this._setInstruction({
                document: instruction,
                isCreating: false,
                isUpdating: false,
                isDeleting: false,
              });
            }
            this.patchState({ loading: false });
          },
          (error) => this._notificationStore.setError({ error, loading: false })
        )
      );
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
            this._patchStatus({ isCreating: false });
            return EMPTY;
          }

          return this._instructionApiService
            .findById(instructionAccountMeta.pubkey, 'confirmed')
            .pipe(
              tapResponse(
                (instruction) => {
                  if (instruction !== null) {
                    this._setInstruction({
                      document: instruction,
                      isCreating: true,
                      isUpdating: false,
                      isDeleting: false,
                    });
                  }
                },
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'updateInstruction': {
          if (instructionStatus.status === 'finalized') {
            this._patchStatus({ isUpdating: false });
            return EMPTY;
          }

          return this._instructionApiService
            .findById(instructionAccountMeta.pubkey, 'confirmed')
            .pipe(
              tapResponse(
                (instruction) => {
                  if (instruction !== null) {
                    this._setInstruction({
                      document: instruction,
                      isCreating: false,
                      isUpdating: true,
                      isDeleting: false,
                    });
                  }
                },
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'deleteInstruction': {
          if (instructionStatus.status === 'confirmed') {
            this._patchStatus({ isDeleting: true });
          } else {
            this.patchState({ instruction: null });
            this._patchStatus({ isDeleting: false });
          }

          return EMPTY;
        }
        default:
          return EMPTY;
      }
    })
  );

  reload() {
    this._reload.next(null);
  }
}
