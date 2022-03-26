import { Injectable } from '@angular/core';
import { CollectionStore } from '@bulldozer-client/collections-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { concatMap, filter, from, pipe, tap } from 'rxjs';

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

  constructor(
    private readonly _collectionStore: CollectionStore,
    private readonly _tabStore: TabStore,
    workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

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
    this._handleCollectionInstructions(
      this.select(
        this.collectionId$.pipe(isNotNullOrUndefined),
        workspaceInstructionsStore.instructionStatuses$,
        (collectionId, instructionStatuses) => ({
          collectionId,
          instructionStatuses,
        }),
        { debounce: true }
      )
    );
    this._handleLastCollectionInstruction(
      this.select(
        this.collectionId$.pipe(isNotNullOrUndefined),
        workspaceInstructionsStore.lastInstructionStatus$.pipe(
          isNotNullOrUndefined
        ),
        (collectionId, instructionStatus) => ({
          collectionId,
          instructionStatus,
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
}
