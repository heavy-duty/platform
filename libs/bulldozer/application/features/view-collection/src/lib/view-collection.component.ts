import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import { CollectionStore } from '@heavy-duty/bulldozer/application/data-access';
import { DarkThemeService } from '@heavy-duty/bulldozer/application/ui/dark-theme';
import { CollectionAttribute } from '@heavy-duty/bulldozer/data-access';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'bd-view-collection',
  template: `
    <div class="flex">
      <div class="p-4 w-1/2 bd-custom-height-layout overflow-auto">
        <header bdPageHeader *ngIf="collection$ | ngrxPush as collection">
          <h1>
            {{ collection.data.name }}
            <button
              mat-icon-button
              color="primary"
              aria-label="Reload collection"
              (click)="onReload()"
            >
              <mat-icon>refresh</mat-icon>
            </button>
          </h1>
          <p>Visualize all the details about this collection.</p>
        </header>

        <bd-collection-menu
          [connected]="connected$ | ngrxPush"
          (createAttribute)="onCreateAttribute()"
        >
        </bd-collection-menu>

        <main>
          <bd-list-attributes
            class="block mb-16"
            [connected]="connected$ | ngrxPush"
            [attributes]="attributes$ | ngrxPush"
            (updateAttribute)="onUpdateAttribute($event)"
            (deleteAttribute)="onDeleteAttribute($event)"
          >
          </bd-list-attributes>
        </main>
      </div>
      <div class="w-1/2 bd-custom-height-layout overflow-hidden">
        <bd-code-editor
          [customClass]="'bd-custom-monaco-editor'"
          [template]="rustCodeCollection$ | ngrxPush"
          [options]="editorOptions$ | ngrxPush"
        ></bd-code-editor>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewCollectionComponent implements OnInit {
  @HostBinding('class') class = 'block';
  readonly connected$ = this._walletStore.connected$;
  readonly collection$ = this._collectionStore.collection$;
  readonly attributes$ = this._collectionStore.attributes$;
  readonly rustCodeCollection$ = this._collectionStore.rustCode$;
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
    private readonly _collectionStore: CollectionStore,
    private readonly _themeService: DarkThemeService
  ) {}

  ngOnInit() {
    this._collectionStore.selectCollection(
      this._router.events.pipe(
        filter(
          (event): event is NavigationStart => event instanceof NavigationStart
        ),
        map((event) => {
          const urlAsArray = event.url.split('/').filter((segment) => segment);

          if (urlAsArray.length !== 4 || urlAsArray[2] !== 'collections') {
            return null;
          } else {
            return urlAsArray[3];
          }
        }),
        startWith(this._route.snapshot.paramMap.get('collectionId') || null)
      )
    );
  }

  onReload() {
    this._collectionStore.reload();
  }

  onCreateAttribute() {
    this._collectionStore.createCollectionAttribute();
  }

  onUpdateAttribute(attribute: CollectionAttribute) {
    this._collectionStore.updateCollectionAttribute(attribute);
  }

  onDeleteAttribute(attributeId: string) {
    this._collectionStore.deleteCollectionAttribute(attributeId);
  }
}
