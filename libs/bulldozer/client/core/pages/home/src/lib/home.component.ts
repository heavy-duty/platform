import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { UserStore } from '@bulldozer-client/users-data-access';
import { HomeStore } from './home.store';

@Component({
  selector: 'bd-home',
  template: `
    <main class="h-full flex flex-col items-center py-8 gap-6">
      <figure class="w-32">
        <img src="assets/images/logo.png" class="w-full" />
        <figcaption class="my-1 text-center font-bold">BULLDOZER</figcaption>
      </figure>

      <div class="w-96" *ngrxLet="user$; let user">
        <h1 class="text-2xl text-center font-bold m-0">
          Hello

          <ng-container *ngIf="user === null"> anon! </ng-container>
          <ng-container *ngIf="user !== null">
            {{ user.document.name }}!
          </ng-container>
        </h1>

        <p
          *ngIf="user === null"
          class="text-xs text-white text-center text-opacity-70"
        >
          Looking to register and start building?
          <button
            class="text-accent underline"
            bdEditUser
            (editUser)="
              onCreateUser($event.name, $event.userName, $event.thumbnailUrl)
            "
          >
            Register here
          </button>
        </p>

        <p class="mt-8 text-justify">
          Bulldozer is a open source low code platform to build Solana programs.
          It gives developers the ability to manage their program's ecosystem
          through a UI, hiding all the gory details.
        </p>
        <div class="flex mt-6 justify-center gap-4">
          <figure class="w-8">
            <a href="https://github.com/heavy-duty/platform" target="_blank">
              <img src="assets/images/social/github.png" class="w-full" />
            </a>
          </figure>
          <figure class="w-8">
            <a href="https://discord.gg/Ej47EUAj4u" target="_blank">
              <img src="assets/images/social/discord.png" class="w-full" />
            </a>
          </figure>
          <figure class="w-8">
            <a href="https://twitter.com/HeavyDutyBuild" target="_blank">
              <img src="assets/images/social/twitter.png" class="w-full" />
            </a>
          </figure>
        </div>
      </div>
    </main>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UserStore, HomeStore],
})
export class HomeComponent {
  @HostBinding('class') class = 'block min-h-full';
  readonly user$ = this._userStore.user$;

  constructor(
    private readonly _userStore: UserStore,
    private readonly _homeStore: HomeStore
  ) {}

  onCreateUser(name: string, userName: string, thumbnailUrl: string) {
    this._homeStore.createUser({
      name,
      userName,
      thumbnailUrl,
    });
  }
}
