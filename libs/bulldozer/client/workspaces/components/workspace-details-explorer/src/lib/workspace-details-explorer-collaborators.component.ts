import { Component } from '@angular/core';
import { CollaboratorStore } from '@bulldozer-client/collaborators-data-access';
import { UserStore } from '@bulldozer-client/users-data-access';
import { WorkspaceStore } from '@bulldozer-client/workspaces-data-access';
import { WorkspaceDetailsExplorerStore } from './workspace-details-explorer.store';

@Component({
  selector: 'bd-workspace-details-explorer-collaborators',
  template: `
    <div *ngIf="workspace$ | ngrxPush as workspace">
      <bd-collaborators-list
        [showRejected]="(showRejectedCollaborators$ | ngrxPush) ?? false"
        [mode]="(collaboratorListMode$ | ngrxPush) ?? 'ready'"
        [currentUser]="(user$ | ngrxPush) ?? null"
        [currentCollaborator]="(collaborator$ | ngrxPush) ?? null"
        [readyCollaborators]="(readyCollaborators$ | ngrxPush) ?? null"
        [pendingCollaborators]="(pendingCollaborators$ | ngrxPush) ?? null"
        (approveCollaboratorStatusRequest)="
          onUpdateCollaborator(workspace.document.id, $event, 1)
        "
        (grantCollaboratorStatus)="
          onUpdateCollaborator(workspace.document.id, $event, 1)
        "
        (rejectCollaboratorStatusRequest)="
          onUpdateCollaborator(workspace.document.id, $event, 2)
        "
        (requestCollaboratorStatus)="
          onRequestCollaboratorStatus(workspace.document.id)
        "
        (revokeCollaboratorStatus)="
          onUpdateCollaborator(workspace.document.id, $event, 2)
        "
        (retryCollaboratorStatusRequest)="
          onRetryCollaboratorStatusRequest(workspace.document.id, $event)
        "
        (setCollaboratorListMode)="onSetCollaboratorListMode($event)"
        (toggleShowRejected)="onToggleShowRejectedCollaborators()"
      ></bd-collaborators-list>
    </div>
  `,
  styles: [],
})
export class WorkspaceDetailsExplorerCollaboratorsComponent {
  readonly user$ = this._userStore.user$;
  readonly collaborator$ = this._collaboratorStore.collaborator$;
  readonly readyCollaborators$ =
    this._workspaceDetailsExploreStore.readyCollaborators$;
  readonly pendingCollaborators$ =
    this._workspaceDetailsExploreStore.pendingCollaborators$;
  readonly workspace$ = this._workspaceStore.workspace$;
  readonly showRejectedCollaborators$ =
    this._workspaceDetailsExploreStore.showRejectedCollaborators$;
  readonly collaboratorListMode$ =
    this._workspaceDetailsExploreStore.collaboratorListMode$;
  constructor(
    private readonly _workspaceDetailsExploreStore: WorkspaceDetailsExplorerStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _userStore: UserStore,
    private readonly _collaboratorStore: CollaboratorStore
  ) {}

  onRequestCollaboratorStatus(workspaceId: string) {
    this._workspaceDetailsExploreStore.requestCollaboratorStatus({
      workspaceId,
    });
  }

  onRetryCollaboratorStatusRequest(
    workspaceId: string,
    collaboratorId: string
  ) {
    this._workspaceDetailsExploreStore.retryCollaboratorStatusRequest({
      workspaceId,
      collaboratorId,
    });
  }

  onUpdateCollaborator(
    workspaceId: string,
    collaboratorId: string,
    status: number
  ) {
    this._workspaceDetailsExploreStore.updateCollaborator({
      workspaceId,
      collaboratorId,
      status,
    });
  }

  onSetCollaboratorListMode(mode: 'ready' | 'pending') {
    this._workspaceDetailsExploreStore.setCollaboratorListMode(mode);
  }

  onToggleShowRejectedCollaborators() {
    this._workspaceDetailsExploreStore.toggleShowRejectedCollaborators();
  }
}
