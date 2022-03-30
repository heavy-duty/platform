import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CollaboratorsStore,
  CollaboratorStore,
} from '@bulldozer-client/collaborators-data-access';
import { UserStore } from '@bulldozer-client/users-data-access';
import { WorkspaceStore } from '@bulldozer-client/workspaces-data-access';
import { map } from 'rxjs';
import { ViewWorkspaceCollaboratorsStore } from './view-workspace-collaborators.store';

@Component({
  selector: 'bd-view-workspace-collaborators',
  template: `
    <ng-container *ngIf="workspace$ | ngrxPush as workspace">
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
    </ng-container>
  `,
  styles: [],
  providers: [
    CollaboratorStore,
    CollaboratorsStore,
    UserStore,
    ViewWorkspaceCollaboratorsStore,
  ],
})
export class ViewWorkspaceCollaboratorsComponent implements OnInit {
  readonly user$ = this._userStore.user$;
  readonly collaborator$ = this._collaboratorStore.collaborator$;
  readonly readyCollaborators$ =
    this._viewWorkspaceCollaboratorsStore.readyCollaborators$;
  readonly pendingCollaborators$ =
    this._viewWorkspaceCollaboratorsStore.pendingCollaborators$;
  readonly workspace$ = this._workspaceStore.workspace$;
  readonly showRejectedCollaborators$ =
    this._viewWorkspaceCollaboratorsStore.showRejectedCollaborators$;
  readonly collaboratorListMode$ =
    this._viewWorkspaceCollaboratorsStore.collaboratorListMode$;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _viewWorkspaceCollaboratorsStore: ViewWorkspaceCollaboratorsStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _userStore: UserStore,
    private readonly _collaboratorStore: CollaboratorStore
  ) {}

  ngOnInit() {
    this._viewWorkspaceCollaboratorsStore.setWorkspaceId(
      this._route.paramMap.pipe(map((paramMap) => paramMap.get('workspaceId')))
    );
  }

  onRequestCollaboratorStatus(workspaceId: string) {
    this._viewWorkspaceCollaboratorsStore.requestCollaboratorStatus({
      workspaceId,
    });
  }

  onRetryCollaboratorStatusRequest(
    workspaceId: string,
    collaboratorId: string
  ) {
    this._viewWorkspaceCollaboratorsStore.retryCollaboratorStatusRequest({
      workspaceId,
      collaboratorId,
    });
  }

  onUpdateCollaborator(
    workspaceId: string,
    collaboratorId: string,
    status: number
  ) {
    this._viewWorkspaceCollaboratorsStore.updateCollaborator({
      workspaceId,
      collaboratorId,
      status,
    });
  }

  onSetCollaboratorListMode(mode: 'ready' | 'pending') {
    this._viewWorkspaceCollaboratorsStore.setCollaboratorListMode(mode);
  }

  onToggleShowRejectedCollaborators() {
    this._viewWorkspaceCollaboratorsStore.toggleShowRejectedCollaborators();
  }
}
