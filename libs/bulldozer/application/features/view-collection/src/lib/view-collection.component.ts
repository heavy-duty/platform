import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { CollectionAttribute, Document } from '@heavy-duty/bulldozer-devkit';
import { ViewCollectionStore } from './view-collection.store';

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
  providers: [ViewCollectionStore],
})
export class ViewCollectionComponent {
  @HostBinding('class') class = 'block';
  readonly connected$ = this._viewCollectionStore.connected$;
  readonly collection$ = this._viewCollectionStore.collection$;
  readonly collectionAttributes$ =
    this._viewCollectionStore.collectionAttributes$;
  readonly rustCodeCollection$ = this._viewCollectionStore.rustCode$;
  readonly editorOptions$ = this._viewCollectionStore.editorOptions$;

  constructor(private readonly _viewCollectionStore: ViewCollectionStore) {}

  onReload() {
    // this._collectionStore.reload();
  }

  onCreateCollectionAttribute(
    workspaceId: string,
    applicationId: string,
    collectionId: string
  ) {
    this._viewCollectionStore.createCollectionAttribute({
      workspaceId,
      applicationId,
      collectionId,
    });
  }

  onUpdateCollectionAttribute(
    collectionAttribute: Document<CollectionAttribute>
  ) {
    this._viewCollectionStore.updateCollectionAttribute(collectionAttribute);
  }

  onDeleteCollectionAttribute(
    collectionAttribute: Document<CollectionAttribute>
  ) {
    this._viewCollectionStore.deleteCollectionAttribute(collectionAttribute);
  }
}
