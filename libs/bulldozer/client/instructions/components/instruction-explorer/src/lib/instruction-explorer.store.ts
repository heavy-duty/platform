import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Document, Instruction } from '@heavy-duty/bulldozer-devkit';
import { InstructionStore } from '@heavy-duty/bulldozer/application/data-access';
import { EditInstructionComponent } from '@heavy-duty/bulldozer/application/features/edit-instruction';
import { isNotNullOrUndefined } from '@heavy-duty/rx-solana';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { exhaustMap, filter, tap } from 'rxjs/operators';

@Injectable()
export class InstructionExplorerStore extends ComponentStore<object> {
  readonly connected$ = this._walletStore.connected$;
  readonly instructions$ = this._instructionStore.instructions$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _instructionStore: InstructionStore,
    private readonly _matDialog: MatDialog
  ) {
    super({});
  }

  readonly createInstruction = this.effect(
    (request$: Observable<{ workspaceId: string; applicationId: string }>) =>
      request$.pipe(
        exhaustMap(({ workspaceId, applicationId }) =>
          this._matDialog
            .open(EditInstructionComponent)
            .afterClosed()
            .pipe(
              filter((data) => data),
              tap((data) =>
                this._instructionStore.createInstruction({
                  workspaceId,
                  applicationId,
                  data,
                })
              )
            )
        )
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
                  instruction,
                  changes: { name },
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
          this._instructionStore.deleteInstruction(instruction)
        )
      )
  );
}
