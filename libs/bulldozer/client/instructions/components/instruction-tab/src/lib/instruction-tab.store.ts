import { Injectable } from '@angular/core';
import {
  InstructionApiService,
  InstructionSocketService,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notification-store';
import { Document, Instruction } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, of, startWith, switchMap } from 'rxjs';

interface ViewModel {
  instructionId: string | null;
  instruction: Document<Instruction> | null;
}

const initialState: ViewModel = {
  instructionId: null,
  instruction: null,
};

@Injectable()
export class InstructionTabStore extends ComponentStore<ViewModel> {
  private readonly _instructionId$ = this.select(
    ({ instructionId }) => instructionId
  );
  readonly instruction$ = this.select(({ instruction }) => instruction);

  constructor(
    private readonly _instructionApiService: InstructionApiService,
    private readonly _instructionSocketService: InstructionSocketService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);
  }

  readonly setInstructionId = this.updater(
    (state, instructionId: string | null) => ({ ...state, instructionId })
  );

  protected readonly loadInstruction = this.effect(() =>
    this._instructionId$.pipe(
      switchMap((instructionId) => {
        if (instructionId === null) {
          return of(null);
        }

        return this._instructionApiService
          .findById(instructionId)
          .pipe(
            concatMap((instruction) =>
              this._instructionSocketService
                .instructionChanges(instructionId)
                .pipe(startWith(instruction))
            )
          );
      }),
      tapResponse(
        (instruction) => this.patchState({ instruction }),
        (error) => this._notificationStore.setError({ error })
      )
    )
  );
}
