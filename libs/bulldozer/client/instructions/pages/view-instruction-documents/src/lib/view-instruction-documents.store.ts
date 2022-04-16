import { Injectable } from '@angular/core';
import {
  CollectionQueryStore,
  CollectionsStore,
} from '@bulldozer-client/collections-data-access';
import {
  InstructionAccountApiService,
  InstructionAccountQueryStore,
  InstructionAccountsStore,
  InstructionRelationApiService,
  InstructionRelationQueryStore,
  InstructionRelationsStore,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { InstructionAccountDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Keypair } from '@solana/web3.js';
import { concatMap, EMPTY, map, of, pipe, withLatestFrom } from 'rxjs';

interface ViewModel {
  workspaceId: string | null;
  applicationId: string | null;
  instructionId: string | null;
}

const initialState: ViewModel = {
  workspaceId: null,
  applicationId: null,
  instructionId: null,
};

@Injectable()
export class ViewInstructionDocumentsStore extends ComponentStore<ViewModel> {
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);
  /* readonly documents$: Observable<InstructionDocumentItemView[]> = this.select(
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
          isCreating: instructionAccount.isCreating,
          isUpdating: instructionAccount.isUpdating,
          isDeleting: instructionAccount.isDeleting,
          document: instructionAccount.document,
          relations: instructionRelations
            .filter(
              ({ document }) => document.from === instructionAccount.document.id
            )
            .reduce(
              (
                relations: (InstructionRelationItemView & {
                  extras: { to: InstructionAccountItemView };
                })[],
                instructionRelation
              ) => {
                const toAccount = instructionAccounts.find(
                  ({ document }) =>
                    document.id === instructionRelation.document.to
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
          collection: collections?.reduce(
            (found: any | null, collection) =>
              !found &&
              instructionAccount.document.data.kind.collection === collection.id
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
        }))
  ); */

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _instructionRelationApiService: InstructionRelationApiService,
    private readonly _instructionAccountApiService: InstructionAccountApiService,
    private readonly _instructionAccountQueryStore: InstructionAccountQueryStore,
    private readonly _instructionAccountsStore: InstructionAccountsStore,
    private readonly _instructionRelationQueryStore: InstructionRelationQueryStore,
    private readonly _instructionRelationsStore: InstructionRelationsStore,
    private readonly _collectionsStore: CollectionsStore,
    private readonly _collectionQueryStore: CollectionQueryStore,
    workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._collectionQueryStore.setFilters(
      this.applicationId$.pipe(
        isNotNullOrUndefined,
        map((application) => ({
          application,
        }))
      )
    );
    /* this._collectionsStore.setCollectionIds(
      this._collectionQueryStore.collectionIds$
    ); */
    this._instructionAccountQueryStore.setFilters(
      this.instructionId$.pipe(
        isNotNullOrUndefined,
        map((instruction) => ({
          instruction,
        }))
      )
    );
    /* this._instructionAccountsStore.setInstructionAccountIds(
      this._instructionAccountQueryStore.instructionAccountIds$
    );
    this._instructionRelationQueryStore.setFilters(
      this.instructionId$.pipe(
        isNotNullOrUndefined,
        map((instruction) => ({ instruction }))
      )
    );
    this._instructionRelationsStore.setInstructionRelationIds(
      this._instructionRelationQueryStore.instructionRelationIds$
    );
    this._handleInstruction(
      this.instructionId$.pipe(
        isNotNullOrUndefined,
        switchMap((instructionId) =>
          workspaceInstructionsStore.instruction$.pipe(
            filter((instruction) =>
              instruction.accounts.some(
                (account) =>
                  account.name === 'Instruction' &&
                  account.pubkey === instructionId
              )
            )
          )
        )
      )
    ); */
    /* this._handleCollectionUpdate(
      this._instructionAccountsStore.instructionAccounts$.pipe(
        map((instructionAccounts) =>
          [
            ...new Set([
              ...instructionAccounts.map(
                (instructionAccount) =>
                  instructionAccount.document.data.kind.collection
              ),
            ]),
          ].filter(
            (collectionId): collectionId is string => collectionId !== null
          )
        ),
        isNotNullOrUndefined,
        switchMap((collectionIds) =>
          workspaceInstructionsStore.instruction$.pipe(
            filter((instruction) =>
              instruction.accounts.some(
                (account) =>
                  account.name === 'Collection' &&
                  collectionIds.some(
                    (collectionId) => account.pubkey === collectionId
                  )
              )
            )
          )
        )
      )
    ); */
  }

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({ ...state, workspaceId })
  );

  readonly setApplicationId = this.updater<string | null>(
    (state, applicationId) => ({ ...state, applicationId })
  );

  readonly setInstructionId = this.updater<string | null>(
    (state, instructionId) => ({ ...state, instructionId })
  );

  readonly setCollectionIds = this.updater<string[]>((state, collectionId) => ({
    ...state,
    collectionId,
  }));

  /* private readonly _handleInstruction = this.effect<InstructionStatus>(
    tap((instructionStatus) => {
      switch (instructionStatus.name) {
        case 'createInstructionAccount':
        case 'updateInstructionAccount':
        case 'deleteInstructionAccount': {
          this._instructionAccountsStore.dispatch(instructionStatus);
          break;
        }
        case 'createInstructionRelation':
        case 'deleteInstructionRelation': {
          this._instructionRelationsStore.dispatch(instructionStatus);
          break;
        }
        default:
          break;
      }
    })
  ); */

  /* private readonly _handleCollectionUpdate = this.effect<InstructionStatus>(
    tap((instructionStatus) => {
      switch (instructionStatus.name) {
        case 'updateCollection': {
          this._collectionsStore.dispatch(instructionStatus);
          break;
        }
        default:
          break;
      }
    })
  ); */

  readonly createInstructionAccount = this.effect<{
    workspaceId: string;
    applicationId: string;
    instructionId: string;
    instructionAccountDto: InstructionAccountDto;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([
          { workspaceId, applicationId, instructionId, instructionAccountDto },
          authority,
        ]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionAccountApiService
            .create(Keypair.generate(), {
              instructionAccountDto,
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
              instructionId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Create account request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );

  readonly updateInstructionAccount = this.effect<{
    workspaceId: string;
    instructionId: string;
    instructionAccountId: string;
    instructionAccountDto: InstructionAccountDto;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([
          {
            workspaceId,
            instructionId,
            instructionAccountId,
            instructionAccountDto,
          },
          authority,
        ]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionAccountApiService
            .update({
              authority: authority.toBase58(),
              workspaceId,
              instructionId,
              instructionAccountDto,
              instructionAccountId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Update account request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );

  readonly deleteInstructionAccount = this.effect<{
    workspaceId: string;
    instructionId: string;
    instructionAccountId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([{ workspaceId, instructionId, instructionAccountId }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionAccountApiService
            .delete({
              authority: authority.toBase58(),
              workspaceId,
              instructionAccountId,
              instructionId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Delete account request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );

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
