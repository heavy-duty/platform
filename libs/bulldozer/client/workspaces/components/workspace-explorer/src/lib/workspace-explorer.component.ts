import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { UserStore } from '@bulldozer-client/users-data-access';
import {
  WorkspacesStore,
  WorkspaceStore,
} from '@bulldozer-client/workspaces-data-access';
import { WorkspaceExplorerStore } from './workspace-explorer.store';

@Component({
  selector: 'bd-workspace-explorer',
  template: `
    <ng-container *ngrxLet="workspace$; let workspace">
      <ng-container *ngrxLet="workspaces$; let workspaces">
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
            <!-- Move to components -->
            <div
              class="w-36 mt-5 pb-3 cursor-pointer"
              *ngIf="(user$ | ngrxPush) !== null"
              [routerLink]="['/profile', 'user-info']"
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

          <div class="hd-workspace-explorer-height">
            <!-- Move to components -->
            <div id="active-workspace">
              <div *ngIf="workspace !== null">
                <h3 class="hd-highlight-title px-5 mb-0 mt-5">
                  ACTIVE WORKSPACE
                </h3>
                <div *ngFor="let workspace of workspaces">
                  Workspace -> {{ workspace.document.name }}
                </div>
                <div>
                  <mat-expansion-panel
                    class="flex-shrink-0 shadow-none"
                    togglePosition="before"
                  >
                    <mat-expansion-panel-header class="pl-4 pr-0">
                      <div class="flex justify-between items-center flex-grow">
                        <mat-panel-title
                          class="w-28 flex justify-between flex-grow mr-2"
                        >
                          <span
                            class="flex-grow leading-8"
                            [matTooltip]="workspace.document.name"
                            matTooltipShowDelay="500"
                          >
                            {{ workspace.document.name }}
                          </span>
                          <button
                            mat-icon-button
                            [attr.aria-label]="
                              'More options of ' +
                              workspace.document.name +
                              ' workspace'
                            "
                          >
                            <mat-icon>more_horiz</mat-icon>
                          </button>
                        </mat-panel-title>
                      </div>
                    </mat-expansion-panel-header>
                    <div *ngFor="let workspace of workspaces">
                      Workspace -> {{ workspace.document.name }}
                    </div>
                  </mat-expansion-panel>
                </div>
              </div>
            </div>

            <div *ngIf="workspaceId !== null">
              <h3 class="hd-highlight-title px-5 mb-0 mt-5">EXPLORER</h3>
              <bd-application-explorer
                [connected]="connected"
                [workspaceId]="workspaceId"
              ></bd-application-explorer>
            </div>
          </div>

          <div
            class="flex justify-between items-center self-end px-5 w-full h-20 "
          >
            <div class="flex items-center">
              <figure class="flex justify-center">
                <img src="assets/images/logo.png" class="w-10" />
              </figure>
              <h4 class="text-center font-bold mt-3">BULLDOZER</h4>
            </div>
            <bd-workspace-selector
              [connected]="connected"
            ></bd-workspace-selector>
          </div>
        </div>
      </ng-container>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    WorkspaceExplorerStore,
    UserStore,
    WorkspaceStore,
    WorkspacesStore,
  ],
})
export class WorkspaceExplorerComponent implements OnInit {
  @Input() connected = false;
  @Input() workspaceId: string | null = null;

  readonly user$ = this._userStore.user$;
  readonly userId$ = this._userStore.userId$;
  readonly workspace$ = this._workspaceStore.workspace$;
  readonly workspaces$ = this._workspacesStore.workspaces$;

  constructor(
    private readonly _workspaceExplorerStore: WorkspaceExplorerStore,
    private readonly _workspacesStore: WorkspacesStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _userStore: UserStore
  ) {}

  onCreateUser() {
    this._workspaceExplorerStore.createUser();
  }

  ngOnInit(): void {
    this.workspaces$.subscribe((data) => console.log('la data', data));
    this.workspace$.subscribe((data) => console.log('la data 2', data));
  }
}
