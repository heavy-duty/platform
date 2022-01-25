import { Injectable } from '@angular/core';
import {
  Document,
  InstructionAccount,
  InstructionRelation,
  Relation,
} from '@heavy-duty/bulldozer-devkit';
import {
  CollectionStore,
  InstructionAccountStore,
  InstructionRelationStore,
} from '@heavy-duty/bulldozer-store';
import { ComponentStore } from '@ngrx/component-store';

interface ViewModel {
  instructionId?: string;
}

const initialState = {};

@Injectable()
export class InstructionDocumentsListStore extends ComponentStore<ViewModel> {
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);
  readonly instructionAccounts$ = this.select(
    this.instructionId$,
    this._instructionAccountStore.instructionAccounts$,
    (instructionId, instructionAccounts) =>
      instructionId
        ? instructionAccounts.filter(
            (instructionAccount) =>
              instructionAccount.data.instruction === instructionId
          )
        : []
  );
  readonly instructionDocuments$ = this.select(
    this.instructionAccounts$,
    this._instructionRelationStore.instructionRelations$,
    this._collectionStore.collections$,
    (instructionAccounts, instructionRelations, collections) =>
      instructionAccounts
        .filter(({ data }) => data.kind.id === 0)
        .map((instructionAccount) => ({
          ...instructionAccount,
          relations: instructionRelations
            .filter(({ from }) => from === instructionAccount.id)
            .reduce(
              (
                relations: (Relation<InstructionRelation> & {
                  extras: { to: Document<InstructionAccount> };
                })[],
                instructionRelation
              ) => {
                const toAccount = instructionAccounts.find(
                  ({ id }) => id === instructionRelation.to
                );

                return toAccount
                  ? [
                      ...relations,
                      {
                        ...instructionRelation,
                        extras: { to: toAccount },
                      },
                    ]
                  : relations;
              },
              []
            ),
          collection:
            collections.find(
              (collection) =>
                instructionAccount.data.kind.collection === collection.id
            ) || null,
          payer:
            instructionAccounts.find(
              (payer) => instructionAccount.data.modifier?.payer === payer.id
            ) || null,
          close:
            instructionAccounts.find(
              (close) => instructionAccount.data.modifier?.close === close.id
            ) || null,
        }))
  );

  constructor(
    private readonly _collectionStore: CollectionStore,
    private readonly _instructionAccountStore: InstructionAccountStore,
    private readonly _instructionRelationStore: InstructionRelationStore
  ) {
    super(initialState);
  }

  readonly setInstructionId = this.updater(
    (state, instructionId: string | undefined) => ({
      ...state,
      instructionId,
    })
  );
}
