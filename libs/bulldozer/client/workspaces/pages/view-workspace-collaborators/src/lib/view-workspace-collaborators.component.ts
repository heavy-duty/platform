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
    <aside class="w-80 flex flex-col gap-2">
      <header class="py-5 px-7 mb-0 w-full">
        <h1 class="text-2xl uppercase m-0">Collaborators</h1>
        <p>Visualize and manage collaborators.</p>

        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Status</mat-label>
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
              <span class="inline-block bg-red-500 w-2 h-2 rounded-full"></span>
              Rejected
            </mat-option>
          </mat-select>
        </mat-form-field>
        <p>Filter by collaborator status</p>
      </header>

      <ul class="flex-1">
        <li
          *ngFor="
            let collaborator of filteredCollaborators$ | ngrxPush;
            trackBy: identify
          "
        >
          <button
            class="w-full py-5 px-7 border-l-4 flex items-center gap-2 border-transparent"
            (click)="onSelectCollaboratorId(collaborator.id)"
          >
            <figure class="w-12 h-12 rounded-full overflow-hidden">
              <img
                [src]="collaborator.user.thumbnailUrl"
                class="w-full"
                onerror="this.src='assets/images/default-profile.png';"
              />
            </figure>

            <div>
              <p class="m-0 text-left">
                <span
                  class="text-lg font-bold w-44 overflow-hidden whitespace-nowrap overflow-ellipsis"
                >
                  {{ collaborator.user.name }}
                </span>

                <mat-icon
                  class="inline"
                  *ngIf="collaborator.isAdmin"
                  color="accent"
                  inline
                >
                  admin_panel_settings
                </mat-icon>
              </p>

              <p class="m-0 text-xs text-left">
                <a
                  [href]="
                    'https://explorer.solana.com/address/' + collaborator.userId
                  "
                  target="__blank"
                  class="text-accent underline"
                  >(@{{ collaborator.user.userName }})</a
                >
              </p>

              <p class="m-0 text-xs text-left">
                <span
                  class="inline-block w-2 h-2 rounded-full"
                  [ngClass]="{
                    'bg-yellow-500': collaborator.status.id === 0,
                    'bg-green-500': collaborator.status.id === 1,
                    'bg-red-500': collaborator.status.id === 2
                  }"
                ></span>
                <span class="text-white text-opacity-50">
                  <ng-container [ngSwitch]="collaborator.status.id">
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
        *hdWalletAdapter="let publicKey = publicKey"
      >
        <ng-container *ngIf="publicKey !== null">
          <ng-container *ngIf="workspaceId$ | ngrxPush as workspaceId">
            <button
              *ngIf="
                (collaborators$ | ngrxPush) !== null &&
                (currentCollaborator$ | ngrxPush) === null
              "
              mat-stroked-button
              color="accent"
              (click)="
                onRequestCollaboratorStatus(publicKey.toBase58(), workspaceId)
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
                [src]="selectedCollaborator.user.thumbnailUrl"
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
                  >@{{ selectedCollaborator.user.userName }}</a
                >
              </figcaption>
            </figure>

            <div>
              <h2
                class="text-2xl font-bold w-64 m-0 overflow-hidden whitespace-nowrap overflow-ellipsis"
              >
                {{ selectedCollaborator.user.name }}
              </h2>

              <p class="flex m-0 gap-1 text-sm">
                <mat-icon class="w-4" inline>event</mat-icon>
                <span>
                  Collaborator since
                  {{ selectedCollaborator.createdAt | date: 'mediumDate' }}
                </span>
              </p>

              <p class="m-0 text-xs text-left">
                <span
                  class="inline-block w-2 h-2 rounded-full"
                  [ngClass]="{
                    'bg-yellow-500': selectedCollaborator.status.id === 0,
                    'bg-green-500': selectedCollaborator.status.id === 1,
                    'bg-red-500': selectedCollaborator.status.id === 2
                  }"
                ></span>
                <span class="text-white text-opacity-50">
                  <ng-container [ngSwitch]="selectedCollaborator.status.id">
                    <ng-container *ngSwitchCase="0"> Pending </ng-container>
                    <ng-container *ngSwitchCase="1"> Approved </ng-container>
                    <ng-container *ngSwitchCase="2"> Rejected </ng-container>
                  </ng-container>
                </span>
              </p>
            </div>
          </div>

          <div
            class="flex gap-2"
            *hdWalletAdapter="
              let publicKey = publicKey;
              let connected = connected
            "
          >
            <ng-container *ngIf="publicKey !== null">
              <button
                *ngIf="selectedCollaborator.status.id === 1"
                mat-stroked-button
                color="warn"
                (click)="
                  onUpdateCollaborator(
                    publicKey.toBase58(),
                    selectedCollaborator.workspaceId,
                    selectedCollaborator.id,
                    { status: 2 }
                  )
                "
                [disabled]="
                  !connected || (selectedCollaborator | bdItemChanging)
                "
              >
                Revoke
              </button>
              <button
                *ngIf="selectedCollaborator.status.id === 0"
                mat-stroked-button
                color="accent"
                (click)="
                  onUpdateCollaborator(
                    publicKey.toBase58(),
                    selectedCollaborator.workspaceId,
                    selectedCollaborator.id,
                    { status: 1 }
                  )
                "
                [disabled]="
                  !connected || (selectedCollaborator | bdItemChanging)
                "
              >
                Approve
              </button>
              <button
                *ngIf="selectedCollaborator.status.id === 2"
                mat-stroked-button
                color="accent"
                (click)="
                  onUpdateCollaborator(
                    publicKey.toBase58(),
                    selectedCollaborator.workspaceId,
                    selectedCollaborator.id,
                    { status: 1 }
                  )
                "
                [disabled]="
                  !connected || (selectedCollaborator | bdItemChanging)
                "
              >
                Grant
              </button>
              <button
                *ngIf="selectedCollaborator.status.id === 0"
                mat-stroked-button
                color="warn"
                (click)="
                  onUpdateCollaborator(
                    publicKey.toBase58(),
                    selectedCollaborator.workspaceId,
                    selectedCollaborator.id,
                    { status: 2 }
                  )
                "
                [disabled]="
                  !connected || (selectedCollaborator | bdItemChanging)
                "
              >
                Reject
              </button>
            </ng-container>
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
                  {{ selectedCollaborator.authority }}
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
  @HostBinding('class') class = 'bg-white bg-opacity-5 flex h-full';
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
