import { Injectable } from '@angular/core';
import { InstructionAccountsStore } from '@bulldozer-client/instructions-data-access';
import { generateInstructionCode2 } from '@heavy-duty/generator';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { map } from 'rxjs';
import { ViewInstructionCodeEditorAccountsStore } from './view-instruction-code-editor-accounts.store';
import { ViewInstructionCodeEditorArgumentsStore } from './view-instruction-code-editor-arguments.store';
import { ViewInstructionCodeEditorClosesReferencesStore } from './view-instruction-code-editor-close-references.store';
import { ViewInstructionCodeEditorCollectionsReferencesStore } from './view-instruction-code-editor-collections-references.store';
import { ViewInstructionCodeEditorCollectionsStore } from './view-instruction-code-editor-collections.store';
import { ViewInstructionCodeEditorInstructionStore } from './view-instruction-code-editor-instruction.store';
import { ViewInstructionCodeEditorPayersReferencesStore } from './view-instruction-code-editor-payers-references.store';
import { ViewInstructionCodeEditorRelationsStore } from './view-instruction-code-editor-relations.store';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ViewModel {}

const initialState: ViewModel = {};

@Injectable()
export class ViewInstructionCodeEditorStore extends ComponentStore<ViewModel> {
  readonly contextCode$ = this.select(
    this._viewInstructionCodeEditorInstructionStore.instruction$,
    this._viewInstructionCodeEditorArgumentsStore.instructionArguments$,
    this._viewInstructionCodeEditorAccountsStore.accounts$,
    this._viewInstructionCodeEditorCollectionsStore.collections$,
    this._viewInstructionCodeEditorPayersReferencesStore.accounts$,
    this._viewInstructionCodeEditorCollectionsReferencesStore.accounts$,
    this._viewInstructionCodeEditorClosesReferencesStore.accounts$,
    this._viewInstructionCodeEditorRelationsStore.accounts$,
    (
      instruction,
      instructionArguments,
      instructionAccounts,
      collections,
      payers,
      collectionsReferences,
      closes,
      relations
    ) => {
      if (
        instruction === null ||
        instructionArguments === null ||
        instructionAccounts === null ||
        collections === null ||
        payers === null ||
        collectionsReferences === null ||
        closes === null ||
        relations === null
      ) {
        return null;
      }

      return generateInstructionCode2(
        instruction,
        instructionArguments,
        instructionAccounts.map((instructionAccount) => {
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
            payer: payerAccountId,
            close: closeAccountId,
            collection: collectionId,
          };
        }),
        relations,
        collections
      );
    }
  );
  readonly handleCode$ = this.select(
    this._viewInstructionCodeEditorInstructionStore.instruction$,
    (instruction) => instruction?.body ?? null
  );

  constructor(
    private readonly _viewInstructionCodeEditorArgumentsStore: ViewInstructionCodeEditorArgumentsStore,
    private readonly _viewInstructionCodeEditorInstructionStore: ViewInstructionCodeEditorInstructionStore,
    private readonly _viewInstructionCodeEditorCollectionsStore: ViewInstructionCodeEditorCollectionsStore,
    private readonly _viewInstructionCodeEditorAccountsStore: ViewInstructionCodeEditorAccountsStore,
    private readonly _viewInstructionCodeEditorRelationsStore: ViewInstructionCodeEditorRelationsStore,
    private readonly _instructionAccountsStore: InstructionAccountsStore,
    private readonly _viewInstructionCodeEditorPayersReferencesStore: ViewInstructionCodeEditorPayersReferencesStore,
    private readonly _viewInstructionCodeEditorCollectionsReferencesStore: ViewInstructionCodeEditorCollectionsReferencesStore,
    private readonly _viewInstructionCodeEditorClosesReferencesStore: ViewInstructionCodeEditorClosesReferencesStore
  ) {
    super(initialState);

    this._viewInstructionCodeEditorPayersReferencesStore.setInstructionAccountPayerIds(
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
    this._viewInstructionCodeEditorCollectionsReferencesStore.setInstructionAccountCollectionIds(
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
    this._viewInstructionCodeEditorClosesReferencesStore.setInstructionAccountCloseIds(
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
