import { Injectable } from '@angular/core';
import {
  CollectionQueryStore,
  CollectionsStore,
} from '@bulldozer-client/collections-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import {
  InstructionApiService,
  InstructionStore,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, map, of, pipe, tap, withLatestFrom } from 'rxjs';

interface ViewModel {
  instructionId: string | null;
  applicationId: string | null;
  workspaceId: string | null;
}

const initialState: ViewModel = {
  instructionId: null,
  applicationId: null,
  workspaceId: null,
};

@Injectable()
export class ViewInstructionStore extends ComponentStore<ViewModel> {
  readonly instructionId$ = this.select(({ instructionId }) => instructionId);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _tabStore: TabStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _instructionApiService: InstructionApiService,
    private readonly _instructionStore: InstructionStore,
    private readonly _collectionsStore: CollectionsStore,
    private readonly _collectionQueryStore: CollectionQueryStore,
    workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._instructionStore.setInstructionId(this.instructionId$);
    this._collectionQueryStore.setFilters(
      this.applicationId$.pipe(
        isNotNullOrUndefined,
        map((application) => ({ application }))
      )
    );
    this._collectionsStore.setCollectionIds(
      this._collectionQueryStore.collectionIds$
    );

    this._handleInstruction(workspaceInstructionsStore.instruction$);
    this._openTab(
      this.select(
        this.instructionId$,
        this.applicationId$,
        this.workspaceId$,
        (instructionId, applicationId, workspaceId) => ({
          instructionId,
          applicationId,
          workspaceId,
        }),
        { debounce: true }
      )
    );
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

  private readonly _handleInstruction = this.effect<InstructionStatus>(
    tap((instructionStatus) => {
      switch (instructionStatus.name) {
        case 'createInstruction':
        case 'updateInstruction':
        case 'deleteInstruction': {
          this._instructionStore.dispatch(instructionStatus);
          break;
        }
        case 'createCollection':
        case 'updateCollection':
        case 'deleteCollection': {
          this._collectionsStore.dispatch(instructionStatus);
          break;
        }
        default:
          break;
      }
    })
  );

  private readonly _openTab = this.effect<{
    instructionId: string | null;
    applicationId: string | null;
    workspaceId: string | null;
  }>(
    tap(({ instructionId, applicationId, workspaceId }) => {
      if (
        instructionId !== null &&
        applicationId !== null &&
        workspaceId !== null
      ) {
        this._tabStore.openTab({
          id: instructionId,
          kind: 'instruction',
          url: `/workspaces/${workspaceId}/applications/${applicationId}/instructions/${instructionId}`,
        });
      }
    })
  );

  readonly updateInstructionBody = this.effect<{
    workspaceId: string;
    applicationId: string;
    instructionId: string;
    instructionBody: string;
  }>(
    pipe(
      concatMap((request) =>
        of(request).pipe(withLatestFrom(this._walletStore.publicKey$))
      ),
      concatMap(
        ([
          { workspaceId, applicationId, instructionId, instructionBody },
          authority,
        ]) => {
          if (authority === null) {
            return EMPTY;
          }

          return this._instructionApiService
            .updateBody({
              authority: authority.toBase58(),
              workspaceId,
              applicationId,
              instructionId,
              instructionBody,
            })
            .pipe(
              tapResponse(
                () =>
                  this._notificationStore.setEvent('Update body request sent'),
                (error) => this._notificationStore.setError(error)
              )
            );
        }
      )
    )
  );
}
