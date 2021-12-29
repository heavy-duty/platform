import { Injectable } from '@angular/core';
import {
  Collection,
  Document,
  InstructionAccount,
  InstructionRelation,
} from '@heavy-duty/bulldozer-devkit';
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
import { WorkspaceStore } from './workspace.store';

interface ViewModel {
  instructionId: string | null;
  error: unknown | null;
}

const initialState: ViewModel = {
  instructionId: null,
  error: null,
};

@Injectable()
export class InstructionDocumentStore extends ComponentStore<ViewModel> {
  private readonly _error = new Subject();
  readonly error$ = this._error.asObservable();
  private readonly _events = new BehaviorSubject<InstructionActions>(
    new InstructionInit()
  );
  readonly events$ = this._events.asObservable();
  readonly documents$ = this.select(
    this._instructionStore.instructionAccounts$,
    this._instructionStore.instructionRelations$,
    this._workspaceStore.collections$,
    this._instructionStore.instructionId$,
    (instructionAccounts, instructionRelations, collections, instructionId) =>
      instructionAccounts
        .filter(
          ({ data }) => data.instruction === instructionId && data.kind.id === 0
        )
        .map((instructionAccount) => ({
          ...instructionAccount,
          relations: instructionRelations
            .filter(({ data }) => data.from === instructionAccount.id)
            .reduce(
              (
                relations: (Document<InstructionRelation> & {
                  to: Document<InstructionAccount>;
                })[],
                instructionRelation
              ) => {
                const toAccount = instructionAccounts.find(
                  ({ id }) => id === instructionRelation.data.to
                );

                return toAccount
                  ? [
                      ...relations,
                      {
                        ...instructionRelation,
                        to: toAccount,
                      },
                    ]
                  : relations;
              },
              []
            ),
          collection: collections.reduce(
            (found: Document<Collection> | null, collection) =>
              !found && instructionAccount.data.collection === collection.id
                ? collection
                : null,
            null
          ),
          payer: instructionAccounts.reduce(
            (found: Document<InstructionAccount> | null, payer) =>
              !found && instructionAccount.data.payer === payer.id
                ? payer
                : null,
            null
          ),
          close: instructionAccounts.reduce(
            (found: Document<InstructionAccount> | null, close) =>
              !found && instructionAccount.data.close === close.id
                ? close
                : null,
            null
          ),
        }))
  );

  constructor(
    private readonly _bulldozerProgramStore: BulldozerProgramStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _instructionStore: InstructionStore
  ) {
    super(initialState);
  }

  readonly createInstructionDocument = this.effect(
    (
      request$: Observable<{
        workspaceId: string;
        applicationId: string;
        instructionId: string;
        data: {
          name: string;
          modifier: number;
          collection: string;
          space: number | null;
          payer: string | null;
          close: string | null;
        };
      }>
    ) =>
      request$.pipe(
        concatMap(
          ({
            applicationId,
            instructionId,
            workspaceId,
            data: { name, modifier, collection, space, payer, close },
          }) =>
            this._bulldozerProgramStore
              .createInstructionAccount(
                workspaceId,
                applicationId,
                instructionId,
                { name, kind: 0, modifier, space },
                { collection, payer, close }
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

  readonly updateInstructionDocument = this.effect(
    (
      request$: Observable<{
        instructionDocument: Document<InstructionAccount>;
        changes: {
          name: string;
          modifier: number;
          collection: string;
          space: number | null;
          payer: string | null;
          close: string | null;
        };
      }>
    ) =>
      request$.pipe(
        concatMap(
          ({
            instructionDocument,
            changes: { name, modifier, collection, space, payer, close },
          }) =>
            this._bulldozerProgramStore
              .updateInstructionAccount(
                instructionDocument.id,
                {
                  name,
                  kind: 0,
                  modifier,
                  space,
                },
                { collection, payer, close }
              )
              .pipe(
                tapResponse(
                  () =>
                    this._events.next(
                      new InstructionAccountUpdated(instructionDocument.id)
                    ),
                  (error) => this._error.next(error)
                )
              )
        )
      )
  );

  readonly deleteInstructionDocument = this.effect(
    (accountId$: Observable<string>) =>
      accountId$.pipe(
        concatMap((accountId) =>
          this._bulldozerProgramStore.deleteInstructionAccount(accountId).pipe(
            tapResponse(
              () => this._events.next(new InstructionAccountDeleted(accountId)),
              (error) => this._error.next(error)
            )
          )
        )
      )
  );
}
