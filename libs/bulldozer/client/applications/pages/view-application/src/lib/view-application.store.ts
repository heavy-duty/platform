import { Injectable } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ApplicationStore } from '@bulldozer-client/applications-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { concatMap, filter, from, merge, switchMap, take, tap } from 'rxjs';

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

  constructor(
    private readonly _tabStore: TabStore,
    private readonly _workspaceInstructionsStore: WorkspaceInstructionsStore,
    private readonly _applicationStore: ApplicationStore,
    route: ActivatedRoute
  ) {
    super(initialState);

    this._watchApplication(this.applicationId$);
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

  private readonly _watchApplication = this.effect<string | null>(
    switchMap((applicationId) =>
      merge(
        this._workspaceInstructionsStore.instructionStatuses$.pipe(
          take(1),
          concatMap((instructionStatuses) => from(instructionStatuses))
        ),
        this._workspaceInstructionsStore.lastInstructionStatus$.pipe(
          isNotNullOrUndefined
        )
      ).pipe(
        filter(
          (instructionStatus) =>
            (instructionStatus.name === 'createApplication' ||
              instructionStatus.name === 'updateApplication' ||
              instructionStatus.name === 'deleteApplication') &&
            (instructionStatus.status === 'confirmed' ||
              instructionStatus.status === 'finalized') &&
            instructionStatus.accounts.some(
              (account) =>
                account.name === 'Application' &&
                account.pubkey === applicationId
            )
        ),
        tap((applicationInstruction) =>
          this._applicationStore.handleApplicationInstruction(
            applicationInstruction
          )
        )
      )
    )
  );

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
