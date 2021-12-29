import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { CollectionAttribute, Document } from '@heavy-duty/bulldozer-devkit';
import {
  CollectionAttributeStore,
  CollectionStore,
} from '@heavy-duty/bulldozer/application/data-access';
import { EditAttributeComponent } from '@heavy-duty/bulldozer/application/features/edit-attribute';
import { DarkThemeService } from '@heavy-duty/bulldozer/application/utils/services/dark-theme';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'bd-view-collection',
  template: `
    <div class="flex" *ngIf="collection$ | ngrxPush as collection">
      <div class="p-4 w-1/2 bd-custom-height-layout overflow-auto">
        <header bdPageHeader>
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
          (createAttribute)="
            onCreateCollectionAttribute(
              collection.data.workspace,
              collection.data.application,
              collection.id
            )
          "
        >
        </bd-collection-menu>

        <main>
          <bd-list-attributes
            class="block mb-16"
            [connected]="connected$ | ngrxPush"
            [attributes]="collectionAttributes$ | ngrxPush"
            (updateAttribute)="onUpdateCollectionAttribute($event)"
            (deleteAttribute)="onDeleteCollectionAttribute($event)"
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
  readonly collectionAttributes$ = this._collectionStore.collectionAttributes$;
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
    private readonly _collectionAttributeStore: CollectionAttributeStore,
    private readonly _themeService: DarkThemeService,
    private readonly _matDialog: MatDialog
  ) {}

  ngOnInit() {
    this._collectionStore.selectCollection(
      this._router.events.pipe(
        filter(
          (event): event is NavigationStart => event instanceof NavigationStart
        ),
        map((event) => {
          const urlAsArray = event.url.split('/').filter((segment) => segment);

          if (urlAsArray.length !== 6 || urlAsArray[4] !== 'collections') {
            return null;
          } else {
            return urlAsArray[5];
          }
        }),
        startWith(this._route.snapshot.paramMap.get('collectionId') || null)
      )
    );
  }

  onReload() {
    // this._collectionStore.reload();
  }

  onCreateCollectionAttribute(
    workspaceId: string,
    applicationId: string,
    collectionId: string
  ) {
    this._collectionAttributeStore.createCollectionAttribute(
      this._matDialog
        .open(EditAttributeComponent)
        .afterClosed()
        .pipe(
          filter((data) => data),
          map((data) => ({ workspaceId, applicationId, collectionId, data }))
        )
    );
  }

  onUpdateCollectionAttribute(
    collectionAttribute: Document<CollectionAttribute>
  ) {
    this._collectionAttributeStore.updateCollectionAttribute(
      this._matDialog
        .open(EditAttributeComponent)
        .afterClosed()
        .pipe(
          filter((changes) => changes),
          map((changes) => ({ collectionAttribute, changes }))
        )
    );
  }

  onDeleteCollectionAttribute(collectionAttributeId: string) {
    this._collectionAttributeStore.deleteCollectionAttribute(
      collectionAttributeId
    );
  }
}
