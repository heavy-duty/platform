import { Injectable } from '@angular/core';
import { InstructionRelationApiService } from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, of, pipe, withLatestFrom } from 'rxjs';
import { ViewInstructionDocumentsAccountsStore } from './view-instruction-documents-accounts.store';
import { ViewInstructionDocumentsCollectionsStore } from './view-instruction-documents-collections.store';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ViewModel {}

const initialState: ViewModel = {};

@Injectable()
export class ViewInstructionDocumentsStore extends ComponentStore<ViewModel> {
  readonly documents$ = this.select(
    this._viewInstructionDocumentsAccountsStore.accounts$,
    this._viewInstructionDocumentsCollectionsStore.collections$,
    (instructionAccounts, collections) => {
      if (instructionAccounts === null || collections === null) {
        return null;
      }

      return instructionAccounts
        .filter((instructionAccount) => instructionAccount.kind.id === 0)
        .map((instructionAccount) => {
          return {
            ...instructionAccount,
            collection:
              collections.find(
                (collection) =>
                  collection.id === instructionAccount.kind.collection
              ) ?? null,
            payer:
              instructionAccounts.find(
                (payer) => payer.id === instructionAccount.modifier?.payer
              ) ?? null,
            close:
              instructionAccounts.find(
                (close) => close.id === instructionAccount.modifier?.close
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
    private readonly _instructionRelationApiService: InstructionRelationApiService
  ) {
    super(initialState);
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
