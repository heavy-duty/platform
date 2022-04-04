import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionStore } from '@bulldozer-client/collections-data-access';
import { map } from 'rxjs';
import { ViewCollectionStore } from './view-collection.store';

@Component({
  selector: 'bd-view-collection',
  template: `
    <ng-container *ngIf="collection$ | ngrxPush as collection">
      <aside class="w-96 flex flex-col">
        <header class="py-5 px-7 border-b mb-0 w-full hd-border-gray">
          <p class="mb-0 text-xl uppercase">{{ collection.document.name }}</p>
          <p class="text-xs">Visualize all the details about this collection</p>
        </header>

        <ul class="flex-1">
          <li>
            <a
              class="flex flex-col gap-1 border-l-4 py-5 px-7"
              [routerLink]="[
                '/workspaces',
                collection.document.data.workspace,
                'applications',
                collection.document.data.application,
                'collections',
                collection.document.id,
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
                    collection.document.data.workspace +
                    '/applications/' +
                    collection.document.data.application +
                    '/collections/' +
                    collection.document.id +
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
                collection.document.data.workspace,
                'applications',
                collection.document.data.application,
                'collections',
                collection.document.id,
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
                    collection.document.data.workspace +
                    '/applications/' +
                    collection.document.data.application +
                    '/collections/' +
                    collection.document.id +
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

        <footer
          class="sticky bottom-0 bd-bg-black py-5 px-7 w-full flex justify-center items-center gap-2 border-t border-white border-opacity-10 shadow-inner"
        >
          <button
            mat-stroked-button
            color="accent"
            bdEditCollection
            [collection]="collection.document"
            (editCollection)="
              onUpdateCollection(
                collection.document.data.workspace,
                collection.document.data.application,
                collection.document.id,
                $event
              )
            "
          >
            Edit
          </button>
          <button
            mat-stroked-button
            color="warn"
            (click)="
              onDeleteCollection(
                collection.document.data.workspace,
                collection.document.data.application,
                collection.document.id
              )
            "
          >
            Delete
          </button>
        </footer>
      </aside>

      <div class="w-full bg-white bg-opacity-5">
        <router-outlet></router-outlet>
      </div>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CollectionStore, ViewCollectionStore],
})
export class ViewCollectionComponent {
  @HostBinding('class') class = 'flex h-full';

  readonly collection$ = this._collectionStore.collection$;

  constructor(
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _viewCollectionStore: ViewCollectionStore,
    private readonly _collectionStore: CollectionStore
  ) {
    this._viewCollectionStore.setWorkspaceId(
      this._route.paramMap.pipe(map((paramMap) => paramMap.get('workspaceId')))
    );
    this._viewCollectionStore.setApplicationId(
      this._route.paramMap.pipe(
        map((paramMap) => paramMap.get('applicationId'))
      )
    );
    this._viewCollectionStore.setCollectionId(
      this._route.paramMap.pipe(map((paramMap) => paramMap.get('collectionId')))
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
    workspaceId: string,
    applicationId: string,
    collectionId: string,
    collectionName: string
  ) {
    this._viewCollectionStore.updateCollection({
      workspaceId,
      applicationId,
      collectionId,
      collectionName,
    });
  }

  onDeleteCollection(
    workspaceId: string,
    applicationId: string,
    collectionId: string
  ) {
    this._viewCollectionStore.deleteCollection({
      workspaceId,
      applicationId,
      collectionId,
    });
  }
}
