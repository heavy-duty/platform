import { Injectable } from '@angular/core';
import { CollectionsStore } from '@bulldozer-client/collections-data-access';
import {
  InstructionAccountsStore,
  InstructionRelationsStore,
  InstructionStore,
} from '@bulldozer-client/instructions-data-access';
import {
  Collection,
  Document,
  Instruction,
  InstructionAccount,
  InstructionRelation,
  Relation,
} from '@heavy-duty/bulldozer-devkit';
import { ComponentStore } from '@ngrx/component-store';

export interface InstructionDocumentRelation
  extends Relation<InstructionRelation> {
  extras: {
    to: Document<InstructionAccount>;
  };
}

export interface InstructionDocument extends Document<InstructionAccount> {
  close: Document<InstructionAccount> | null;
  payer: Document<InstructionAccount> | null;
  collection: Document<Collection> | null;
  relations: InstructionDocumentRelation[];
}

interface ViewModel {
  instructionDocuments: InstructionDocument[];
}

const initialState: ViewModel = {
  instructionDocuments: [],
};

@Injectable()
export class ViewInstructionDocumentsStore extends ComponentStore<ViewModel> {
  readonly instructionDocuments$ = this.select(
    ({ instructionDocuments }) => instructionDocuments
  );

  constructor(
    instructionStore: InstructionStore,
    instructionAccountsStore: InstructionAccountsStore,
    collectionsStore: CollectionsStore,
    instructionRelationsStore: InstructionRelationsStore
  ) {
    super(initialState);

    this._loadDocuments(
      this.select(
        instructionStore.instruction$,
        instructionAccountsStore.instructionAccounts$,
        instructionRelationsStore.instructionRelations$,
        collectionsStore.collections$,
        (
          instruction,
          instructionAccounts,
          instructionRelations,
          collections
        ) => ({
          instruction,
          instructionAccounts,
          instructionRelations,
          collections: collections.map(({ document }) => document),
        }),
        { debounce: true }
      )
    );
  }

  private readonly _loadDocuments = this.updater<{
    instruction: Document<Instruction> | null;
    instructionAccounts: Document<InstructionAccount>[];
    instructionRelations: Relation<InstructionRelation>[];
    collections: Document<Collection>[];
  }>(
    (
      state,
      { instruction, instructionAccounts, instructionRelations, collections }
    ) => ({
      ...state,
      instructionDocuments: instruction
        ? instructionAccounts
            .filter(
              ({ data }) =>
                data.instruction === instruction.id && data.kind.id === 0
            )
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
              collection: collections.reduce(
                (found: Document<Collection> | null, collection) =>
                  !found &&
                  instructionAccount.data.kind.collection === collection.id
                    ? collection
                    : null,
                null
              ),
              payer: instructionAccounts.reduce(
                (found: Document<InstructionAccount> | null, payer) =>
                  !found && instructionAccount.data.modifier?.payer === payer.id
                    ? payer
                    : null,
                null
              ),
              close: instructionAccounts.reduce(
                (found: Document<InstructionAccount> | null, close) =>
                  !found && instructionAccount.data.modifier?.close === close.id
                    ? close
                    : null,
                null
              ),
            }))
        : [],
    })
  );
}
