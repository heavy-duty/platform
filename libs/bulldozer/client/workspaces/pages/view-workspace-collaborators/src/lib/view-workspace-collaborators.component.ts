import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore } from '@bulldozer-client/auth-data-access';
import {
  CollaboratorApiService,
  CollaboratorsStore,
} from '@bulldozer-client/collaborators-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { UsersStore } from '@bulldozer-client/users-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import {
  CollaboratorDto,
  findCollaboratorAddress,
} from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  map,
  switchMap,
} from 'rxjs';
import { CollaboratorItemView, UserItemView } from './types';
import { ViewWorkspaceCollaboratorsUsersStore } from './view-workspace-collaborators-users.store';
import { ViewWorkspaceCollaboratorsStore } from './view-workspace-collaborators.store';

interface ViewModel {
  status: number;
  selectedCollaboratorId: string | null;
  currentCollaboratorId: string | null;
}

@Component({
  selector: 'bd-view-workspace-collaborators',
  template: `
    <header class="mb-10">
      <h1 class="text-4xl uppercase m-0 bd-font">Collaborators</h1>
      <p>Filter by collaborator status</p>

      <div class="flex gap-4">
        <div class="px-8 py-3 w-60 h-16 bd-bg-image-11 shadow relative">
          <mat-form-field class="bg-bd-black">
            <mat-select
              [value]="status$ | ngrxPush"
              (valueChange)="onSetStatus($event)"
            >
              <mat-option [value]="1">
                <span
                  class="inline-block bg-green-500 w-2 h-2 rounded-full"
                ></span>
                Approved
              </mat-option>
              <mat-option [value]="0">
                <span
                  class="inline-block bg-yellow-500 w-2 h-2 rounded-full"
                ></span>
                Pending
              </mat-option>
              <mat-option [value]="2">
                <span
                  class="inline-block bg-red-500 w-2 h-2 rounded-full"
                ></span>
                Rejected
              </mat-option>
            </mat-select>
          </mat-form-field>
          <div
            class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-7 left-2"
          >
            <div class="w-full h-px bg-gray-600 rotate-45"></div>
          </div>
          <div
            class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-7 right-2"
          >
            <div class="w-full h-px bg-gray-600"></div>
          </div>
        </div>

        <ng-container
          *ngIf="
            (collaborators$ | ngrxPush) !== null &&
            (currentCollaborator$ | ngrxPush) === null
          "
        >
          <div
            class="bottom-0 py-4 px-7 w-60 h-16 bd-bg-image-11 shadow flex justify-center items-center relative"
            *hdWalletAdapter="let publicKey = publicKey"
          >
            <ng-container *ngIf="publicKey !== null">
              <ng-container *ngIf="workspaceId$ | ngrxPush as workspaceId">
                <button
                  class="bd-button"
                  (click)="
                    onRequestCollaboratorStatus(
                      publicKey.toBase58(),
                      workspaceId
                    )
                  "
                >
                  Become Collaborator
                </button>
              </ng-container>

              <ng-container
                *ngrxLet="currentCollaborator$; let currentCollaborator"
              >
                <button
                  *ngIf="
                    currentCollaborator !== null &&
                    currentCollaborator.status.id === 2
                  "
                  mat-stroked-button
                  color="accent"
                  (click)="
                    onRetryCollaboratorStatusRequest(
                      publicKey.toBase58(),
                      currentCollaborator.workspaceId,
                      currentCollaborator.id
                    )
                  "
                  [disabled]="currentCollaborator | bdItemChanging"
                >
                  Try again
                </button>
              </ng-container>
            </ng-container>
            <div
              class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-7 left-2"
            >
              <div class="w-full h-px bg-gray-600 rotate-45"></div>
            </div>
            <div
              class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-7 right-2"
            >
              <div class="w-full h-px bg-gray-600 rotate-12"></div>
            </div>
          </div>
        </ng-container>
      </div>
    </header>

    <div class="flex flex-wrap gap-4">
      <mat-card
        class="h-auto w-auto rounded-lg overflow-hidden bd-bg-image-1 p-0 mb-5 mat-elevation-z8"
        *ngFor="
          let collaborator of filteredCollaborators$ | ngrxPush;
          trackBy: identify
        "
      >
        <aside class="flex items-center bd-bg-black px-4 py-2 gap-1">
          <div class="flex-1 flex items-center gap-2">
            <mat-progress-spinner
              *ngIf="collaborator | bdItemChanging"
              diameter="16"
              mode="indeterminate"
            ></mat-progress-spinner>
          </div>

          <div
            class="flex gap-2"
            *hdWalletAdapter="
              let publicKey = publicKey;
              let connected = connected
            "
          >
            <ng-container *ngIf="publicKey !== null">
              <div
                class="py-4 px-7 w-32 h-10 flex justify-center items-center bd-bg-image-11 shadow relative"
                *ngIf="collaborator.status.id === 1"
              >
                <button
                  class="bd-button"
                  (click)="
                    onUpdateCollaborator(
                      publicKey.toBase58(),
                      collaborator.workspaceId,
                      collaborator.id,
                      { status: 2 }
                    )
                  "
                  [disabled]="!connected || (collaborator | bdItemChanging)"
                >
                  Revoke
                </button>
                <div
                  class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-4 left-2"
                >
                  <div class="w-full h-px bg-gray-600 rotate-45"></div>
                </div>
                <div
                  class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-4 right-2"
                >
                  <div class="w-full h-px bg-gray-600"></div>
                </div>
              </div>
              <div
                class="py-4 px-7 w-32 h-10 flex justify-center items-center bd-bg-image-11 shadow relative"
                *ngIf="collaborator.status.id === 0"
              >
                <button
                  class="bd-button"
                  (click)="
                    onUpdateCollaborator(
                      publicKey.toBase58(),
                      collaborator.workspaceId,
                      collaborator.id,
                      { status: 1 }
                    )
                  "
                  [disabled]="!connected || (collaborator | bdItemChanging)"
                >
                  Approve
                </button>
                <div
                  class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-4 left-2"
                >
                  <div class="w-full h-px bg-gray-600 rotate-45"></div>
                </div>
                <div
                  class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-4 right-2"
                >
                  <div class="w-full h-px bg-gray-600"></div>
                </div>
              </div>
              <div
                class="py-4 px-7 w-28 h-10 flex justify-center items-center bd-bg-image-11 shadow relative"
                *ngIf="collaborator.status.id === 2"
              >
                <button
                  class="bd-button"
                  (click)="
                    onUpdateCollaborator(
                      publicKey.toBase58(),
                      collaborator.workspaceId,
                      collaborator.id,
                      { status: 1 }
                    )
                  "
                  [disabled]="!connected || (collaborator | bdItemChanging)"
                >
                  Grant
                </button>
                <div
                  class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-4 left-2"
                >
                  <div class="w-full h-px bg-gray-600 rotate-45"></div>
                </div>
                <div
                  class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-4 right-2"
                >
                  <div class="w-full h-px bg-gray-600 rotate-12"></div>
                </div>
              </div>
              <div
                class="py-4 px-7 w-32 h-10 flex justify-center items-center bd-bg-image-11 shadow relative"
                *ngIf="collaborator.status.id === 0"
              >
                <button
                  class="bd-button"
                  (click)="
                    onUpdateCollaborator(
                      publicKey.toBase58(),
                      collaborator.workspaceId,
                      collaborator.id,
                      { status: 2 }
                    )
                  "
                  [disabled]="!connected || (collaborator | bdItemChanging)"
                >
                  Reject
                </button>
                <div
                  class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-4 left-2"
                >
                  <div class="w-full h-px bg-gray-600 rotate-45"></div>
                </div>
                <div
                  class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-4 right-2"
                >
                  <div class="w-full h-px bg-gray-600"></div>
                </div>
              </div>
            </ng-container>
          </div>
        </aside>

        <div class="px-8 mt-4 pb-8">
          <main>
            <div class="flex items-center gap-4 mb-6">
              <figure class="w-20 h-20 rounded-full overflow-hidden">
                <img
                  [src]="collaborator.user.thumbnailUrl"
                  class="w-full"
                  onerror="this.src='assets/images/default-profile.png';"
                />
              </figure>
              <div>
                <h1 class="flex items-center justify-start gap-2 mb-0">
                  <span
                    class="leading-none"
                    [matTooltip]="
                      collaborator.user.name
                        | bdItemUpdatingMessage: collaborator.user:'User'
                    "
                    matTooltipShowDelay="500"
                  >
                    {{ collaborator.user.name }}
                  </span>
                </h1>
                <p class="m-0">
                  <a
                    [href]="
                      'https://explorer.solana.com/address/' +
                      collaborator.user.id
                    "
                    target="__blank"
                    class="text-accent underline"
                    >@{{ collaborator.user.userName }}</a
                  >
                </p>
                <p class="m-0">
                  <mat-icon class="text-sm w-4 mr-1">event</mat-icon>
                  Builder since
                  {{ collaborator.createdAt | date: 'mediumDate' }}
                </p>
              </div>
            </div>
            <dl class="flex justify-between gap-5">
              <div class="flex-1">
                <dt class="mb-2">Name:</dt>
                <dd
                  class="flex items-center w-64 h-10 gap-1 px-2 bg-bd-black bg-opacity-70 rounded-md"
                >
                  <span
                    class="overflow-hidden whitespace-nowrap overflow-ellipsis"
                  >
                    {{ collaborator.user.name }}
                  </span>
                </dd>
              </div>

              <div class="flex-1">
                <dt class="mb-2">Authority:</dt>
                <dd
                  class="flex items-center w-64 h-10 gap-1 px-2 bg-bd-black bg-opacity-70 rounded-md"
                >
                  <span
                    class="w-48 overflow-hidden whitespace-nowrap overflow-ellipsis"
                  >
                    {{ collaborator.user.authority }}
                  </span>

                  <button
                    mat-icon-button
                    [cdkCopyToClipboard]="collaborator.user.authority"
                  >
                    <mat-icon>content_copy</mat-icon>
                  </button>
                </dd>
              </div>
            </dl>
          </main>
        </div>
      </mat-card>
    </div>
  `,
  styles: [],
  providers: [
    CollaboratorsStore,
    UsersStore,
    ViewWorkspaceCollaboratorsStore,
    ViewWorkspaceCollaboratorsUsersStore,
  ],
})
export class ViewWorkspaceCollaboratorsComponent
  extends ComponentStore<ViewModel>
  implements OnInit
{
  @HostBinding('class') class = 'block p-8 pt-5 h-full';
  readonly workspaceId$ = this._route.paramMap.pipe(
    map((paramMap) => paramMap.get('workspaceId')),
    isNotNullOrUndefined,
    distinctUntilChanged()
  );
  readonly userIds$ = this.select(
    this._viewWorkspaceCollaboratorsStore.collaboratorsMap$,
    (collaboratorsMap) => {
      if (collaboratorsMap === null) {
        return null;
      }

      return collaboratorsMap.map(({ userId }) => userId).toList();
    }
  ).pipe(
    distinctUntilChanged(
      (previous, current) => previous?.join('') === current?.join('')
    )
  );
  readonly status$ = this.select(({ status }) => status);
  readonly currentCollaboratorId$ = this.select(
    ({ currentCollaboratorId }) => currentCollaboratorId
  );
  readonly selectedCollaboratorId$ = this.select(
    ({ selectedCollaboratorId }) => selectedCollaboratorId
  );
  readonly collaborators$ = this.select(
    this._viewWorkspaceCollaboratorsStore.collaboratorsMap$,
    this._viewWorkspaceCollaboratorsUsersStore.usersMap$,
    (collaboratorsMap, usersMap) => {
      if (collaboratorsMap === null || usersMap === null) {
        return null;
      }

      return collaboratorsMap
        .map((collaborator) => {
          const user = usersMap.get(collaborator.userId);

          if (user === undefined) {
            return null;
          }

          return {
            ...collaborator,
            user,
          };
        })
        .filter(
          (data): data is CollaboratorItemView & { user: UserItemView } =>
            data !== null
        )
        .sort((a, b) => a.createdAt - b.createdAt)
        .toList();
    }
  );
  readonly filteredCollaborators$ = this.select(
    this.collaborators$,
    this.status$,
    (collaborators, status) => {
      if (collaborators === null) {
        return null;
      }

      return collaborators.filter(
        (collaborator) => collaborator.status.id === status
      );
    }
  );
  readonly selectedCollaborator$ = this.select(
    this.collaborators$,
    this.selectedCollaboratorId$,
    (collaborators, selectedCollaboratorId) => {
      if (collaborators === null || selectedCollaboratorId === null) {
        return null;
      }

      return (
        collaborators.find(
          (collaborator) => collaborator.id === selectedCollaboratorId
        ) ?? null
      );
    }
  );
  readonly currentCollaborator$ = this.select(
    this.collaborators$,
    this.currentCollaboratorId$,
    (collaborators, currentCollaboratorId) => {
      if (collaborators === null || currentCollaboratorId === null) {
        return null;
      }

      return (
        collaborators.find(
          (collaborator) => collaborator.id === currentCollaboratorId
        ) ?? null
      );
    }
  );

  constructor(
    private readonly _authStore: AuthStore,
    private readonly _route: ActivatedRoute,
    private readonly _collaboratorApiService: CollaboratorApiService,
    private readonly _viewWorkspaceCollaboratorsStore: ViewWorkspaceCollaboratorsStore,
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _viewWorkspaceCollaboratorsUsersStore: ViewWorkspaceCollaboratorsUsersStore
  ) {
    super({
      status: 1,
      selectedCollaboratorId: null,
      currentCollaboratorId: null,
    });
  }

  private readonly _setStatus = this.updater<number>((state, status) => ({
    ...state,
    status,
  }));

  private readonly _selectCollaboratorId = this.updater<string | null>(
    (state, selectedCollaboratorId) => ({
      ...state,
      selectedCollaboratorId,
    })
  );

  private readonly _loadCurrentCollaboratorId = this.effect(
    switchMap(({ workspaceId, userId }) => {
      this.patchState({ currentCollaboratorId: null });

      if (workspaceId === null || userId === null) {
        return EMPTY;
      }

      return findCollaboratorAddress(workspaceId, userId).pipe(
        tapResponse(
          ([currentCollaboratorId]) =>
            this.patchState({ currentCollaboratorId }),
          (error) => this._notificationStore.setError(error)
        )
      );
    })
  );

  ngOnInit() {
    this._selectCollaboratorId(
      this.select(
        this.selectedCollaboratorId$,
        this._viewWorkspaceCollaboratorsStore.collaboratorsMap$,
        (selectedCollaboratorId, collaboratorsMap) => {
          if (collaboratorsMap === null || collaboratorsMap.size === 0) {
            return null;
          }

          if (selectedCollaboratorId === null) {
            const firstCollaborator = collaboratorsMap
              .sort((a, b) => a.createdAt - b.createdAt)
              .first();

            if (firstCollaborator === undefined) {
              return null;
            }

            return firstCollaborator.id;
          }

          const selectedCollaborator = collaboratorsMap.get(
            selectedCollaboratorId
          );

          if (selectedCollaborator === undefined) {
            return null;
          }

          return selectedCollaborator.id;
        }
      )
    );
    this._loadCurrentCollaboratorId(
      combineLatest({
        workspaceId: this.workspaceId$,
        userId: this._authStore.userId$,
      })
    );
    this._viewWorkspaceCollaboratorsStore.setWorkspaceId(this.workspaceId$);
    this._viewWorkspaceCollaboratorsUsersStore.setUserIds(this.userIds$);
  }

  onRequestCollaboratorStatus(authority: string, workspaceId: string) {
    this._collaboratorApiService
      .requestCollaboratorStatus({
        authority,
        workspaceId,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent(
            'Request collaborator status request sent'
          );
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `authority:${authority}`,
                  `workspace:${workspaceId}:collaborators`,
                ],
              },
            })
          );
        },
        error: (error) => {
          this._notificationStore.setError(error);
        },
      });
  }

  onRetryCollaboratorStatusRequest(
    authority: string,
    workspaceId: string,
    collaboratorId: string
  ) {
    this._collaboratorApiService
      .retryCollaboratorStatusRequest({
        authority,
        workspaceId,
        collaboratorId,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent(
            'Retry collaborator status request sent'
          );
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `authority:${authority}`,
                  `workspace:${workspaceId}:collaborators`,
                ],
              },
            })
          );
        },
        error: (error) => {
          this._notificationStore.setError(error);
        },
      });
  }

  onUpdateCollaborator(
    authority: string,
    workspaceId: string,
    collaboratorId: string,
    collaboratorDto: CollaboratorDto
  ) {
    this._collaboratorApiService
      .update({
        authority,
        workspaceId,
        collaboratorId,
        collaboratorDto,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Update collaborator request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `authority:${authority}`,
                  `workspace:${workspaceId}:collaborators`,
                ],
              },
            })
          );
        },
        error: (error) => {
          this._notificationStore.setError(error);
        },
      });
  }

  onSetStatus(status: number) {
    this._setStatus(status);
  }

  onSelectCollaboratorId(collaboratorId: string) {
    this._selectCollaboratorId(collaboratorId);
  }

  identify(_: number, collaborator: CollaboratorItemView) {
    return collaborator.id;
  }
}
