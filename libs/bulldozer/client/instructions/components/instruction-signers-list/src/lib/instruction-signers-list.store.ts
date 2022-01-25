import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Document, InstructionAccount } from '@heavy-duty/bulldozer-devkit';
import { InstructionAccountStore } from '@heavy-duty/bulldozer-store';
import { RouteStore } from '@heavy-duty/bulldozer/application/data-access';
import { EditSignerComponent } from '@heavy-duty/bulldozer/application/features/edit-signer';
import { isTruthy } from '@heavy-duty/rx-solana';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { exhaustMap, tap } from 'rxjs/operators';

@Injectable()
export class InstructionSignersListStore extends ComponentStore<object> {
  readonly instructionSigners$ = this.select(
    this._instructionAccountStore.instructionAccounts$,
    this._routeStore.instructionId$,
    (instructionAccounts, instructionId) =>
      instructionAccounts &&
      instructionAccounts.filter(
        ({ data }) => data.instruction === instructionId && data.kind.id === 1
      )
  );

  constructor(
    private readonly _instructionAccountStore: InstructionAccountStore,
    private readonly _matDialog: MatDialog,
    private readonly _routeStore: RouteStore
  ) {
    super({});
  }

  readonly createInstructionSigner = this.effect(
    (
      $: Observable<{
        applicationId: string;
        instructionId: string;
      }>
    ) =>
      $.pipe(
        exhaustMap(({ applicationId, instructionId }) =>
          this._matDialog
            .open(EditSignerComponent)
            .afterClosed()
            .pipe(
              isTruthy,
              tap((data) =>
                this._instructionAccountStore.createInstructionAccount({
                  applicationId,
                  instructionId,
                  instructionAccountDto: data,
                })
              )
            )
        )
      )
  );

  readonly updateInstructionSigner = this.effect(
    (
      $: Observable<{
        instructionAccount: Document<InstructionAccount>;
      }>
    ) =>
      $.pipe(
        exhaustMap(({ instructionAccount }) =>
          this._matDialog
            .open(EditSignerComponent, { data: { signer: instructionAccount } })
            .afterClosed()
            .pipe(
              isTruthy,
              tap((changes) =>
                this._instructionAccountStore.updateInstructionAccount({
                  instructionAccountId: instructionAccount.id,
                  instructionAccountDto: changes,
                })
              )
            )
        )
      )
  );

  readonly deleteInstructionSigner = this.effect(
    (
      $: Observable<{
        instructionAccount: Document<InstructionAccount>;
      }>
    ) =>
      $.pipe(
        tap(({ instructionAccount }) =>
          this._instructionAccountStore.deleteInstructionAccount({
            instructionAccountId: instructionAccount.id,
            instructionId: instructionAccount.data.instruction,
          })
        )
      )
  );
}
