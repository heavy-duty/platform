import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { UserApiService, UserStore } from '@bulldozer-client/users-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import { UserDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { map } from 'rxjs';
import { HomeStore } from './home.store';

@Component({
  selector: 'bd-home',
  template: `
    <ng-container *ngrxLet="user$; let user">
      <header>
        <figure class="w-32 mx-auto">
          <img
            src="assets/images/logo.webp"
            alt="HeavyDuty logo"
            width="128"
            height="144"
          />
          <figcaption class="my-1 text-center font-bold">BULLDOZER</figcaption>
        </figure>
        <h1 class="text-2xl text-center font-bold m-0">
          <ng-container
            *ngIf="(loading$ | ngrxPush) === false; else loadingUser"
          >
            Hello

            <ng-container *ngIf="user === null"> anon! </ng-container>
            <ng-container *ngIf="user !== null">
              {{ user.name }}!
            </ng-container>
          </ng-container>

          <ng-template #loadingUser>...</ng-template>
        </h1>
      </header>

      <main class="w-96 mx-auto">
        <ng-container *hdWalletAdapter="let publicKey = publicKey">
          <ng-container *ngrxLet="userId$; let userId">
            <p
              *ngIf="
                user === null &&
                publicKey !== null &&
                userId !== null &&
                (loading$ | ngrxPush) === false
              "
              class="text-xs text-white text-center text-opacity-70"
            >
              Looking to register and start building?
              <button
                class="text-accent underline"
                bdEditUser
                (editUser)="onCreateUser(publicKey.toBase58(), userId, $event)"
              >
                Register here
              </button>
            </p>
          </ng-container>
        </ng-container>

        <p class="mt-8 text-justify">
          Bulldozer is a open source low code platform to build Solana programs.
          It gives developers the ability to manage their program's ecosystem
          through a UI, hiding all the gory details.
        </p>

        <div class="flex mt-6 justify-center gap-4">
          <figure class="w-8">
            <a href="https://github.com/heavy-duty/platform" target="_blank">
              <img
                src="assets/images/social/github.png"
                class="w-8 h-8"
                alt="Github button"
                width="32"
                height="32"
              />
            </a>
          </figure>
          <figure class="w-8">
            <a href="https://discord.gg/Ej47EUAj4u" target="_blank">
              <img
                src="assets/images/social/discord.png"
                class="w-8 h-8"
                alt="Discord button"
                width="32"
                height="32"
              />
            </a>
          </figure>
          <figure class="w-8">
            <a href="https://twitter.com/HeavyDutyBuild" target="_blank">
              <img
                src="assets/images/social/twitter.png"
                class="w-8 h-8"
                alt="Twitter button"
                width="32"
                height="32"
              />
            </a>
          </figure>
        </div>
      </main>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UserStore, HomeStore],
})
export class HomeComponent implements OnInit {
  @HostBinding('class') class = 'block min-h-full w-full py-8';
  readonly user$ = this._homeStore.user$;
  readonly userId$ = this._userStore.userId$;
  readonly loading$ = this._userStore.loading$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _userApiService: UserApiService,
    private readonly _homeStore: HomeStore,
    private readonly _userStore: UserStore,
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _notificationStore: NotificationStore
  ) {}

  ngOnInit() {
    this._homeStore.setAuthority(
      this._walletStore.publicKey$.pipe(
        isNotNullOrUndefined,
        map((publicKey) => publicKey.toBase58())
      )
    );
  }

  onCreateUser(authority: string, userId: string, userDto: UserDto) {
    this._userApiService
      .create({
        authority,
        userDto,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Create user request sent');
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
