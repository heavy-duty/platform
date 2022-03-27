import { Injectable } from '@angular/core';
import { CollectionStore } from '@bulldozer-client/collections-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { filter, switchMap, tap } from 'rxjs';

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
    this._handleInstruction(
      this.collectionId$.pipe(
        isNotNullOrUndefined,
        switchMap((collectionId) =>
          workspaceInstructionsStore.instruction$.pipe(
            filter((instruction) =>
              instruction.accounts.some(
                (account) =>
                  account.name === 'Collection' &&
                  account.pubkey === collectionId
              )
            )
          )
        )
      )
    );
    this._handleCollectionDeleted(
      this.select(
        this.collectionId$.pipe(isNotNullOrUndefined),
        workspaceInstructionsStore.instruction$.pipe(
          filter(
            (instruction) =>
              instruction.name === 'deleteCollection' &&
              instruction.status === 'finalized'
          )
        ),
        (collectionId, instructionStatus) => ({
          collectionId,
          instructionStatus,
        })
      ).pipe(
        filter(({ collectionId, instructionStatus }) =>
          instructionStatus.accounts.some(
            (account) =>
              account.name === 'Collection' && account.pubkey === collectionId
          )
        )
      )
    );
  }

  readonly setCollectionId = this.updater<string | null>(
    (state, collectionId) => ({ ...state, collectionId })
  );

  private readonly _handleInstruction = this.effect<InstructionStatus>(
    tap((instructionStatus) => {
      switch (instructionStatus.name) {
        case 'createCollection':
        case 'updateCollection':
        case 'deleteCollection': {
          this._collectionStore.dispatch(instructionStatus);
          break;
        }
        default:
          break;
      }
    })
  );

  private readonly _handleCollectionDeleted = this.effect<{
    collectionId: string;
    instructionStatus: InstructionStatus;
  }>(tap(({ collectionId }) => this._tabStore.closeTab(collectionId)));
}
