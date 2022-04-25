import { Injectable } from '@angular/core';
import { ApplicationStore } from '@bulldozer-client/applications-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { InstructionStatus } from '@bulldozer-client/users-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { filter, tap } from 'rxjs';

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
    this._handleApplicationDeleted(
      this.select(
        this.applicationId$.pipe(isNotNullOrUndefined),
        workspaceInstructionsStore.instruction$.pipe(
          filter(
            (instruction) =>
              instruction.name === 'deleteApplication' &&
              instruction.status === 'finalized'
          )
        ),
        (applicationId, instructionStatus) => ({
          applicationId,
          instructionStatus,
        })
      ).pipe(
        filter(({ applicationId, instructionStatus }) =>
          instructionStatus.accounts.some(
            (account) =>
              account.name === 'Application' && account.pubkey === applicationId
          )
        )
      )
    );
  }

  readonly setApplicationId = this.updater<string | null>(
    (state, applicationId) => ({ ...state, applicationId })
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

  private readonly _handleApplicationDeleted = this.effect<{
    applicationId: string;
    instructionStatus: InstructionStatus;
  }>(tap(({ applicationId }) => this._tabStore.closeTab(applicationId)));
}
