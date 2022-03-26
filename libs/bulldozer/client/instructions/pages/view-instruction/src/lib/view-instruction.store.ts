import { Injectable } from '@angular/core';
import {
  CollectionQueryStore,
  CollectionsStore,
} from '@bulldozer-client/collections-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { InstructionStore } from '@bulldozer-client/instructions-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { concatMap, filter, from, map, pipe, tap } from 'rxjs';
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
    private readonly _tabStore: TabStore,
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
    this._handleCollectionInstructions(
      workspaceInstructionsStore.instructionStatuses$
    );
    this._handleLastCollectionInstruction(
      workspaceInstructionsStore.lastInstructionStatus$.pipe(
        isNotNullOrUndefined
      )
    );
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

  private readonly _handleCollectionInstructions = this.effect<
    InstructionStatus[]
  >(
    concatMap((instructionStatuses) =>
      from(instructionStatuses).pipe(
        filter(
          (instructionStatus) =>
            (instructionStatus.name === 'createCollection' ||
              instructionStatus.name === 'updateCollection' ||
              instructionStatus.name === 'deleteCollection') &&
            (instructionStatus.status === 'confirmed' ||
              instructionStatus.status === 'finalized')
        ),
        tap((instructionStatus) =>
          this._collectionsStore.handleCollectionInstruction(instructionStatus)
        )
      )
    )
  );

  private readonly _handleLastCollectionInstruction =
    this.effect<InstructionStatus>(
      pipe(
        filter(
          (instructionStatus) =>
            (instructionStatus.name === 'createCollection' ||
              instructionStatus.name === 'updateCollection' ||
              instructionStatus.name === 'deleteCollection') &&
            (instructionStatus.status === 'confirmed' ||
              instructionStatus.status === 'finalized')
        ),
        tap((instructionStatus) =>
          this._collectionsStore.handleCollectionInstruction(instructionStatus)
        )
      )
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
}
