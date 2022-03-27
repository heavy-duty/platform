import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { UserStore } from '@bulldozer-client/users-data-access';
import { WorkspaceExplorerStore } from './workspace-explorer.store';

@Component({
  selector: 'bd-workspace-explorer',
  template: `
    <div class="flex h-screen overflow-auto justify-between flex-col ">
      <div class="flex items-center justify-center border-b hd-border-gray">
        <div
          class="w-36 mt-5 pb-3 cursor-pointer"
          (click)="onCreateUser()"
          *ngIf="(user$ | ngrxPush) === null"
        >
          <figure class="w-20 m-auto mb-2 relative">
            <img src="assets/images/default-profile.png" class="w-full" />
            <img
              src="assets/images/important.png"
              class="w-6 absolute right-0 bottom-0"
            />
          </figure>
          <p class="text-center">Click here to a create new user</p>
        </div>

        <div
          class="w-36 mt-5 pb-3 cursor-pointer"
          *ngIf="(user$ | ngrxPush) !== null"
          [routerLink]="['/profile']"
        >
          <figure class="w-20 m-auto mb-2 relative">
            <img src="assets/images/default-profile.png" class="w-full" />
          </figure>
          <p
            class="text-center"
            [matTooltip]="(userId$ | async) || ''"
            [cdkCopyToClipboard]="(userId$ | async) || ''"
          >
            <span class="font-bold">ID:</span>
            {{ userId$ | async | obscureAddress: '.' }}
          </p>
        </div>
      </div>

      <bd-application-explorer
        *ngIf="workspaceId !== null"
        [connected]="connected"
        [workspaceId]="workspaceId"
      ></bd-application-explorer>

      <div class="flex justify-between items-center self-end px-5 w-full h-20 ">
        <div class="flex items-center">
          <figure class="flex justify-center">
            <img src="assets/images/logo.png" class="w-10" />
          </figure>
          <h4 class="text-center font-bold mt-3">BULLDOZER</h4>
        </div>
        <bd-workspace-selector [connected]="connected"></bd-workspace-selector>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [WorkspaceExplorerStore, UserStore],
})
export class WorkspaceExplorerComponent {
  @Input() connected = false;
  @Input() workspaceId: string | null = null;

  readonly connected$ = this._walletStore.connected$;
  readonly workspaceIds$ = this._configStore.workspaceIds$;
  readonly user$ = this._userStore.user$;
  readonly userId$ = this._userStore.userId$;

  constructor(
    private readonly _workspaceExplorerStore: WorkspaceExplorerStore
  ) {}

  onCreateUser() {
    this._workspaceExplorerStore.createUser();
  }
}
