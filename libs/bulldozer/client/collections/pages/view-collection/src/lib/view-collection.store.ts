import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { DarkThemeService } from '@bulldozer-client/dark-theme-service';
import {
  CollectionAttributeStore,
  CollectionStore,
} from '@heavy-duty/bulldozer-store';
import {
  RouteStore,
  TabStore,
} from '@heavy-duty/bulldozer/application/data-access';
import { generateCollectionCode } from '@heavy-duty/generator';
import { isNotNullOrUndefined } from '@heavy-duty/rx-solana';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { combineLatest } from 'rxjs';
import { filter, map, startWith, tap } from 'rxjs/operators';

@Injectable()
export class ViewCollectionStore extends ComponentStore<object> {
  readonly connected$ = this._walletStore.connected$;
  readonly collection$ = this.select(
    this._routeStore.collectionId$,
    this._collectionStore.collections$,
    (collectionId, collections) =>
      collections.find((collection) => collection.id === collectionId)
  );
  readonly collectionAttributes$ = this.select(
    this._collectionAttributeStore.collectionAttributes$,
    this._routeStore.collectionId$,
    (collectionAttributes, collectionId) =>
      collectionAttributes.filter(
        (collectionAttribute) =>
          collectionAttribute.data.collection === collectionId
      )
  );
  readonly rustCode$ = this.select(
    this.collection$,
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
    private readonly _walletStore: WalletStore,
    private readonly _collectionStore: CollectionStore,
    private readonly _collectionAttributeStore: CollectionAttributeStore,
    private readonly _router: Router,
    private readonly _tabStore: TabStore,
    private readonly _routeStore: RouteStore,
    private readonly _themeService: DarkThemeService
  ) {
    super({});
  }

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
            urlAsArray.length === 2 && urlAsArray[0] === 'collections'
        )
      ),
      this.collection$.pipe(isNotNullOrUndefined),
    ]).pipe(
      tap(([, collection]) =>
        this._tabStore.openTab({
          id: collection.id,
          label: collection.name,
          url: `/collections/${collection.id}`,
        })
      )
    )
  );
}
