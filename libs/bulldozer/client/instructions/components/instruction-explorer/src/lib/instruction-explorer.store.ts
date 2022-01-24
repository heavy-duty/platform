import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Document, Instruction } from '@heavy-duty/bulldozer-devkit';
import { InstructionStore } from '@heavy-duty/bulldozer-store';
import { EditInstructionComponent } from '@heavy-duty/bulldozer/application/features/edit-instruction';
import { isNotNullOrUndefined } from '@heavy-duty/rx-solana';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { combineLatest, exhaustMap, filter, Observable, of, tap } from 'rxjs';

interface ViewModel {
  applicationId?: string;
}

const initialState = {};

@Injectable()
export class InstructionExplorerStore extends ComponentStore<ViewModel> {
  readonly connected$ = this._walletStore.connected$;
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly instructions$ = this.select(
    this._instructionStore.instructions$,
    this.applicationId$,
    (instructions, applicationId) =>
      instructions.filter(
        (instruction) => instruction.data.application === applicationId
      )
  );

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _instructionStore: InstructionStore,
    private readonly _matDialog: MatDialog
  ) {
    super(initialState);
  }

  readonly setApplicationId = this.updater(
    (state, applicationId: string | undefined) => ({
      ...state,
      applicationId,
    })
  );

  readonly createInstruction = this.effect(($) =>
    combineLatest([this.applicationId$, $]).pipe(
      exhaustMap(([applicationId]) => {
        if (!applicationId) {
          return of(null);
        }

        return this._matDialog
          .open(EditInstructionComponent)
          .afterClosed()
          .pipe(
            filter((data) => data),
            tap(({ name }) =>
              this._instructionStore.createInstruction({
                applicationId,
                instructionName: name,
              })
            )
          );
      })
    )
  );

  readonly updateInstruction = this.effect(
    (instruction$: Observable<Document<Instruction>>) =>
      instruction$.pipe(
        exhaustMap((instruction) =>
          this._matDialog
            .open(EditInstructionComponent, { data: { instruction } })
            .afterClosed()
            .pipe(
              isNotNullOrUndefined,
              tap(({ name }) =>
                this._instructionStore.updateInstruction({
                  instructionId: instruction.id,
                  instructionName: name,
                })
              )
            )
        )
      )
  );

  readonly deleteInstruction = this.effect(
    (instruction$: Observable<Document<Instruction>>) =>
      instruction$.pipe(
        tap((instruction) =>
          this._instructionStore.deleteInstruction({
            instructionId: instruction.id,
            applicationId: instruction.data.application,
          })
        )
      )
  );
}
