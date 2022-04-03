import { Injectable } from '@angular/core';
import { CollectionStore } from '@bulldozer-client/collections-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { ComponentStore } from '@ngrx/component-store';
import { tap } from 'rxjs';

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
    private readonly _tabStore: TabStore,
    private readonly _collectionStore: CollectionStore
  ) {
    super(initialState);

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

    this._collectionStore.setCollectionId(this.collectionId$);
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
