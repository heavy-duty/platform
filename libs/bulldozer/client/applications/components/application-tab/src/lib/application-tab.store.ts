import { Injectable } from '@angular/core';
import {
  ApplicationStore,
  ApplicationView,
} from '@bulldozer-client/applications-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import {
  concatMap,
  filter,
  from,
  merge,
  pairwise,
  pipe,
  switchMap,
  take,
  tap,
} from 'rxjs';

@Injectable()
export class ApplicationTabStore extends ComponentStore<object> {
  constructor(
    private readonly _tabStore: TabStore,
    private readonly _workspaceInstructionsStore: WorkspaceInstructionsStore,
    private readonly _applicationStore: ApplicationStore
  ) {
    super({});

    this._handleApplicationDeleted(this._applicationStore.application$);
    this._watchApplication(this._applicationStore.applicationId$);
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
        tap((workspaceInstruction) =>
          this._applicationStore.handleApplicationInstruction(
            workspaceInstruction
          )
        )
      )
    )
  );

  private readonly _handleApplicationDeleted =
    this.effect<ApplicationView | null>(
      pipe(
        pairwise(),
        filter(
          ([previousApplication, currentApplication]) =>
            previousApplication !== null && currentApplication === null
        ),
        tap(([application]) => {
          if (application !== null) {
            this._tabStore.closeTab(application.document.id);
          }
        })
      )
    );

  closeTab(tabId: string) {
    this._tabStore.closeTab(tabId);
  }
}
