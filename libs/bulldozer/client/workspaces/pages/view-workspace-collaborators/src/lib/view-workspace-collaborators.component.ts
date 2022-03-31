import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CollaboratorsStore,
  CollaboratorStore,
} from '@bulldozer-client/collaborators-data-access';
import { UserStore } from '@bulldozer-client/users-data-access';
import { map } from 'rxjs';
import {
  CollaboratorStatus,
  ViewWorkspaceCollaboratorsStore,
} from './view-workspace-collaborators.store';

@Component({
  selector: 'bd-view-workspace-collaborators',
  template: `
    <aside class="w-80 flex flex-col gap-2">
      <header class="py-5 px-7 mb-0 w-full">
        <h2 class="uppercase m-0">Collaborators</h2>
        <p>Visualize and manage collaborators.</p>

        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Status</mat-label>
          <mat-select
            [value]="collaboratorStatus$ | ngrxPush"
            (valueChange)="onSetCollaboratorStatus($event)"
          >
            <mat-option value="approved">
              <span
                class="inline-block bg-green-500 w-2 h-2 rounded-full"
              ></span>
              Approved
            </mat-option>
            <mat-option value="pending">
              <span
                class="inline-block bg-yellow-500 w-2 h-2 rounded-full"
              ></span>
              Pending
            </mat-option>
            <mat-option value="rejected">
              <span class="inline-block bg-red-500 w-2 h-2 rounded-full"></span>
              Rejected
            </mat-option>
          </mat-select>
        </mat-form-field>
        <p>Filter by collaborator status</p>
      </header>

      <ul class="flex-1">
        <li *ngFor="let collaborator of collaborators$ | ngrxPush">
          <button
            class="w-full py-5 px-7 border-l-4 flex items-center gap-2"
            [ngClass]="
              (selectedCollaborator$ | ngrxPush)?.id === collaborator.id
                ? 'bg-white bg-opacity-5 border-primary'
                : 'border-transparent'
            "
            (click)="onSelectCollaborator(collaborator.id)"
          >
            <figure
              class="w-12 h-12 overflow-hidden rounded-full flex-shrink-0"
            >
              <img src="assets/images/default-profile.png" class="w-full" />
            </figure>

            <div>
              <p class="m-0 flex">
                <span
                  class="w-44 overflow-hidden whitespace-nowrap overflow-ellipsis"
                >
                  {{ collaborator.id }}
                </span>

                <mat-icon *ngIf="collaborator.data.isAdmin" color="accent">
                  admin_panel_settings
                </mat-icon>
              </p>

              <p class="m-0 flex items-center gap-2">
                <ng-container [ngSwitch]="collaborator.data.status.id">
                  <ng-container *ngSwitchCase="0">
                    <span
                      class="inline-block bg-yellow-500 w-2 h-2 rounded-full"
                    ></span>
                    Pending
                  </ng-container>
                  <ng-container *ngSwitchCase="1">
                    <span
                      class="inline-block bg-green-500 w-2 h-2 rounded-full"
                    ></span>
                    Approved
                  </ng-container>
                  <ng-container *ngSwitchCase="2">
                    <span
                      class="inline-block bg-red-500 w-2 h-2 rounded-full"
                    ></span>
                    Rejected
                  </ng-container>
                </ng-container>
              </p>
            </div>
          </button>
        </li>
      </ul>

      <div class="py-5 px-7 w-full flex justify-center items-center">
        <ng-container *ngIf="workspaceId$ | ngrxPush as workspaceId">
          <ng-container *ngrxLet="collaborator$; let collaborator">
            <button
              *ngIf="collaborator === null"
              mat-stroked-button
              color="primary"
              (click)="onRequestCollaboratorStatus(workspaceId)"
            >
              Become Collaborator
            </button>

            <button
              *ngIf="collaborator !== null && collaborator.data.status.id === 2"
              mat-stroked-button
              color="primary"
              (click)="
                onRetryCollaboratorStatusRequest(workspaceId, collaborator.id)
              "
            >
              Try again
            </button>
          </ng-container>
        </ng-container>
      </div>
    </aside>

    <div class="flex-1 bg-white bg-opacity-5 p-8">
      <div
        *ngIf="selectedCollaborator$ | ngrxPush as selectedCollaborator"
        class="flex flex-col gap-8"
      >
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <figure class="w-20 m-auto relative mr-5">
              <img src="assets/images/default-profile.png" class="w-full" />
            </figure>
            <div>
              <h2
                class="w-64 m-0 overflow-hidden whitespace-nowrap overflow-ellipsis"
              >
                {{ selectedCollaborator.id }}
              </h2>

              <p class="flex m-0 gap-1 text-sm">
                <mat-icon class="w-4" inline>event</mat-icon>
                <span>
                  Collaborator since
                  {{
                    selectedCollaborator.createdAt.toNumber() * 1000
                      | date: 'mediumDate'
                  }}
                </span>
              </p>

              <p class="flex m-0 gap-1 items-center">
                <ng-container [ngSwitch]="selectedCollaborator.data.status.id">
                  <ng-container *ngSwitchCase="0">
                    <span
                      class="inline-block bg-yellow-500 w-2 h-2 rounded-full"
                    ></span>
                    Pending
                  </ng-container>
                  <ng-container *ngSwitchCase="1">
                    <span
                      class="inline-block bg-green-500 w-2 h-2 rounded-full"
                    ></span>
                    Approved
                  </ng-container>
                  <ng-container *ngSwitchCase="2">
                    <span
                      class="inline-block bg-red-500 w-2 h-2 rounded-full"
                    ></span>
                    Rejected
                  </ng-container>
                </ng-container>
              </p>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              *ngIf="selectedCollaborator.data.status.id === 1"
              mat-stroked-button
              color="warn"
              (click)="
                onUpdateCollaborator(
                  selectedCollaborator.data.workspace,
                  selectedCollaborator.id,
                  2
                )
              "
            >
              Revoke
            </button>
            <button
              *ngIf="selectedCollaborator.data.status.id === 0"
              mat-stroked-button
              color="accent"
              (click)="
                onUpdateCollaborator(
                  selectedCollaborator.data.workspace,
                  selectedCollaborator.id,
                  1
                )
              "
            >
              Approve
            </button>
            <button
              *ngIf="selectedCollaborator.data.status.id === 2"
              mat-stroked-button
              color="accent"
              (click)="
                onUpdateCollaborator(
                  selectedCollaborator.data.workspace,
                  selectedCollaborator.id,
                  1
                )
              "
            >
              Grant
            </button>
            <button
              *ngIf="selectedCollaborator.data.status.id === 0"
              mat-stroked-button
              color="warn"
              (click)="
                onUpdateCollaborator(
                  selectedCollaborator.data.workspace,
                  selectedCollaborator.id,
                  2
                )
              "
            >
              Reject
            </button>
          </div>
        </div>

        <div>
          <h3 class="m-0 uppercase">User Info</h3>

          <dl class="flex justify-between gap-4">
            <div class="flex-1">
              <dt>User ID:</dt>
              <dd
                class="flex items-center w-64 gap-1 px-2 bg-black bg-opacity-10 rounded-md"
              >
                <span
                  class="w-48 overflow-hidden whitespace-nowrap overflow-ellipsis"
                >
                  {{ selectedCollaborator.data.user }}
                </span>

                <button mat-icon-button>
                  <mat-icon>content_copy</mat-icon>
                </button>
              </dd>
            </div>

            <div class="flex-1">
              <dt>Wallet:</dt>
              <dd
                class="flex items-center w-64 gap-1 px-2 bg-black bg-opacity-10 rounded-md"
              >
                <span
                  class="w-48 overflow-hidden whitespace-nowrap overflow-ellipsis"
                >
                  {{ selectedCollaborator.data.authority }}
                </span>

                <button mat-icon-button>
                  <mat-icon>content_copy</mat-icon>
                </button>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
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
  @HostBinding('class') class = 'flex h-full';
  readonly workspaceId$ = this._viewWorkspaceCollaboratorsStore.workspaceId$;
  readonly user$ = this._userStore.user$;
  readonly collaboratorStatus$ =
    this._viewWorkspaceCollaboratorsStore.collaboratorStatus$;
  readonly collaborator$ = this._collaboratorStore.collaborator$;
  readonly collaborators$ =
    this._viewWorkspaceCollaboratorsStore.collaborators$;
  readonly selectedCollaborator$ =
    this._viewWorkspaceCollaboratorsStore.selectedCollaborator$;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _viewWorkspaceCollaboratorsStore: ViewWorkspaceCollaboratorsStore,
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

  onSetCollaboratorStatus(status: CollaboratorStatus) {
    this._viewWorkspaceCollaboratorsStore.setCollaboratorStatus(status);
  }

  onSelectCollaborator(collaboratorId: string) {
    this._viewWorkspaceCollaboratorsStore.setCollaboratorId(collaboratorId);
  }
}
