import { Injectable } from '@angular/core';
import {
  Collection,
  Document,
  InstructionAccount,
  InstructionRelation,
  Relation,
} from '@heavy-duty/bulldozer-devkit';
import { ComponentStore } from '@ngrx/component-store';
import { combineLatest, tap } from 'rxjs';
import { ViewCollectionsStore } from './view-collections.store';
import { ViewInstructionAccountsStore } from './view-instruction-accounts.store';
import { ViewInstructionRelationsStore } from './view-instruction-relations.store';
import { ViewInstructionStore } from './view-instruction.store';

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
    private readonly _viewInstructionStore: ViewInstructionStore,
    private readonly _viewInstructionAccountsStore: ViewInstructionAccountsStore,
    private readonly _viewCollectionsStore: ViewCollectionsStore,
    private readonly _viewInstructionRelationsStore: ViewInstructionRelationsStore
  ) {
    super(initialState);
  }

  protected readonly _loadDocuments = this.effect(() =>
    combineLatest({
      instruction: this._viewInstructionStore.instruction$,
      instructionAccounts:
        this._viewInstructionAccountsStore.instructionAccounts$,
      instructionRelations:
        this._viewInstructionRelationsStore.instructionRelations$,
      collections: this._viewCollectionsStore.collections$,
    }).pipe(
      tap(
        ({
          instruction,
          instructionAccounts,
          instructionRelations,
          collections,
        }) =>
          this.patchState({
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
                        instructionAccount.data.kind.collection ===
                          collection.id
                          ? collection
                          : null,
                      null
                    ),
                    payer: instructionAccounts.reduce(
                      (found: Document<InstructionAccount> | null, payer) =>
                        !found &&
                        instructionAccount.data.modifier?.payer === payer.id
                          ? payer
                          : null,
                      null
                    ),
                    close: instructionAccounts.reduce(
                      (found: Document<InstructionAccount> | null, close) =>
                        !found &&
                        instructionAccount.data.modifier?.close === close.id
                          ? close
                          : null,
                      null
                    ),
                  }))
              : [],
          })
      )
    )
  );
}
