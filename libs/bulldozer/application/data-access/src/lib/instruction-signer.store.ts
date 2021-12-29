import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Document, InstructionAccount } from '@heavy-duty/bulldozer-devkit';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { EditSignerComponent } from '@heavy-duty/bulldozer/application/features/edit-signer';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { concatMap, exhaustMap, filter } from 'rxjs/operators';
import { InstructionStore } from '..';
import {
  InstructionAccountCreated,
  InstructionAccountDeleted,
  InstructionAccountUpdated,
  InstructionActions,
  InstructionInit,
} from './actions/instruction.actions';

@Injectable()
export class InstructionSignerStore extends ComponentStore<object> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _events = new BehaviorSubject<InstructionActions>(
    new InstructionInit()
  );
  readonly events$ = this._events.asObservable();
  readonly signers$ = this.select(
    this._instructionStore.instructionAccounts$,
    this._instructionStore.instructionId$,
    (instructionAccounts, instructionId) =>
      instructionAccounts &&
      instructionAccounts.filter(
        ({ data }) => data.instruction === instructionId && data.kind.id === 1
      )
  );

  constructor(
    private readonly _matDialog: MatDialog,
    private readonly _bulldozerProgramStore: BulldozerProgramStore,
    private readonly _instructionStore: InstructionStore
  ) {
    super({});
  }

  readonly createSigner = this.effect(
    (
      request$: Observable<{
        workspaceId: string;
        applicationId: string;
        instructionId: string;
      }>
    ) =>
      request$.pipe(
        exhaustMap(({ workspaceId, applicationId, instructionId }) =>
          this._matDialog
            .open(EditSignerComponent)
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap((instructionAccountDto) =>
                this._bulldozerProgramStore.createInstructionAccount(
                  workspaceId,
                  applicationId,
                  instructionId,
                  {
                    kind: 1,
                    space: null,
                    ...instructionAccountDto,
                  },
                  {
                    collection: null,
                    payer: null,
                    close: null,
                  }
                )
              ),
              tapResponse(
                () => this._events.next(new InstructionAccountCreated()),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly updateSigner = this.effect(
    (signer$: Observable<Document<InstructionAccount>>) =>
      signer$.pipe(
        exhaustMap((signer) =>
          this._matDialog
            .open(EditSignerComponent, {
              data: { signer },
            })
            .afterClosed()
            .pipe(
              filter((data) => data),
              concatMap((instructionAccountDto) =>
                this._bulldozerProgramStore.updateInstructionAccount(
                  signer.id,
                  {
                    kind: 1,
                    space: null,
                    ...instructionAccountDto,
                  },
                  {
                    collection: null,
                    payer: null,
                    close: null,
                  }
                )
              ),
              tapResponse(
                () =>
                  this._events.next(new InstructionAccountUpdated(signer.id)),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly deleteSigner = this.effect(
    (instructionAccountId$: Observable<string>) =>
      instructionAccountId$.pipe(
        concatMap((instructionAccountId) =>
          this._bulldozerProgramStore
            .deleteInstructionAccount(instructionAccountId)
            .pipe(
              tapResponse(
                () =>
                  this._events.next(
                    new InstructionAccountDeleted(instructionAccountId)
                  ),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );
}
