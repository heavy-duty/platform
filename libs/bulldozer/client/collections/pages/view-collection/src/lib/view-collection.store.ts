import { Injectable } from '@angular/core';
import {
  CollectionAttributeApiService,
  CollectionAttributeQueryStore,
  CollectionAttributesStore,
  CollectionStore,
} from '@bulldozer-client/collections-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { CollectionAttributeDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  combineLatest,
  concatMap,
  EMPTY,
  filter,
  from,
  of,
  pipe,
  tap,
  withLatestFrom,
} from 'rxjs';

interface ViewModel {
  collectionId: string | null;
  applicationId: string | null;
  workspaceId: string | null;
}

const initialState: ViewModel = {
  collectionId: null,
  applicationId: null,
  workspaceId: null,
};

@Injectable()
export class ViewCollectionStore extends ComponentStore<ViewModel> {
  readonly collectionId$ = this.select(({ collectionId }) => collectionId);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  private readonly _changes$ = this.select(
    this.collectionId$.pipe(isNotNullOrUndefined),
    this._workspaceInstructionsStore.instructionStatuses$,
    (collectionId, instructionStatuses) => ({
      collectionId,
      instructionStatuses,
    }),
    { debounce: true }
  );
  private readonly _lastChange$ = this.select(
    this.collectionId$.pipe(isNotNullOrUndefined),
    this._workspaceInstructionsStore.lastInstructionStatus$.pipe(
      isNotNullOrUndefined
    ),
    (collectionId, instructionStatus) => ({
      collectionId,
      instructionStatus,
    }),
    { debounce: true }
  );

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _collectionAttributeApiService: CollectionAttributeApiService,
    private readonly _collectionStore: CollectionStore,
    private readonly _collectionAttributesStore: CollectionAttributesStore,
    private readonly _collectionAttributeQueryStore: CollectionAttributeQueryStore,
    private readonly _tabStore: TabStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._collectionAttributeQueryStore.setFilters(
      combineLatest({
        collection: this.collectionId$.pipe(isNotNullOrUndefined),
      })
    );
    this._collectionAttributesStore.setCollectionAttributeIds(
      this._collectionAttributeQueryStore.collectionAttributeIds$
    );

