import { Injectable } from '@angular/core';
import { Document, InstructionAccount } from '@heavy-duty/bulldozer-devkit';
import { BulldozerProgramStore } from '@heavy-duty/bulldozer-store';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
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
    private readonly _bulldozerProgramStore: BulldozerProgramStore,
    private readonly _instructionStore: InstructionStore
  ) {
    super({});
  }

  readonly createInstructionSigner = this.effect(
    (
      request$: Observable<{
        workspaceId: string;
        applicationId: string;
        instructionId: string;
        data: {
          name: string;
          modifier: number;
        };
      }>
    ) =>
      request$.pipe(
        concatMap(({ workspaceId, applicationId, instructionId, data }) =>
          this._bulldozerProgramStore
            .createInstructionAccount(
              workspaceId,
              applicationId,
              instructionId,
              {
                kind: 1,
                space: null,
                ...data,
              },
              {
                collection: null,
                payer: null,
                close: null,
              }
            )
            .pipe(
              tapResponse(
                () => this._events.next(new InstructionAccountCreated()),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly updateInstructionSigner = this.effect(
    (
      signer$: Observable<{
        instructionSigner: Document<InstructionAccount>;
        changes: { name: string; modifier: number };
      }>
    ) =>
      signer$.pipe(
        concatMap(({ instructionSigner, changes }) =>
          this._bulldozerProgramStore
            .updateInstructionAccount(
              instructionSigner.id,
              {
                kind: 1,
                space: null,
                ...changes,
              },
              {
                collection: null,
                payer: null,
                close: null,
              }
            )
            .pipe(
              tapResponse(
                () =>
                  this._events.next(
                    new InstructionAccountUpdated(instructionSigner.id)
                  ),
                (error) => this._error.next(error)
              )
            )
        )
      )
  );

  readonly deleteInstructionSigner = this.effect(
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
