import { Injectable } from '@angular/core';
import { ApplicationStore } from '@bulldozer-client/applications-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';
import { Application, Document } from '@heavy-duty/bulldozer-devkit';
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
  readonly showSpinner$ = this.select(
    this._applicationStore.application$,
    this._applicationStore.isCreating$,
    this._applicationStore.isUpdating$,
    this._applicationStore.isDeleting$,
    (application, isCreating, isUpdating, isDeleting) =>
      application !== null && (isCreating || isUpdating || isDeleting)
  );
  readonly tooltipMessage$ = this.select(
    this._applicationStore.application$,
    this._applicationStore.isCreating$,
    this._applicationStore.isUpdating$,
    this._applicationStore.isDeleting$,
    (application, isCreating, isUpdating, isDeleting) => {
      if (application === null) {
        return '';
      }

      const message = `Application "${application.name}"`;

      if (isCreating) {
        return `${message} being created...`;
      } else if (isUpdating) {
        return `${message} being updated...`;
      } else if (isDeleting) {
        return `${message} being deleted...`;
      }

      return `${message}.`;
    }
  );

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
    this.effect<Document<Application> | null>(
      pipe(
        pairwise(),
        filter(
          ([previousApplication, currentApplication]) =>
            previousApplication !== null && currentApplication === null
        ),
        tap(([application]) => {
          if (application !== null) {
            this._tabStore.closeTab(application.id);
          }
        })
      )
    );

  closeTab(tabId: string) {
    this._tabStore.closeTab(tabId);
  }
}
