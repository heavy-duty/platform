import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CollaboratorQueryStore,
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
        <h1 class="text-2xl uppercase m-0">Collaborators</h1>
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
              (selectedCollaborator$ | ngrxPush)?.document?.id ===
              collaborator.document.id
                ? 'bg-white bg-opacity-5 border-primary'
                : 'border-transparent'
            "
            (click)="onSelectCollaborator(collaborator.document.id)"
          >
            <figure class="w-12 h-12 rounded-full overflow-hidden">
              <img
                [src]="collaborator.user?.data?.thumbnailUrl"
                class="w-full"
                onerror="this.src='assets/images/default-profile.png';"
              />
            </figure>

            <div>
              <p class="m-0 text-left">
                <span
                  class="text-lg font-bold w-44 overflow-hidden whitespace-nowrap overflow-ellipsis"
                >
                  {{ collaborator.user?.name }}
                </span>

                <mat-icon
                  class="inline"
                  *ngIf="collaborator.document.data.isAdmin"
                  color="accent"
                  inline
                >
                  admin_panel_settings
                </mat-icon>
              </p>

              <p class="m-0 text-xs text-left">
                <a
                  [href]="
                    'https://explorer.solana.com/address/' +
                    collaborator.user?.id
                  "
                  target="__blank"
                  class="text-accent underline"
                  >(@{{ collaborator.user?.data?.userName }})</a
                >
              </p>

              <p class="m-0 text-xs text-left">
                <span
                  class="inline-block w-2 h-2 rounded-full"
                  [ngClass]="{
                    'bg-yellow-500': collaborator.document.data.status.id === 0,
                    'bg-green-500': collaborator.document.data.status.id === 1,
                    'bg-red-500': collaborator.document.data.status.id === 2
                  }"
                ></span>
                <span class="text-white text-opacity-50">
                  <ng-container
                    [ngSwitch]="collaborator.document.data.status.id"
                  >
                    <ng-container *ngSwitchCase="0"> Pending </ng-container>
                    <ng-container *ngSwitchCase="1"> Approved </ng-container>
                    <ng-container *ngSwitchCase="2"> Rejected </ng-container>
                  </ng-container>
                </span>
              </p>
            </div>
          </button>
        </li>
      </ul>

      <footer
        class="py-5 px-7 w-full flex justify-center items-center"
        *ngIf="workspaceId$ | ngrxPush as workspaceId"
      >
        <ng-container *ngIf="(loading$ | ngrxPush) === false">
          <ng-container *ngrxLet="collaborator$; let collaborator">
            <button
              *ngIf="collaborator === null"
              mat-stroked-button
              color="accent"
              (click)="onRequestCollaboratorStatus(workspaceId)"
            >
              Become Collaborator
            </button>

            <button
              *ngIf="
                collaborator !== null &&
                collaborator.document.data.status.id === 2
              "
              mat-stroked-button
              color="accent"
              (click)="
                onRetryCollaboratorStatusRequest(
                  workspaceId,
                  collaborator.document.id
                )
              "
            >
              Try again
            </button>
          </ng-container>
        </ng-container>
      </footer>
    </aside>

    <div class="flex-1 bg-white bg-opacity-5 p-8">
      <div
        *ngIf="selectedCollaborator$ | ngrxPush as selectedCollaborator"
        class="flex flex-col"
      >
        <header
          class="flex justify-between items-center pb-8 mb-8 border-b-2 border-yellow-500"
        >
          <div class="flex items-center gap-4">
            <figure>
              <img
                [src]="selectedCollaborator.user?.data?.thumbnailUrl"
                class="w-20 h-20 rounded-full overflow-hidden"
                alt=""
                onerror="this.src='assets/images/default-profile.png';"
              />
              <figcaption class="mt-2 text-xs text-center">
                <a
                  [href]="
                    'https://explorer.solana.com/address/' +
                    selectedCollaborator.user?.id
                  "
                  target="__blank"
                  class="text-accent underline"
                  >@{{ selectedCollaborator.user?.data?.userName }}</a
                >
              </figcaption>
            </figure>

            <div>
              <h2
                class="text-2xl font-bold w-64 m-0 overflow-hidden whitespace-nowrap overflow-ellipsis"
              >
                {{ selectedCollaborator.user?.name }}
              </h2>

              <p class="flex m-0 gap-1 text-sm">
                <mat-icon class="w-4" inline>event</mat-icon>
                <span>
                  Collaborator since
                  {{
                    selectedCollaborator.document.createdAt.toNumber() * 1000
                      | date: 'mediumDate'
                  }}
                </span>
              </p>

              <p class="m-0 text-xs text-left">
                <span
                  class="inline-block w-2 h-2 rounded-full"
                  [ngClass]="{
                    'bg-yellow-500':
                      selectedCollaborator.document.data.status.id === 0,
                    'bg-green-500':
                      selectedCollaborator.document.data.status.id === 1,
                    'bg-red-500':
                      selectedCollaborator.document.data.status.id === 2
                  }"
                ></span>
                <span class="text-white text-opacity-50">
                  <ng-container
                    [ngSwitch]="selectedCollaborator.document.data.status.id"
                  >
                    <ng-container *ngSwitchCase="0"> Pending </ng-container>
                    <ng-container *ngSwitchCase="1"> Approved </ng-container>
                    <ng-container *ngSwitchCase="2"> Rejected </ng-container>
                  </ng-container>
                </span>
              </p>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              *ngIf="selectedCollaborator.document.data.status.id === 1"
              mat-stroked-button
              color="warn"
              (click)="
                onUpdateCollaborator(
                  selectedCollaborator.document.data.workspace,
                  selectedCollaborator.document.id,
                  2
                )
              "
            >
              Revoke
            </button>
            <button
              *ngIf="selectedCollaborator.document.data.status.id === 0"
              mat-stroked-button
              color="accent"
              (click)="
                onUpdateCollaborator(
                  selectedCollaborator.document.data.workspace,
                  selectedCollaborator.document.id,
                  1
                )
              "
            >
              Approve
            </button>
            <button
              *ngIf="selectedCollaborator.document.data.status.id === 2"
              mat-stroked-button
              color="accent"
              (click)="
                onUpdateCollaborator(
                  selectedCollaborator.document.data.workspace,
                  selectedCollaborator.document.id,
                  1
                )
              "
            >
              Grant
            </button>
            <button
              *ngIf="selectedCollaborator.document.data.status.id === 0"
              mat-stroked-button
              color="warn"
              (click)="
                onUpdateCollaborator(
                  selectedCollaborator.document.data.workspace,
                  selectedCollaborator.document.id,
                  2
                )
              "
            >
              Reject
            </button>
          </div>
        </header>

        <main>
          <h2 class="mb-4 uppercase font-bold">User Info</h2>

          <dl class="flex justify-between gap-4">
            <div class="flex-1">
              <dt class="font-bold">User ID:</dt>
              <dd
                class="flex items-center w-64 gap-1 px-2 bg-black bg-opacity-10 rounded-md"
              >
                <span
                  class="w-48 overflow-hidden whitespace-nowrap overflow-ellipsis"
                >
                  {{ selectedCollaborator.user?.id }}
                </span>

                <button mat-icon-button>
                  <mat-icon>content_copy</mat-icon>
                </button>
              </dd>
            </div>

            <div class="flex-1">
              <dt class="font-bold">Wallet:</dt>
              <dd
                class="flex items-center w-64 gap-1 px-2 bg-black bg-opacity-10 rounded-md"
              >
                <span
                  class="w-48 overflow-hidden whitespace-nowrap overflow-ellipsis"
                >
                  {{ selectedCollaborator.document.data.authority }}
                </span>

                <button mat-icon-button>
                  <mat-icon>content_copy</mat-icon>
                </button>
              </dd>
            </div>
          </dl>
        </main>
      </div>
    </div>
  `,
  styles: [],
  providers: [
    CollaboratorStore,
    CollaboratorQueryStore,
    CollaboratorsStore,
    UserStore,
    ViewWorkspaceCollaboratorsStore,
  ],
})
export class ViewWorkspaceCollaboratorsComponent implements OnInit {
  @HostBinding('class') class = 'bg-white bg-opacity-5 flex h-full';
  readonly workspaceId$ = this._viewWorkspaceCollaboratorsStore.workspaceId$;
  readonly user$ = this._userStore.user$;
  readonly collaboratorStatus$ =
    this._viewWorkspaceCollaboratorsStore.collaboratorStatus$;
  readonly collaborator$ = this._collaboratorStore.collaborator$;
  readonly collaborators$ =
    this._viewWorkspaceCollaboratorsStore.filteredCollaborators$;
  readonly selectedCollaborator$ =
    this._viewWorkspaceCollaboratorsStore.selectedCollaborator$;
  readonly loading$ = this._viewWorkspaceCollaboratorsStore.loading$;

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
