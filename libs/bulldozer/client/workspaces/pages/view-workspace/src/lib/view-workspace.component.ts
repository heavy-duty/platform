import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TabStore } from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import {
  WorkspaceApiService,
  WorkspaceStore,
} from '@bulldozer-client/workspaces-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import { WorkspaceDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { distinctUntilChanged, map } from 'rxjs';
import { ViewWorkspaceStore } from './view-workspace.store';

@Component({
  selector: 'bd-view-workspace',
  template: `
    <ng-container *ngrxLet="workspace$; let workspace">
      <aside class="w-80 flex flex-col flex-shrink-0">
        <header class="py-5 px-7 border-b mb-0 w-full hd-border-gray">
          <ng-container *ngIf="workspace !== null; else notFound">
            <p class="mb-0 text-xl uppercase">{{ workspace.name }}</p>
            <p class="text-xs m-0">
              Visualize all the details about this workspace.
            </p>
          </ng-container>
          <ng-template #notFound>
            <p class="mb-0 text-xl uppercase">not found</p>
            <p class="text-xs m-0">
              The workspace you're trying to visualize is not available.
            </p>
          </ng-template>
        </header>

        <ng-container *ngrxLet="workspaceId$; let workspaceId">
          <ul class="flex-1" *ngIf="workspaceId !== null">
            <li>
              <a
                class="flex flex-col gap-1 border-l-4 py-5 px-7"
                [routerLink]="['/workspaces', workspaceId, 'budget']"
                [routerLinkActive]="[
                  'bg-white',
                  'bg-opacity-5',
                  'border-primary'
                ]"
                [ngClass]="{
                  'border-transparent': !isRouteActive(
                    '/workspaces/' + workspaceId + '/budget'
                  )
                }"
              >
                <span class="text-lg font-bold">Budget</span>
                <span class="text-xs font-thin">
                  Visualize budget details.
                </span>
              </a>
            </li>
            <li>
              <a
                class="flex flex-col gap-1 border-l-4 py-5 px-7"
                [routerLink]="['/workspaces', workspaceId, 'collaborators']"
                [routerLinkActive]="[
                  'bg-white',
                  'bg-opacity-5',
                  'border-primary'
                ]"
                [ngClass]="{
                  'border-transparent': !isRouteActive(
                    '/workspaces/' + workspaceId + '/collaborators'
                  )
                }"
              >
                <span class="text-lg font-bold">Collaborators</span>
                <span class="text-xs font-thin">
                  Visualize and manage collaborators.
                </span>
              </a>
            </li>

            <li>
              <a
                class="flex flex-col gap-1 border-l-4 py-5 px-7"
                [routerLink]="['/workspaces', workspaceId, 'instructions']"
                [routerLinkActive]="[
                  'bg-white',
                  'bg-opacity-5',
                  'border-primary'
                ]"
                [ngClass]="{
                  'border-transparent': !isRouteActive(
                    '/workspaces/' + workspaceId + '/instructions'
                  )
                }"
              >
                <span class="text-lg font-bold">Instructions</span>
                <span class="text-xs font-thin">
                  Visualize all the ongoing instructions.
                </span>
              </a>
            </li>
          </ul>
        </ng-container>

        <ng-container *hdWalletAdapter="let publicKey = publicKey">
          <footer
            *ngIf="publicKey !== null && workspace !== null"
            class="sticky bottom-0 py-5 px-7 w-full flex justify-center items-center gap-2 border-t border-white border-opacity-10 shadow-inner"
          >
            <button
              mat-stroked-button
              color="accent"
              bdEditWorkspace
              [workspace]="workspace"
              (editWorkspace)="
                onUpdateWorkspace(publicKey.toBase58(), workspace.id, $event)
              "
            >
              Edit
            </button>
            <button
              mat-stroked-button
              color="warn"
              (click)="onDeleteWorkspace(publicKey.toBase58(), workspace.id)"
            >
              Delete
            </button>
          </footer>
        </ng-container>
      </aside>

      <div class="flex-1">
        <router-outlet></router-outlet>
      </div>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [WorkspaceStore, ViewWorkspaceStore],
})
export class ViewWorkspaceComponent implements OnInit {
  @HostBinding('class') class = 'flex h-full';

  readonly workspaceId$ = this._route.paramMap.pipe(
    map((paramMap) => paramMap.get('workspaceId')),
    isNotNullOrUndefined,
    distinctUntilChanged()
  );
  readonly workspace$ = this._viewWorkspaceStore.workspace$;

  constructor(
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _tabStore: TabStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _workspaceApiService: WorkspaceApiService,
    private readonly _viewWorkspaceStore: ViewWorkspaceStore
  ) {}

  ngOnInit() {
    this._viewWorkspaceStore.setWorkspaceId(this.workspaceId$);
    this._tabStore.openTab(
      this.workspaceId$.pipe(
        map((workspaceId) => ({
          id: workspaceId,
          kind: 'workspace',
          url: `/workspaces/${workspaceId}`,
        }))
      )
    );
  }

  isRouteActive(url: string) {
    return this._router.isActive(url, {
      paths: 'exact',
      queryParams: 'exact',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  onUpdateWorkspace(
    authority: string,
    workspaceId: string,
    workspaceDto: WorkspaceDto
  ) {
    this._workspaceApiService
      .update({
        workspaceDto,
        authority,
        workspaceId,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Update workspace request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `workspace:${workspaceId}`,
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

  onDeleteWorkspace(authority: string, workspaceId: string) {
    this._workspaceApiService
      .delete({
        authority,
        workspaceId,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Delete workspace request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `workspace:${workspaceId}`,
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
}
