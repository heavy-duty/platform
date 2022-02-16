import { Injectable } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
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

  constructor(private readonly _tabStore: TabStore, route: ActivatedRoute) {
    super(initialState);

    this._setRouteParameters(route.paramMap);
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
  }

  private readonly _setRouteParameters = this.updater<ParamMap>(
    (state, paramMap) => ({
      ...state,
      collectionId: paramMap.get('collectionId'),
      applicationId: paramMap.get('applicationId'),
      workspaceId: paramMap.get('workspaceId'),
    })
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
