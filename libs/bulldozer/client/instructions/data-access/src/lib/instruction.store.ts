import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/core-data-access';
import { Document, Instruction } from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  concatMap,
  EMPTY,
  of,
  pipe,
  startWith,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { InstructionApiService } from './instruction-api.service';
import { InstructionEventService } from './instruction-event.service';

interface ViewModel {
  instruction: Document<Instruction> | null;
  instructionId: string | null;
}

const initialState: ViewModel = {
  instruction: null,
  instructionId: null,
};

@Injectable()
export class InstructionStore extends ComponentStore<ViewModel> {
  readonly instruction$ = this.select(({ instruction }) => instruction);
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _instructionApiService: InstructionApiService,
    private readonly _instructionEventService: InstructionEventService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadInstruction(this.instructionId$);
  }

  private readonly _loadInstruction = this.effect<string | null>(
    switchMap((instructionId) => {
      if (instructionId === null) {
        return EMPTY;
      }

      return this._instructionApiService.findById(instructionId).pipe(
        concatMap((instruction) =>
          this._instructionEventService
            .instructionChanges(instructionId)
            .pipe(startWith(instruction))
        ),
        tapResponse(
          (instruction) => this.patchState({ instruction }),
          (error) => this._notificationStore.setError(error)
        )
      );
    })
  );

  readonly setInstructionId = this.updater<string | null>(
    (state, instructionId) => ({
      ...state,
      instructionId,
    })
  );

  readonly updateInstructionBody = this.effect<{
    instructionId: string;
    instructionBody: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(([{ instructionId, instructionBody }, authority]) => {
        if (authority === null) {
          return EMPTY;
        }

        return this._instructionApiService
          .updateBody({
            instructionId,
            instructionBody,
            authority: authority.toBase58(),
          })
          .pipe(
            tapResponse(
              () =>
                this._notificationStore.setEvent('Update body request sent'),
              (error) => this._notificationStore.setError(error)
            )
          );
      })
    )
  );
}
