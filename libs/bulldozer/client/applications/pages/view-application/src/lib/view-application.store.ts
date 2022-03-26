import { Injectable } from '@angular/core';
import { ApplicationStore } from '@bulldozer-client/applications-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { concatMap, filter, from, pipe, tap } from 'rxjs';

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
    this._handleApplicationInstructions(
      this.select(
        this.applicationId$.pipe(isNotNullOrUndefined),
        workspaceInstructionsStore.instructionStatuses$,
        (applicationId, instructionStatuses) => ({
          applicationId,
          instructionStatuses,
        }),
        { debounce: true }
      )
    );
    this._handleLastApplicationInstruction(
      this.select(
        this.applicationId$.pipe(isNotNullOrUndefined),
        workspaceInstructionsStore.lastInstructionStatus$.pipe(
          isNotNullOrUndefined
        ),
        (applicationId, instructionStatus) => ({
          applicationId,
          instructionStatus,
        }),
        { debounce: true }
      )
    );
  }

  readonly setApplicationId = this.updater<string | null>(
    (state, applicationId) => ({ ...state, applicationId })
  );

  readonly setWorkspaceId = this.updater<string | null>(
    (state, workspaceId) => ({ ...state, workspaceId })
  );

  private readonly _handleApplicationInstructions = this.effect<{
    applicationId: string;
    instructionStatuses: InstructionStatus[];
  }>(
    concatMap(({ applicationId, instructionStatuses }) =>
      from(instructionStatuses).pipe(
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

  private readonly _handleLastApplicationInstruction = this.effect<{
    applicationId: string;
    instructionStatus: InstructionStatus;
  }>(
    pipe(
      filter(
        ({ applicationId, instructionStatus }) =>
          (instructionStatus.name === 'createApplication' ||
            instructionStatus.name === 'updateApplication' ||
            instructionStatus.name === 'deleteApplication') &&
          (instructionStatus.status === 'confirmed' ||
            instructionStatus.status === 'finalized') &&
          instructionStatus.accounts.some(
            (account) =>
              account.name === 'Application' && account.pubkey === applicationId
          )
      ),
      tap(({ instructionStatus }) =>
        this._applicationStore.handleApplicationInstruction(instructionStatus)
      )
    )
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
