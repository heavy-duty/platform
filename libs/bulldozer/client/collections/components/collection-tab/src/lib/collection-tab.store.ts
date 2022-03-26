import { Injectable } from '@angular/core';
import { CollectionStore } from '@bulldozer-client/collections-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { combineLatest, concatMap, filter, from, pipe, tap } from 'rxjs';

interface ViewModel {
  collectionId: string | null;
}

const initialState: ViewModel = {
  collectionId: null,
};

@Injectable()
export class CollectionTabStore extends ComponentStore<ViewModel> {
  readonly collectionId$ = this.select(({ collectionId }) => collectionId);

  constructor(
    private readonly _tabStore: TabStore,
    private readonly _collectionStore: CollectionStore,
    workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._collectionStore.setCollectionId(this.collectionId$);
    this._handleCollectionDeleted(
      combineLatest({
        collectionId: this.collectionId$.pipe(isNotNullOrUndefined),
        instructionStatus:
          workspaceInstructionsStore.lastInstructionStatus$.pipe(
            isNotNullOrUndefined
          ),
      })
    );
    this._handleCollectionInstructions(
      combineLatest({
        collectionId: this.collectionId$.pipe(isNotNullOrUndefined),
        instructionStatuses: workspaceInstructionsStore.instructionStatuses$,
      })
    );
    this._handleLastCollectionInstruction(
      combineLatest({
        collectionId: this.collectionId$.pipe(isNotNullOrUndefined),
        instructionStatus:
          workspaceInstructionsStore.lastInstructionStatus$.pipe(
            isNotNullOrUndefined
          ),
      })
    );
  }

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
        tap((collectionInstruction) =>
          this._collectionStore.handleCollectionInstruction(
            collectionInstruction
          )
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

  private readonly _handleCollectionDeleted = this.effect<{
    collectionId: string;
    instructionStatus: InstructionStatus;
  }>(
    pipe(
      filter(
        ({ collectionId, instructionStatus }) =>
          instructionStatus.name === 'deleteCollection' &&
          instructionStatus.status === 'finalized' &&
          instructionStatus.accounts.some(
            (account) =>
              account.name === 'Collection' && account.pubkey === collectionId
          )
      ),
      tap(({ collectionId }) => this._tabStore.closeTab(collectionId))
    )
  );
}
