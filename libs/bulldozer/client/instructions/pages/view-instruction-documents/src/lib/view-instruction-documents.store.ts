import { Injectable } from '@angular/core';
import { InstructionAccountsStore } from '@bulldozer-client/instructions-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { map } from 'rxjs';
import { ViewInstructionDocumentsAccountsStore } from './view-instruction-documents-accounts.store';
import { ViewInstructionDocumentsClosesReferencesStore } from './view-instruction-documents-close-references.store';
import { ViewInstructionDocumentsCollectionsReferencesStore } from './view-instruction-documents-collections-references.store';
import { ViewInstructionDocumentsCollectionsStore } from './view-instruction-documents-collections.store';
import { ViewInstructionDocumentsPayersReferencesStore } from './view-instruction-documents-payers-references.store';
import { ViewInstructionDocumentsRelationsStore } from './view-instruction-documents-relations.store';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ViewModel {}

const initialState: ViewModel = {};

@Injectable()
export class ViewInstructionDocumentsStore extends ComponentStore<ViewModel> {
  readonly documents$ = this.select(
    this._viewInstructionDocumentsAccountsStore.accounts$,
    this._viewInstructionDocumentsCollectionsStore.collections$,
    this._viewInstructionDocumentsPayersReferencesStore.accounts$,
    this._viewInstructionDocumentsCollectionsReferencesStore.accounts$,
    this._viewInstructionDocumentsClosesReferencesStore.accounts$,
    this._viewInstructionDocumentsRelationsStore.accounts$,
    (
      instructionAccounts,
      collections,
      payers,
      collectionsReferences,
      closes,
      relations
    ) => {
      if (
        instructionAccounts === null ||
        collections === null ||
        payers === null ||
        collectionsReferences === null ||
        closes === null ||
        relations === null
      ) {
        return null;
      }

      return instructionAccounts
        .filter((instructionAccount) => instructionAccount.kind.id === 0)
        .map((instructionAccount) => {
          const payerAccountId =
            payers.find((payer) => payer.id === instructionAccount.payer)
              ?.payer ?? null;
          const closeAccountId =
            closes.find((close) => close.id === instructionAccount.close)
              ?.close ?? null;
          const collectionId =
            collectionsReferences.find(
              (collection) => collection.id === instructionAccount.collection
            )?.collection ?? null;

          return {
            ...instructionAccount,
            payer:
              instructionAccounts.find(
                (instructionAccount) => payerAccountId === instructionAccount.id
              ) ?? null,
            close:
              instructionAccounts.find(
                (instructionAccount) => closeAccountId === instructionAccount.id
              ) ?? null,
            collection:
              collections.find(
                (collection) => collectionId === collection.id
              ) ?? null,
            relations: relations
              .filter((relation) => relation.from === instructionAccount.id)
              .map((relation) => {
                return {
                  ...relation,
                  to:
                    instructionAccounts.find(
                      (instructionAccount) =>
                        relation.to === instructionAccount.id
                    ) ?? null,
                };
              }),
          };
        });
    }
  );

  constructor(
    private readonly _viewInstructionDocumentsCollectionsStore: ViewInstructionDocumentsCollectionsStore,
    private readonly _viewInstructionDocumentsAccountsStore: ViewInstructionDocumentsAccountsStore,
    private readonly _viewInstructionDocumentsRelationsStore: ViewInstructionDocumentsRelationsStore,
    private readonly _instructionAccountsStore: InstructionAccountsStore,
    private readonly _viewInstructionDocumentsPayersReferencesStore: ViewInstructionDocumentsPayersReferencesStore,
    private readonly _viewInstructionDocumentsCollectionsReferencesStore: ViewInstructionDocumentsCollectionsReferencesStore,
    private readonly _viewInstructionDocumentsClosesReferencesStore: ViewInstructionDocumentsClosesReferencesStore
  ) {
    super(initialState);

    this._viewInstructionDocumentsPayersReferencesStore.setInstructionAccountPayerIds(
      this._instructionAccountsStore.instructionAccounts$.pipe(
        isNotNullOrUndefined,
        map((accounts) =>
          accounts
            .filter((account) => account.data.kind.id === 0)
            .map((account) => account.data.payer)
            .filter((payer): payer is string => payer !== null)
            .toList()
        )
      )
    );
    this._viewInstructionDocumentsCollectionsReferencesStore.setInstructionAccountCollectionIds(
      this._instructionAccountsStore.instructionAccounts$.pipe(
        isNotNullOrUndefined,
        map((accounts) =>
          accounts
            .filter((account) => account.data.kind.id === 0)
            .map((account) => account.data.collection)
            .filter((collection): collection is string => collection !== null)
            .toList()
        )
      )
    );
    this._viewInstructionDocumentsClosesReferencesStore.setInstructionAccountCloseIds(
      this._instructionAccountsStore.instructionAccounts$.pipe(
        isNotNullOrUndefined,
        map((accounts) =>
          accounts
            .filter((account) => account.data.kind.id === 0)
            .map((account) => account.data.close)
            .filter((close): close is string => close !== null)
            .toList()
        )
      )
    );
  }
}
