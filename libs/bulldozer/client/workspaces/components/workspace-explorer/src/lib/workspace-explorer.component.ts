import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { ApplicationApiService } from '@bulldozer-client/applications-data-access';
import { ConfigStore } from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { UserApiService, UserStore } from '@bulldozer-client/users-data-access';
import {
  WorkspaceApiService,
  WorkspaceStore,
} from '@bulldozer-client/workspaces-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import {
  ApplicationDto,
  UserDto,
  WorkspaceDto,
} from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { Keypair } from '@solana/web3.js';
import { map } from 'rxjs';
import { WorkspaceDownloaderService } from './workspace-downloader.service';
import { WorkspaceExplorerUserStore } from './workspace-explorer-user.store';
import { WorkspaceExplorerStore } from './workspace-explorer.store';

@Component({
  selector: 'bd-workspace-explorer',
  template: `
    <ng-container *ngrxLet="workspace$; let workspace">
      <div class="flex flex-col h-screen">
        <div
          class="flex items-center justify-center border-b hd-border-gray"
          *ngrxLet="user$; let user"
        >
          <div class="w-36 mt-5 pb-3" *ngIf="user === null">
            <figure class="w-20 h-20 m-auto mb-2 relative">
              <img
                alt=""
                src="assets/images/default-profile.png"
                class="w-full"
              />
              <img
                alt=""
                src="assets/images/important.png"
                class="w-6 absolute right-0 bottom-0"
              />
            </figure>
            <ng-container *hdWalletAdapter="let publicKey = publicKey">
              <ng-container *ngrxLet="userId$; let userId">
                <button
                  bdEditUser
                  (editUser)="
                    onCreateUser(publicKey.toBase58(), userId, $event)
                  "
                  *ngIf="publicKey !== null && userId !== null"
                >
                  Click here to a create new user
                </button>
              </ng-container>
            </ng-container>
          </div>
          <!-- Move to components -->

          <a
            class="w-36 mt-5 pb-3"
            *ngIf="user !== null"
            [routerLink]="['/profile', 'info']"
          >
            <figure
              class="w-20 h-20 mb-2 mx-auto rounded-full overflow-hidden bg-black bg-opacity-10"
            >
              <img
                alt=""
                [src]="user.thumbnailUrl"
                class="w-full"
                onerror="this.src='assets/images/default-profile.png';"
              />
            </figure>

            <p class="flex items-center justify-center gap-2 mb-0">
              <span>
                {{ user.name }}
              </span>
              <mat-progress-spinner
                *ngIf="user | bdItemChanging"
                diameter="16"
                mode="indeterminate"
              ></mat-progress-spinner>
            </p>
            <p class="m-0 text-center">
              <a
                [href]="'https://explorer.solana.com/address/' + user.id"
                target="__blank"
                class="text-accent underline"
                >@{{ user.userName }}</a
              >
            </p>
          </a>
        </div>

        <div
          class="flex-grow border-b hd-border-gray overflow-auto"
          *hdWalletAdapter="
            let publicKey = publicKey;
            let connected = connected
          "
        >
          <ng-container *ngIf="workspace !== null">
            <h3 class="ml-4 mt-4 mb-0 flex justify-between items-center">
              <span class="hd-highlight-title uppercase"> Explorer </span>
              <div *hdWalletAdapter="let publicKey = publicKey">
                <button
                  *ngIf="publicKey !== null"
                  mat-icon-button
                  bdEditApplication
                  (editApplication)="
                    onCreateApplication(
                      publicKey.toBase58(),
                      workspace.id,
                      $event
                    )
                  "
                >
                  <mat-icon>add</mat-icon>
                </button>
              </div>
            </h3>
            <bd-application-explorer
              [connected]="connected"
              [workspaceId]="workspace.id"
            ></bd-application-explorer>
          </ng-container>
        </div>

        <div class="w-full pl-4 flex flex-col gap-2">
          <ng-container *ngIf="workspace !== null">
            <h3 class="mt-4 mb-0 hd-highlight-title uppercase">
              Active workspace
            </h3>
            <div class="flex items-center">
              <span
                class="flex-grow overflow-hidden whitespace-nowrap overflow-ellipsis"
              >
                {{ workspace.name }}
              </span>
              <button
                mat-icon-button
                (click)="onDownloadWorkspace(workspace.id)"
                aria-label="Download workspace"
              >
                <mat-icon inline>download</mat-icon>
              </button>
              <a
                mat-icon-button
                aria-label="View workspace details"
                [routerLink]="['/workspaces', workspace.id]"
              >
                <mat-icon inline>open_in_new</mat-icon>
              </a>
            </div>
          </ng-container>

          <div class="py-2 flex justify-around items-center gap-2">
            <figure class="w-8">
              <img src="assets/images/logo.png" class="w-full" />
            </figure>
            <span class="text-center font-bold m-0">BULLDOZER</span>

            <div *hdWalletAdapter="let publicKey = publicKey">
              <button
                *ngIf="publicKey !== null"
                mat-icon-button
                bdAddWorkspace
                (newWorkspace)="onCreateWorkspace(publicKey.toBase58(), $event)"
                (importWorkspace)="onImportWorkspace($event)"
              >
                <mat-icon>add</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    WorkspaceExplorerUserStore,
    WorkspaceExplorerStore,
    UserStore,
    WorkspaceStore,
  ],
})
export class WorkspaceExplorerComponent implements OnInit {
  @Input() set workspaceId(value: string | null) {
    this._workspaceExplorerStore.setWorkspaceId(value);
  }

  readonly userId$ = this._userStore.userId$;
  readonly user$ = this._workspaceExplorerUserStore.user$;
  readonly workspace$ = this._workspaceExplorerStore.workspace$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _userApiService: UserApiService,
    private readonly _workspaceExplorerStore: WorkspaceExplorerStore,
    private readonly _workspaceExplorerUserStore: WorkspaceExplorerUserStore,
    private readonly _applicationApiService: ApplicationApiService,
    private readonly _workspaceApiService: WorkspaceApiService,
    private readonly _configStore: ConfigStore,
    private readonly _userStore: UserStore,
    private readonly _workspaceDownloaderService: WorkspaceDownloaderService
  ) {}

  ngOnInit() {
    this._workspaceExplorerUserStore.setAuthority(
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

  onDownloadWorkspace(workspaceId: string) {
    this._workspaceDownloaderService.downloadWorkspace(workspaceId).subscribe({
      error: (error) => {
        this._notificationStore.setError(error);
      },
    });
  }

  onCreateWorkspace(authority: string, workspaceDto: WorkspaceDto) {
    const workspaceKeypair = Keypair.generate();

    this._workspaceApiService
      .create(workspaceKeypair, {
        authority,
        workspaceDto,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Create workspace request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `workspace:${workspaceKeypair.publicKey.toBase58()}`,
                  `authority:${authority}`,
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

  onCreateApplication(
    authority: string,
    workspaceId: string,
    applicationDto: ApplicationDto
  ) {
    const applicationKeypair = Keypair.generate();

    this._applicationApiService
      .create(applicationKeypair, {
        authority,
        workspaceId,
        applicationDto,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Create workspace request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `application:${applicationKeypair.publicKey.toBase58()}`,
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

  onImportWorkspace(workspaceId: string) {
    this._workspaceApiService.findById(workspaceId).subscribe((workspace) => {
      if (workspace === null) {
        this._notificationStore.setError('Workspace does not exist.');
      } else {
        this._configStore.setWorkspaceId(workspaceId);
      }
    });
  }
}
