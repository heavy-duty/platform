import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { CollectionAttribute, Document } from '@heavy-duty/bulldozer-devkit';
import { generateCollectionCode } from '@heavy-duty/bulldozer-generator';
import {
  ApplicationStore,
  CollectionAttributeStore,
  CollectionStore,
  TabStore,
  WorkspaceStore,
} from '@heavy-duty/bulldozer/application/data-access';
import { EditAttributeComponent } from '@heavy-duty/bulldozer/application/features/edit-attribute';
import { DarkThemeService } from '@heavy-duty/bulldozer/application/utils/services/dark-theme';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { combineLatest, Observable } from 'rxjs';
import { exhaustMap, filter, map, startWith, tap } from 'rxjs/operators';

@Injectable()
export class ViewCollectionStore extends ComponentStore<object> {
  readonly connected$ = this._walletStore.connected$;
  readonly collection$ = this._collectionStore.collection$;
  readonly collectionAttributes$ =
    this._collectionAttributeStore.collectionAttributes$;
  readonly rustCode$ = this.select(
    this._collectionStore.collection$,
    this._collectionAttributeStore.collectionAttributes$,
    (collection, collectionAttributes) =>
      collection && generateCollectionCode(collection, collectionAttributes)
  );
  readonly editorOptions$ = this._themeService.isDarkThemeEnabled$.pipe(
    map((isDarkThemeEnabled) => ({
      theme: isDarkThemeEnabled ? 'vs-dark' : 'vs-light',
      language: 'rust',
      automaticLayout: true,
      readOnly: true,
      fontSize: 16,
    }))
  );

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _walletStore: WalletStore,
    private readonly _workspaceStore: WorkspaceStore,
    private readonly _applicationStore: ApplicationStore,
    private readonly _collectionStore: CollectionStore,
    private readonly _collectionAttributeStore: CollectionAttributeStore,
    private readonly _themeService: DarkThemeService,
    private readonly _matDialog: MatDialog,
    private readonly _tabStore: TabStore
  ) {
    super({});
  }

  readonly loadWorkspaceId$ = this.effect(() =>
    this._router.events.pipe(
      filter(
        (event): event is NavigationStart => event instanceof NavigationStart
      ),
      map((event) => event.url.split('/').filter((segment) => segment)[1]),
      startWith(this._route.snapshot.paramMap.get('workspaceId')),
      tap((workspaceId) => this._workspaceStore.setWorkspaceId(workspaceId))
    )
  );

  readonly loadApplicationId$ = this.effect(() =>
    this._router.events.pipe(
      filter(
        (event): event is NavigationStart => event instanceof NavigationStart
      ),
      map((event) => event.url.split('/').filter((segment) => segment)[3]),
      startWith(this._route.snapshot.paramMap.get('applicationId')),
      tap((applicationId) =>
        this._applicationStore.setApplicationId(applicationId)
      )
    )
  );

  readonly loadCollectionId$ = this.effect(() =>
    this._router.events.pipe(
      filter(
        (event): event is NavigationStart => event instanceof NavigationStart
      ),
      map((event) => event.url.split('/').filter((segment) => segment)[5]),
      startWith(this._route.snapshot.paramMap.get('collectionId')),
      tap((collectionId) => this._collectionStore.setCollectionId(collectionId))
    )
  );

  readonly openTab$ = this.effect(() =>
    combineLatest([
      this._router.events.pipe(
        filter(
          (event): event is NavigationStart => event instanceof NavigationStart
        ),
        map((event) => event.url),
        startWith(this._router.routerState.snapshot.url),
        map((url) => url.split('/').filter((segment) => segment)),
        filter(
          (urlAsArray) =>
            urlAsArray.length === 6 &&
            urlAsArray[0] === 'workspaces' &&
            urlAsArray[2] === 'applications' &&
            urlAsArray[4] === 'collections'
        )
      ),
      this.collection$.pipe(isNotNullOrUndefined),
    ]).pipe(
      tap(([, collection]) =>
        this._tabStore.openTab({
          id: collection.id,
          label: collection.data.name,
          url: `/workspaces/${collection.data.workspace}/applications/${collection.data.application}/collections/${collection.id}`,
        })
      )
    )
  );

  readonly createCollectionAttribute = this.effect(
    (
      request$: Observable<{
        workspaceId: string;
        applicationId: string;
        collectionId: string;
      }>
    ) =>
      request$.pipe(
        exhaustMap(({ workspaceId, applicationId, collectionId }) =>
          this._matDialog
            .open(EditAttributeComponent)
            .afterClosed()
            .pipe(
              filter((data) => data),
              tap((data) =>
                this._collectionAttributeStore.createCollectionAttribute({
                  workspaceId,
                  applicationId,
                  collectionId,
                  data,
                })
              )
            )
        )
      )
  );

  readonly updateCollectionAttribute = this.effect(
    (collectionAttribute$: Observable<Document<CollectionAttribute>>) =>
      collectionAttribute$.pipe(
        exhaustMap((collectionAttribute) =>
          this._matDialog
            .open(EditAttributeComponent, { data: { collectionAttribute } })
            .afterClosed()
            .pipe(
              filter((changes) => changes),
              tap((changes) =>
                this._collectionAttributeStore.updateCollectionAttribute({
                  collectionAttribute,
                  changes,
                })
              )
            )
        )
      )
  );

  readonly deleteCollectionAttribute = this.effect(
    (collectionAttribute$: Observable<string>) =>
      collectionAttribute$.pipe(
        tap((collectionAttributeId: string) =>
          this._collectionAttributeStore.deleteCollectionAttribute(
            collectionAttributeId
          )
        )
      )
  );
}
