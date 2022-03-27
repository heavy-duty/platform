import { Injectable } from '@angular/core';
import {
  CollectionItemView,
  CollectionsStore,
} from '@bulldozer-client/collections-data-access';
import {
  InstructionAccountItemView,
  InstructionAccountsStore,
  InstructionDocumentItemView,
  InstructionRelationsStore,
} from '@bulldozer-client/instructions-data-access';
import { InstructionRelation, Relation } from '@heavy-duty/bulldozer-devkit';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';

interface ViewModel {
  instructionId: string | null;
}

const initialState: ViewModel = {
  instructionId: null,
};

@Injectable()
export class ViewInstructionDocumentsStore extends ComponentStore<ViewModel> {
  readonly instructionDocuments$: Observable<InstructionDocumentItemView[]> =
    this.select(
      this._instructionAccountsStore.instructionAccounts$,
      this._collectionsStore.collections$,
      this._instructionRelationsStore.instructionRelations$,
      this.select(({ instructionId }) => instructionId),
      (instructionAccounts, collections, instructionRelations, instructionId) =>
        instructionAccounts
          .filter(
            ({ document }) =>
              document.data.instruction === instructionId &&
              document.data.kind.id === 0
          )
          .map((instructionAccount) => ({
            ...instructionAccount,
            document: {
              ...instructionAccount.document,
              relations: instructionRelations
                .filter(({ from }) => from === instructionAccount.document.id)
                .reduce(
                  (
                    relations: (Relation<InstructionRelation> & {
                      extras: { to: InstructionAccountItemView };
                    })[],
                    instructionRelation
                  ) => {
                    const toAccount = instructionAccounts.find(
                      ({ document }) => document.id === instructionRelation.to
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
              collection: collections.reduce(
                (found: CollectionItemView | null, collection) =>
                  !found &&
                  instructionAccount.document.data.kind.collection ===
                    collection.document.id
                    ? collection
                    : null,
                null
              ),
              payer: instructionAccounts.reduce(
                (found: InstructionAccountItemView | null, payer) =>
                  !found &&
                  instructionAccount.document.data.modifier?.payer ===
                    payer.document.id
                    ? payer
                    : null,
                null
              ),
              close: instructionAccounts.reduce(
                (found: InstructionAccountItemView | null, close) =>
                  !found &&
                  instructionAccount.document.data.modifier?.close ===
                    close.document.id
                    ? close
                    : null,
                null
              ),
            },
          }))
    );

  constructor(
    private readonly _instructionAccountsStore: InstructionAccountsStore,
    private readonly _collectionsStore: CollectionsStore,
    private readonly _instructionRelationsStore: InstructionRelationsStore
  ) {
    super(initialState);
  }

  readonly setInstructionId = this.updater<string | null>(
    (state, instructionId) => ({ ...state, instructionId })
  );
}
