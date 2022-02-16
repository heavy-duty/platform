import { Injectable } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TabStore } from '@bulldozer-client/core-data-access';
import { ComponentStore } from '@ngrx/component-store';
import { tap } from 'rxjs';

interface ViewModel {
  workspaceId: string | null;
  applicationId: string | null;
}

const initialState: ViewModel = {
  workspaceId: null,
  applicationId: null,
};

@Injectable()
export class ViewApplicationStore extends ComponentStore<ViewModel> {
  readonly workspaceId$ = this.select(({ workspaceId }) => workspaceId);
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);

  constructor(private readonly _tabStore: TabStore, route: ActivatedRoute) {
    super(initialState);

    this._openTab(
      this.select(
        this.applicationId$,
        this.workspaceId$,
        (applicationId, workspaceId) => ({
          applicationId,
          workspaceId,
        }),
        { debounce: true }
      )
    );
    this._setRouteParameters(route.paramMap);
  }

  private readonly _setRouteParameters = this.updater<ParamMap>(
    (state, paramMap) => ({
      ...state,
      workspaceId: paramMap.get('workspaceId'),
      applicationId: paramMap.get('applicationId'),
    })
  );

  private readonly _openTab = this.effect<{
    applicationId: string | null;
    workspaceId: string | null;
  }>(
    tap(({ applicationId, workspaceId }) => {
      if (applicationId !== null && workspaceId !== null) {
        this._tabStore.openTab({
          id: applicationId,
          kind: 'application',
          url: `/workspaces/${workspaceId}/applications/${applicationId}`,
        });
      }
    })
  );
}
