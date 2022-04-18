import { Injectable } from '@angular/core';
import {
  InstructionAccountsStore,
  InstructionRelationApiService,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, map, of, pipe, withLatestFrom } from 'rxjs';
import { ViewInstructionDocumentsAccountsStore } from './view-instruction-documents-accounts.store';
import { ViewInstructionDocumentsClosesReferencesStore } from './view-instruction-documents-close-references.store';
import { ViewInstructionDocumentsCollectionsReferencesStore } from './view-instruction-documents-collections-references.store';
import { ViewInstructionDocumentsCollectionsStore } from './view-instruction-documents-collections.store';
import { ViewInstructionDocumentsPayersReferencesStore } from './view-instruction-documents-payers-references.store';

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
    (
      instructionAccounts,
      collections,
      payers,
      collectionsReferences,
      closes
    ) => {
      console.log({ payers });

      if (
        instructionAccounts === null ||
        collections === null ||
        payers === null ||
        collectionsReferences === null ||
        closes === null
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
          };
        });
    }
  );

  constructor(
    private readonly _viewInstructionDocumentsCollectionsStore: ViewInstructionDocumentsCollectionsStore,
    private readonly _viewInstructionDocumentsAccountsStore: ViewInstructionDocumentsAccountsStore,
    private readonly _walletStore: WalletStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _instructionAccountsStore: InstructionAccountsStore,
    private readonly _instructionRelationApiService: InstructionRelationApiService,
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

  readonly createInstructionRelation = this.effect<{
    workspaceId: string;
    applicationId: string;
    instructionId: string;
    fromAccountId: string;
    toAccountId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([
          {
            workspaceId,
            applicationId,
            instructionId,
            fromAccountId,
            toAccountId,
          },
          authority,
        ]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionRelationApiService
            .create({
              fromAccountId,
              toAccountId,
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
              instructionId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Create relation request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );

  readonly deleteInstructionRelation = this.effect<{
    workspaceId: string;
    instructionId: string;
    fromAccountId: string;
    toAccountId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([
          { workspaceId, instructionId, fromAccountId, toAccountId },
          authority,
        ]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionRelationApiService
            .delete({
              authority: authority.toBase58(),
              workspaceId,
              instructionId,
              fromAccountId,
              toAccountId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Delete relation request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );
}
