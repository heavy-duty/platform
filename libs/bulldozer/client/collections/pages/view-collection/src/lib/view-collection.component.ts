import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CollectionAttributeQueryStore,
  CollectionAttributesStore,
  CollectionStore,
} from '@bulldozer-client/collections-data-access';
import { map } from 'rxjs';
import { ViewCollectionCodeStore } from './view-collection-code.store';
import { ViewCollectionStore } from './view-collection.store';

@Component({
  selector: 'bd-view-collection',
  template: `
    <ng-container *ngIf="workspace$ | ngrxPush as workspace">
      <ng-container *ngIf="application$ | ngrxPush as application">
        <ng-container *ngIf="collection$ | ngrxPush as collection">
          <aside class="w-96 flex flex-col">
            <header class="py-5 px-7 border-b mb-0 w-full hd-border-gray">
              <h2 class="mb-0 text-xl uppercase">Collections</h2>
              <small class="leading-3">
                Visualize all the details about this collection
              </small>
            </header>

            <ul>
              <li>
                <a
                  class="flex flex-col gap-1 border-l-4 py-5 px-7"
                  [routerLink]="[
                    '/workspaces',
                    workspace,
                    'applications',
                    application,
                    'collections',
                    collection,
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
                        workspace +
                        '/applications/' +
                        application +
                        '/collections/' +
                        collection +
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
            </ul>
          </aside>

          <div class="w-full bg-white bg-opacity-5">
            <router-outlet></router-outlet>
          </div>
        </ng-container>
      </ng-container>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    CollectionStore,
    CollectionAttributesStore,
    CollectionAttributeQueryStore,
    ViewCollectionStore,
    ViewCollectionCodeStore,
  ],
})
export class ViewCollectionComponent implements OnInit {
  @HostBinding('class') class = 'flex h-full';
  readonly workspace$ = this._viewCollectionStore.workspaceId$;
  readonly application$ = this._viewCollectionStore.applicationId$;
  readonly collection$ = this._viewCollectionStore.collectionId$;

  constructor(
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _viewCollectionStore: ViewCollectionStore
  ) {}

  ngOnInit() {
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
}
