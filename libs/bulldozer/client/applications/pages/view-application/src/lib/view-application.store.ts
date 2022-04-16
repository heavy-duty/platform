import { Injectable } from '@angular/core';
import { ApplicationStore } from '@bulldozer-client/applications-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
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

  constructor(
    private readonly _tabStore: TabStore,
    private readonly _applicationStore: ApplicationStore,
    workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._applicationStore.setApplicationId(this.applicationId$);
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
    /* this._handleInstruction(
      this.applicationId$.pipe(
        isNotNullOrUndefined,
        switchMap((applicationId) =>
          workspaceInstructionsStore.instruction$.pipe(
            filter((instruction) =>
              instruction.accounts.some(
                (account) =>
                  account.name === 'Application' &&
                  account.pubkey === applicationId
              )
            )
          )
        )
      )
    ); */
  }

  readonly setApplicationId = this.updater<string | null>(
    (state, applicationId) => ({ ...state, applicationId })
  );

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({ ...state, workspaceId })
  );

  /* private readonly _handleInstruction = this.effect<InstructionStatus>(
    tap((instructionStatus) => {
      switch (instructionStatus.name) {
        case 'createApplication':
        case 'updateApplication':
        case 'deleteApplication': {
          this._applicationStore.dispatch(instructionStatus);
          break;
        }
        default:
          break;
      }
    })
  ); */

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
