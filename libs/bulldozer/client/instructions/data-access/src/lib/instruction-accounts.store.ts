import { Injectable } from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { Document, InstructionAccount } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, switchMap } from 'rxjs';
import { InstructionAccountApiService } from './instruction-account-api.service';
import { InstructionRelationItemView } from './instruction-relations.store';
import { ItemView } from './types';

export type InstructionAccountItemView = ItemView<Document<InstructionAccount>>;

export type InstructionDocumentRelation = InstructionRelationItemView & {
  extras: {
    to: InstructionAccountItemView;
  };
};

export interface InstructionDocumentItemView {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  document: Document<InstructionAccount>;
  close: InstructionAccountItemView | null;
  payer: InstructionAccountItemView | null;
  collection: any | null;
  relations: InstructionDocumentRelation[];
}

interface ViewModel {
  loading: boolean;
  instructionAccountIds: string[] | null;
  instructionAccountsMap: Map<string, InstructionAccountItemView>;
}

const initialState: ViewModel = {
  loading: false,
  instructionAccountIds: null,
  instructionAccountsMap: new Map<string, InstructionAccountItemView>(),
};

@Injectable()
export class InstructionAccountsStore extends ComponentStore<ViewModel> {
  readonly loading$ = this.select(({ loading }) => loading);
  readonly instructionAccountIds$ = this.select(
    ({ instructionAccountIds }) => instructionAccountIds
  );
  readonly instructionAccountsMap$ = this.select(
    ({ instructionAccountsMap }) => instructionAccountsMap
  );
  readonly instructionAccounts$ = this.select(
    this.instructionAccountsMap$,
    (instructionAccountsMap) =>
      Array.from(
        instructionAccountsMap,
        ([, instructionAccount]) => instructionAccount
      )
  );

  constructor(
    private readonly _instructionAccountApiService: InstructionAccountApiService,
    private readonly _notificationStore: NotificationStore
  ) {
    super(initialState);

    this._loadInstructionAccounts(this.instructionAccountIds$);
  }

  private readonly _setInstructionAccount =
    this.updater<InstructionAccountItemView>((state, newInstructionAccount) => {
      const instructionAccountsMap = new Map(state.instructionAccountsMap);
      instructionAccountsMap.set(
        newInstructionAccount.document.id,
        newInstructionAccount
      );

      return {
        ...state,
        instructionAccountsMap,
      };
    });

  private readonly _setInstructionAccountsMap = this.updater<
    Map<string, InstructionAccountItemView>
  >((state, newInstructionAccountsMap) => {
    const instructionAccountsMap = new Map(state.instructionAccountsMap);
    newInstructionAccountsMap.forEach((newInstructionAccount) => {
      const foundInstructionAccount = instructionAccountsMap.get(
        newInstructionAccount.document.id
      );

      if (foundInstructionAccount === undefined) {
        instructionAccountsMap.set(
          newInstructionAccount.document.id,
          newInstructionAccount
        );
      } else {
        instructionAccountsMap.set(newInstructionAccount.document.id, {
          ...foundInstructionAccount,
          document: newInstructionAccount.document,
        });
      }
    });

    return { ...state, instructionAccountsMap };
  });

  private readonly _patchStatus = this.updater<{
    instructionAccountId: string;
    statuses: {
      isCreating?: boolean;
      isUpdating?: boolean;
      isDeleting?: boolean;
    };
  }>((state, { instructionAccountId, statuses }) => {
    const instructionAccountsMap = new Map(state.instructionAccountsMap);
    const instructionAccount = instructionAccountsMap.get(instructionAccountId);

    if (instructionAccount === undefined) {
      return state;
    }

    return {
      ...state,
      instructionAccountsMap: instructionAccountsMap.set(instructionAccountId, {
        ...instructionAccount,
        ...statuses,
      }),
    };
  });

  private readonly _removeInstructionAccount = this.updater<string>(
    (state, instructionAccountId) => {
      const instructionAccountsMap = new Map(state.instructionAccountsMap);
      instructionAccountsMap.delete(instructionAccountId);
      return {
        ...state,
        instructionAccountsMap,
      };
    }
  );

  private readonly _loadInstructionAccounts = this.effect<string[] | null>(
    switchMap((instructionAccountIds) => {
      if (instructionAccountIds === null) {
        return EMPTY;
      }

      this.patchState({ loading: true });

      return this._instructionAccountApiService
        .findByIds(instructionAccountIds)
        .pipe(
          tapResponse(
            (instructionAccounts) => {
              this._setInstructionAccountsMap(
                instructionAccounts
                  .filter(
                    (
                      instructionAccount
                    ): instructionAccount is Document<InstructionAccount> =>
                      instructionAccount !== null
                  )
                  .reduce(
                    (instructionAccountsMap, instructionAccount) =>
                      instructionAccountsMap.set(instructionAccount.id, {
                        document: instructionAccount,
                        isCreating: false,
                        isUpdating: false,
                        isDeleting: false,
                      }),
                    new Map<string, InstructionAccountItemView>()
                  )
              );
              this.patchState({
                loading: false,
              });
            },
            (error) => this._notificationStore.setError({ error })
          )
        );
    })
  );

  readonly setInstructionAccountIds = this.updater<string[] | null>(
    (state, instructionAccountIds) => ({
      ...state,
      instructionAccountIds,
    })
  );

  readonly dispatch = this.effect<InstructionStatus>(
    concatMap((instructionAccountStatus) => {
      const instructionAccountAccountMeta =
        instructionAccountStatus.accounts.find(
          (account) => account.name === 'Account'
        );

      if (instructionAccountAccountMeta === undefined) {
        return EMPTY;
      }

      switch (instructionAccountStatus.name) {
        case 'createInstructionAccount': {
          if (instructionAccountStatus.status === 'finalized') {
            this._patchStatus({
              instructionAccountId: instructionAccountAccountMeta.pubkey,
              statuses: {
                isCreating: false,
              },
            });

            return EMPTY;
          }

          return this._instructionAccountApiService
            .findById(instructionAccountAccountMeta.pubkey, 'confirmed')
            .pipe(
              isNotNullOrUndefined,
              tapResponse(
                (instructionAccount) =>
                  this._setInstructionAccount({
                    document: instructionAccount,
                    isCreating: true,
                    isUpdating: false,
                    isDeleting: false,
                  }),
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'updateInstructionAccount': {
          if (instructionAccountStatus.status === 'finalized') {
            this._patchStatus({
              instructionAccountId: instructionAccountAccountMeta.pubkey,
              statuses: {
                isUpdating: false,
              },
            });

            return EMPTY;
          }

          return this._instructionAccountApiService
            .findById(instructionAccountAccountMeta.pubkey, 'confirmed')
            .pipe(
              isNotNullOrUndefined,
              tapResponse(
                (instructionAccount) =>
                  this._setInstructionAccount({
                    document: instructionAccount,
                    isCreating: false,
                    isUpdating: true,
                    isDeleting: false,
                  }),
                (error) => this._notificationStore.setError({ error })
              )
            );
        }
        case 'deleteInstructionAccount': {
          if (instructionAccountStatus.status === 'confirmed') {
            this._patchStatus({
              instructionAccountId: instructionAccountAccountMeta.pubkey,
              statuses: { isDeleting: true },
            });
          } else {
            this._removeInstructionAccount(
              instructionAccountAccountMeta.pubkey
            );
          }

          return EMPTY;
        }
        default:
          return EMPTY;
      }
    })
  );
}
