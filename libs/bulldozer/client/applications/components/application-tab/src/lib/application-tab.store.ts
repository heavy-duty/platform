import { Injectable } from '@angular/core';
import { ApplicationStore } from '@bulldozer-client/applications-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { combineLatest, concatMap, filter, from, pipe, tap } from 'rxjs';

interface ViewModel {
  applicationId: string | null;
}

const initialState: ViewModel = {
  applicationId: null,
};

@Injectable()
export class ApplicationTabStore extends ComponentStore<ViewModel> {
  readonly applicationId$ = this.select(({ applicationId }) => applicationId);

  constructor(
    private readonly _tabStore: TabStore,
    private readonly _applicationStore: ApplicationStore,
    workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._applicationStore.setApplicationId(this.applicationId$);
    this._handleApplicationDeleted(
      combineLatest({
        applicationId: this.applicationId$.pipe(isNotNullOrUndefined),
        instructionStatus:
          workspaceInstructionsStore.lastInstructionStatus$.pipe(
            isNotNullOrUndefined
          ),
      })
    );
    this._handleApplicationInstructions(
      combineLatest({
        applicationId: this.applicationId$.pipe(isNotNullOrUndefined),
        instructionStatuses: workspaceInstructionsStore.instructionStatuses$,
      })
    );
    this._handleLastApplicationInstruction(
      combineLatest({
        applicationId: this.applicationId$.pipe(isNotNullOrUndefined),
        instructionStatus:
          workspaceInstructionsStore.lastInstructionStatus$.pipe(
            isNotNullOrUndefined
          ),
      })
    );
  }

  readonly setApplicationId = this.updater<string | null>(
    (state, applicationId) => ({ ...state, applicationId })
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

  private readonly _handleApplicationDeleted = this.effect<{
    applicationId: string;
    instructionStatus: InstructionStatus;
  }>(
    pipe(
      filter(
        ({ applicationId, instructionStatus }) =>
          instructionStatus.name === 'deleteApplication' &&
          instructionStatus.status === 'finalized' &&
          instructionStatus.accounts.some(
            (account) =>
              account.name === 'Application' && account.pubkey === applicationId
          )
      ),
      tap(({ applicationId }) => this._tabStore.closeTab(applicationId))
    )
  );
}
