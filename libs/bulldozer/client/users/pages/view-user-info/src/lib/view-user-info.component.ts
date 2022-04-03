import { Component, HostBinding } from '@angular/core';
import { UserStore } from '@bulldozer-client/users-data-access';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ViewUserInfoStore } from './view-user-info.store';

@Component({
  selector: 'bd-view-user-info',
  template: `
    <div class="flex flex-col" *ngIf="connected$ | ngrxPush">
      <ng-container *ngIf="user$ | ngrxPush as user; else userNotDefined">
        <header
          class="flex justify-between items-center pb-8 mb-8 border-b-2 border-yellow-500"
          *ngIf="user$ | ngrxPush as user; else userNotDefined"
        >
          <div class="flex items-center gap-4">
            <figure class="w-20 h-20 rounded-full overflow-hidden">
              <img
                [src]="user.document.data.thumbnailUrl"
                class="w-full"
                onerror="this.src='assets/images/default-profile.png';"
              />
            </figure>
            <div>
              <h1
                class="flex items-center justify-start gap-2 mb-0"
                [matTooltip]="
                  user.document.data.userName
                    | bdItemUpdatingMessage: user:'User'
                "
                matTooltipShowDelay="500"
              >
                <span class="leading-none">
                  {{ user.document.name }}
                </span>
                <mat-progress-spinner
                  *ngIf="user | bdItemShowSpinner"
                  diameter="16"
                  mode="indeterminate"
                ></mat-progress-spinner>
              </h1>
              <p class="m-0">
                <a
                  [href]="
                    'https://explorer.solana.com/address/' + user.document.id
                  "
                  target="__blank"
                  class="text-accent underline"
                  >@{{ user.document.data.userName }}</a
                >
              </p>
              <p class="m-0">
                <mat-icon class="text-sm w-4 mr-1">event</mat-icon>
                Builder since
                {{
                  user.document.createdAt.toNumber() * 1000 | date: 'mediumDate'
                }}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              mat-stroked-button
              color="accent"
              bdEditUser
              [user]="user.document"
              (editUser)="
                onUpdateUser($event.name, $event.userName, $event.thumbnailUrl)
              "
              [disabled]="user.isCreating || user.isDeleting"
            >
              Edit
            </button>
            <button
              mat-stroked-button
              color="warn"
              (click)="onDeleteUser()"
              [disabled]="user.isCreating || user.isDeleting"
            >
              Delete
            </button>
          </div>
        </header>

        <main>
          <h2 class="mb-4 uppercase font-bold">User Info</h2>

          <dl class="flex justify-between gap-4">
            <div class="flex-1">
              <dt class="font-bold">Name:</dt>
              <dd
                class="flex items-center w-64 h-12 gap-1 px-2 bg-black bg-opacity-10 rounded-md"
              >
                <span
                  class="overflow-hidden whitespace-nowrap overflow-ellipsis"
                >
                  {{ user.document.name }}
                </span>
              </dd>
            </div>

            <div class="flex-1">
              <dt>Authority:</dt>
              <dd
                class="flex items-center w-64 h-12 gap-1 px-2 bg-black bg-opacity-10 rounded-md"
              >
                <span
                  class="w-48 overflow-hidden whitespace-nowrap overflow-ellipsis"
                >
                  {{ user.document.data.authority }}
                </span>

                <button
                  mat-icon-button
                  [cdkCopyToClipboard]="user.document.data.authority"
                >
                  <mat-icon>content_copy</mat-icon>
                </button>
              </dd>
            </div>
          </dl>
        </main>
      </ng-container>

      <ng-template #userNotDefined>
        <main>
          <p class="text-lg mb-3">You have no user defined.</p>
          <button
            mat-raised-button
            color="primary"
            bdEditUser
            (editUser)="
              onCreateUser($event.name, $event.userName, $event.thumbnailUrl)
            "
          >
            Create User
          </button>
        </main>
      </ng-template>
    </div>
  `,
  styles: [],
  providers: [ViewUserInfoStore, UserStore],
})
export class ViewUserInfoComponent {
  @HostBinding('class') class = 'block p-8';
  readonly connected$ = this._walletStore.connected$;
  readonly user$ = this._userStore.user$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _userStore: UserStore,
    private readonly _viewUserInfoStore: ViewUserInfoStore
  ) {}

  onCreateUser(name: string, userName: string, thumbnailUrl: string) {
    this._viewUserInfoStore.createUser({
      name,
      userName,
      thumbnailUrl,
    });
  }

  onUpdateUser(name: string, userName: string, thumbnailUrl: string) {
    this._viewUserInfoStore.updateUser({
      name,
      userName,
      thumbnailUrl,
    });
  }

  onDeleteUser() {
    this._viewUserInfoStore.deleteUser();
  }
}
