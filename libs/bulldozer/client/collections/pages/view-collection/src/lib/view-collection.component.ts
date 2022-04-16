import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CollectionApiService,
  CollectionStore,
} from '@bulldozer-client/collections-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import { CollectionDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { combineLatest, distinctUntilChanged, map } from 'rxjs';
import { ViewCollectionStore } from './view-collection.store';

@Component({
  selector: 'bd-view-collection',
  template: `
    <ng-container *ngrxLet="collection$; let collection">
      <aside class="w-80 flex flex-col flex-shrink-0">
        <header class="py-5 px-7 border-b mb-0 w-full hd-border-gray">
          <ng-container *ngIf="collection !== null; else notFound">
            <p class="mb-0 text-xl uppercase">{{ collection.name }}</p>
            <p class="text-xs m-0">
              Visualize all the details about this collection.
            </p>
          </ng-container>
          <ng-template #notFound>
            <p class="mb-0 text-xl uppercase">not found</p>
            <p class="text-xs m-0">
              The collection you're trying to visualize is not available.
            </p>
          </ng-template>
        </header>

        <ng-container *ngrxLet="workspaceId$; let workspaceId">
          <ng-container *ngrxLet="applicationId$; let applicationId">
            <ng-container *ngrxLet="collectionId$; let collectionId">
              <ul
                class="flex-1"
                *ngIf="
                  workspaceId !== null &&
                  applicationId !== null &&
                  collectionId !== null
                "
              >
                <li>
                  <a
                    class="flex flex-col gap-1 border-l-4 py-5 px-7"
                    [routerLink]="[
                      '/workspaces',
                      workspaceId,
                      'applications',
                      applicationId,
                      'collections',
                      collectionId,
                      'attributes'
                    ]"
                    [routerLinkActive]="[
                      'bg-white',
                      'bg-opacity-5',
                      'border-primary'
                    ]"
                    [ngClass]="{
                      'border-transparent': !isRouteActive(
                        '/workspaces/' +
                          workspaceId +
                          '/applications/' +
                          applicationId +
                          '/collections/' +
                          collectionId +
                          '/attributes'
                      )
                    }"
                  >
                    <span class="text-lg font-bold">Attributes</span>
                    <span class="text-xs font-thin">
                      Visualize the list of attributes
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    class="flex flex-col gap-1 border-l-4 py-5 px-7"
                    [routerLink]="[
                      '/workspaces',
                      workspaceId,
                      'applications',
                      applicationId,
                      'collections',
                      collectionId,
                      'code-viewer'
                    ]"
                    [routerLinkActive]="[
                      'bg-white',
                      'bg-opacity-5',
                      'border-primary'
                    ]"
                    [ngClass]="{
                      'border-transparent': !isRouteActive(
                        '/workspaces/' +
                          workspaceId +
                          '/applications/' +
                          applicationId +
                          '/collections/' +
                          collectionId +
                          '/code-viewer'
                      )
                    }"
                  >
                    <span class="text-lg font-bold">Code Viewer</span>
                    <span class="text-xs font-thin">
                      Visualize the collection source code
                    </span>
                  </a>
                </li>
              </ul>
            </ng-container>
          </ng-container>
        </ng-container>

        <ng-container
          *hdWalletAdapter="
            let publicKey = publicKey;
            let connected = connected
          "
        >
          <footer
            class="sticky bottom-0 bd-bg-black py-5 px-7 w-full flex justify-center items-center gap-2 border-t border-white border-opacity-10 shadow-inner"
            *ngIf="publicKey !== null && collection !== null"
          >
            <ng-container>
              <button
                mat-stroked-button
                color="accent"
                bdEditCollection
                [collection]="collection"
                (editCollection)="
                  onUpdateCollection(
                    publicKey.toBase58(),
                    collection.workspaceId,
                    collection.applicationId,
                    collection.id,
                    $event
                  )
                "
                [disabled]="!connected || (collection | bdItemChanging)"
              >
                Edit
              </button>
              <button
                mat-stroked-button
                color="warn"
                (click)="
                  onDeleteCollection(
                    publicKey.toBase58(),
                    collection.workspaceId,
                    collection.applicationId,
                    collection.id
                  )
                "
                [disabled]="!connected || (collection | bdItemChanging)"
              >
                Delete
              </button>
            </ng-container>
          </footer>
        </ng-container>
      </aside>
    </ng-container>

    <div class="flex-1">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CollectionStore, ViewCollectionStore],
})
export class ViewCollectionComponent implements OnInit {
  @HostBinding('class') class = 'flex h-full';
  readonly collection$ = this._viewCollectionStore.collection$;
  readonly loading$ = this._collectionStore.loading$;
  readonly workspaceId$ = this._route.paramMap.pipe(
    map((paramMap) => paramMap.get('workspaceId')),
    isNotNullOrUndefined,
    distinctUntilChanged()
  );
  readonly applicationId$ = this._route.paramMap.pipe(
    map((paramMap) => paramMap.get('applicationId')),
    isNotNullOrUndefined,
    distinctUntilChanged()
  );
  readonly collectionId$ = this._route.paramMap.pipe(
    map((paramMap) => paramMap.get('collectionId')),
    isNotNullOrUndefined,
    distinctUntilChanged()
  );

  constructor(
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _tabStore: TabStore,
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _collectionApiService: CollectionApiService,
    private readonly _collectionStore: CollectionStore,
    private readonly _viewCollectionStore: ViewCollectionStore
  ) {}

  ngOnInit() {
    this._viewCollectionStore.setCollectionId(this.collectionId$);
    this._tabStore.openTab(
      combineLatest({
        workspaceId: this.workspaceId$,
        applicationId: this.applicationId$,
        collectionId: this.collectionId$,
      }).pipe(
        map(({ collectionId, applicationId, workspaceId }) => ({
          id: collectionId,
          kind: 'collection',
          url: `/workspaces/${workspaceId}/applications/${applicationId}/collections/${collectionId}`,
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

  onUpdateCollection(
    authority: string,
    workspaceId: string,
    applicationId: string,
    collectionId: string,
    collectionDto: CollectionDto
  ) {
    this._collectionApiService
      .update({
        authority,
        workspaceId,
        applicationId,
        collectionDto,
        collectionId,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Update collection request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `authority:${authority}`,
                  `applications:${applicationId}:collections`,
                  `collections:${collectionId}`,
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

  onDeleteCollection(
    authority: string,
    workspaceId: string,
    applicationId: string,
    collectionId: string
  ) {
    this._collectionApiService
      .delete({
        authority,
        workspaceId,
        applicationId,
        collectionId,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Delete collection request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `authority:${authority}`,
                  `applications:${applicationId}:collections`,
                  `collections:${collectionId}`,
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
