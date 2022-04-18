import { Component, HostBinding, OnInit } from '@angular/core';
import { TabStore } from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { UserApiService, UserStore } from '@bulldozer-client/users-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import { UserDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { map } from 'rxjs';
import { ViewUserInfoStore } from './view-user-info.store';

@Component({
  selector: 'bd-view-user-info',
  template: `
    <header class="mb-8">
      <h1 class="text-4xl uppercase mb-1 bd-font">User Info</h1>
      <p class="text-sm font-thin mb-0">User account info.</p>
    </header>

    <ng-container *hdWalletAdapter="let publicKey = publicKey">
      <div class="flex gap-6 flex-wrap" *ngIf="publicKey !== null">
        <ng-container *ngIf="user$ | ngrxPush as user; else userNotDefined">
          <mat-card
            class="h-auto w-auto rounded-lg overflow-hidden bd-bg-image-1 p-0 mat-elevation-z8"
          >
            <aside class="flex items-center bd-bg-black px-4 py-1 gap-1">
              <div class="flex-1 flex items-center gap-2">
                <mat-progress-spinner
                  *ngIf="user | bdItemChanging"
                  diameter="16"
                  mode="indeterminate"
                ></mat-progress-spinner>
              </div>
              <button
                mat-icon-button
                bdEditUser
                [user]="user"
                (editUser)="onUpdateUser(user.authority, user.id, $event)"
                [disabled]="user | bdItemChanging"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                (click)="onDeleteUser(user.authority, user.id)"
                [disabled]="user | bdItemChanging"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </aside>

            <div class="px-8 mt-4 pb-8">
              <main>
                <div class="flex items-center gap-4 mb-6">
                  <figure class="w-20 h-20 rounded-full overflow-hidden">
                    <img
                      [src]="user.thumbnailUrl"
                      class="w-full"
                      onerror="this.src='assets/images/default-profile.png';"
                    />
                  </figure>
                  <div>
                    <h1 class="flex items-center justify-start gap-2 mb-0">
                      <span
                        class="leading-none"
                        [matTooltip]="
                          user.name | bdItemUpdatingMessage: user:'User'
                        "
                        matTooltipShowDelay="500"
                      >
                        {{ user.name }}
                      </span>
                    </h1>
                    <p class="m-0">
                      <a
                        [href]="
                          'https://explorer.solana.com/address/' + user.id
                        "
                        target="__blank"
                        class="text-accent underline"
                        >@{{ user.userName }}</a
                      >
                    </p>
                    <p class="m-0">
                      <mat-icon class="text-sm w-4 mr-1">event</mat-icon>
                      Builder since
                      {{ user.createdAt | date: 'mediumDate' }}
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
                        {{ user.name }}
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
                        {{ user.authority }}
                      </span>

                      <button
                        mat-icon-button
                        [cdkCopyToClipboard]="user.authority"
                      >
                        <mat-icon>content_copy</mat-icon>
                      </button>
                    </dd>
                  </div>
                </dl>
              </main>
            </div>
          </mat-card>
        </ng-container>

        <ng-template #userNotDefined>
          <main>
            <p class="text-lg mb-3">You have no user defined.</p>

            <ng-container *hdWalletAdapter="let publicKey = publicKey">
              <ng-container *ngrxLet="userId$; let userId">
                <button
                  *ngIf="publicKey !== null && userId !== null"
                  mat-raised-button
                  color="primary"
                  bdEditUser
                  (editUser)="
                    onCreateUser(publicKey.toBase58(), userId, $event)
                  "
                >
                  Create User
                </button>
              </ng-container>
            </ng-container>
          </main>
        </ng-template>
      </div>
    </ng-container>
  `,
  styles: [],
  providers: [ViewUserInfoStore, UserStore],
})
export class ViewUserInfoComponent implements OnInit {
  @HostBinding('class') class = 'block p-8 pt-5';
  readonly user$ = this._viewUserInfoStore.user$;
  readonly userId$ = this._userStore.userId$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _tabStore: TabStore,
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _userApiService: UserApiService,
    private readonly _userStore: UserStore,
    private readonly _viewUserInfoStore: ViewUserInfoStore
  ) {}

  ngOnInit() {
    this._viewUserInfoStore.setAuthority(
      this._walletStore.publicKey$.pipe(
        isNotNullOrUndefined,
        map((publicKey) => publicKey.toBase58())
      )
    );
    this._tabStore.openTab({
      id: 'profile',
      kind: 'profile',
      url: `/profile`,
    });
  }

  onCreateUser(authority: string, userId: string, userDto: UserDto) {
    this._userApiService
      .create({
        authority,
        userDto,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Update user request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [`authority:${authority}`, `user:${userId}`],
              },
            })
          );
        },
        error: (error) => {
          this._notificationStore.setError(error);
        },
      });
  }

  onUpdateUser(authority: string, userId: string, userDto: UserDto) {
    this._userApiService
      .update({
        authority,
        userDto,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Update user request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [`authority:${authority}`, `user:${userId}`],
              },
            })
          );
        },
        error: (error) => {
          this._notificationStore.setError(error);
        },
      });
  }

  onDeleteUser(authority: string, userId: string) {
    this._userApiService
      .delete({
        authority,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Delete user request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [`authority:${authority}`, `user:${userId}`],
              },
            })
          );
        },
        error: (error) => {
          this._notificationStore.setError(error);
        },
      });
  }
}