    this._collectionStore.setCollectionId(this.collectionId$);
    this._openTab(
      this.select(
        this.collectionId$,
        this.applicationId$,
        this.workspaceId$,
        (collectionId, applicationId, workspaceId) => ({
          collectionId,
          applicationId,
          workspaceId,
        }),
        { debounce: true }
      )
    );
    this._handleCollectionInstructions(this._changes$);
    this._handleLastCollectionInstruction(this._lastChange$);
    this._handleCollectionAttributeInstructions(this._changes$);
    this._handleLastCollectionAttributeInstruction(this._lastChange$);
  }

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({ ...state, workspaceId })
  );

  readonly setApplicationId = this.updater<string | null>(
    (state, applicationId) => ({ ...state, applicationId })
  );

  readonly setCollectionId = this.updater<string | null>(
    (state, collectionId) => ({ ...state, collectionId })
  );

  private readonly _handleCollectionInstructions = this.effect<{
    collectionId: string;
    instructionStatuses: InstructionStatus[];
  }>(
    concatMap(({ collectionId, instructionStatuses }) =>
      from(instructionStatuses).pipe(
        filter(
          (instructionStatus) =>
            (instructionStatus.name === 'createCollection' ||
              instructionStatus.name === 'updateCollection' ||
              instructionStatus.name === 'deleteCollection') &&
            (instructionStatus.status === 'confirmed' ||
              instructionStatus.status === 'finalized') &&
            instructionStatus.accounts.some(
              (account) =>
                account.name === 'Collection' && account.pubkey === collectionId
            )
        ),
        tap((instructionStatus) =>
          this._collectionStore.handleCollectionInstruction(instructionStatus)
        )
      )
    )
  );

  private readonly _handleLastCollectionInstruction = this.effect<{
    collectionId: string;
    instructionStatus: InstructionStatus;
  }>(
    pipe(
      filter(
        ({ collectionId, instructionStatus }) =>
          (instructionStatus.name === 'createCollection' ||
            instructionStatus.name === 'updateCollection' ||
            instructionStatus.name === 'deleteCollection') &&
          (instructionStatus.status === 'confirmed' ||
            instructionStatus.status === 'finalized') &&
          instructionStatus.accounts.some(
            (account) =>
              account.name === 'Collection' && account.pubkey === collectionId
          )
      ),
      tap(({ instructionStatus }) =>
        this._collectionStore.handleCollectionInstruction(instructionStatus)
      )
    )
  );

  private readonly _handleCollectionAttributeInstructions = this.effect<{
    collectionId: string;
    instructionStatuses: InstructionStatus[];
  }>(
    concatMap(({ collectionId, instructionStatuses }) =>
      from(instructionStatuses).pipe(
        filter(
          (instructionStatus) =>
            (instructionStatus.name === 'createCollectionAttribute' ||
              instructionStatus.name === 'updateCollectionAttribute' ||
              instructionStatus.name === 'deleteCollectionAttribute') &&
            (instructionStatus.status === 'confirmed' ||
              instructionStatus.status === 'finalized') &&
            instructionStatus.accounts.some(
              (account) =>
                account.name === 'Collection' && account.pubkey === collectionId
            )
        ),
        tap((instructionStatus) =>
          this._collectionAttributesStore.handleCollectionAttributeInstruction(
            instructionStatus
          )
        )
      )
    )
  );

  private readonly _handleLastCollectionAttributeInstruction = this.effect<{
    collectionId: string;
    instructionStatus: InstructionStatus;
  }>(
    pipe(
      filter(
        ({ collectionId, instructionStatus }) =>
          (instructionStatus.name === 'createCollectionAttribute' ||
            instructionStatus.name === 'updateCollectionAttribute' ||
            instructionStatus.name === 'deleteCollectionAttribute') &&
          (instructionStatus.status === 'confirmed' ||
            instructionStatus.status === 'finalized') &&
          instructionStatus.accounts.some(
            (account) =>
              account.name === 'Collection' && account.pubkey === collectionId
          )
      ),
      tap(({ instructionStatus }) =>
        this._collectionAttributesStore.handleCollectionAttributeInstruction(
          instructionStatus
        )
      )
    )
  );

  private readonly _openTab = this.effect<{
    collectionId: string | null;
    applicationId: string | null;
    workspaceId: string | null;
  }>(
    tap(({ collectionId, applicationId, workspaceId }) => {
      if (
        collectionId !== null &&
        applicationId !== null &&
        workspaceId !== null
      ) {
        this._tabStore.openTab({
          id: collectionId,
          kind: 'collection',
          url: `/workspaces/${workspaceId}/applications/${applicationId}/collections/${collectionId}`,
        });
      }
    })
  );

  readonly createCollectionAttribute = this.effect<{
    workspaceId: string;
    applicationId: string;
    collectionId: string;
    collectionAttributeDto: CollectionAttributeDto;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([
          { workspaceId, applicationId, collectionId, collectionAttributeDto },
          authority,
        ]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._collectionAttributeApiService
            .create({
              collectionAttributeDto,
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
              collectionId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Create attribute request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );

  readonly updateCollectionAttribute = this.effect<{
    workspaceId: string;
    collectionId: string;
    collectionAttributeId: string;
    collectionAttributeDto: CollectionAttributeDto;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([
          {
            workspaceId,
            collectionId,
            collectionAttributeId,
            collectionAttributeDto,
          },
          authority,
        ]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._collectionAttributeApiService
            .update({
              authority: authority.toBase58(),
              workspaceId,
              collectionId,
              collectionAttributeDto,
              collectionAttributeId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Update attribute request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );

  readonly deleteCollectionAttribute = this.effect<{
    workspaceId: string;
    collectionId: string;
    collectionAttributeId: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([{ workspaceId, collectionId, collectionAttributeId }, authority]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._collectionAttributeApiService
            .delete({
              authority: authority.toBase58(),
              workspaceId,
              collectionAttributeId,
              collectionId,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent(
                    'Delete attribute request sent'
                  ),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );
}
