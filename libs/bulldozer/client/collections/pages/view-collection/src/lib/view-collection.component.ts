import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { CollectionAttributeDto } from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ViewCollectionAttributesStore } from './view-collection-attributes.store';
import { ViewCollectionCodeStore } from './view-collection-code.store';
import { ViewCollectionStore } from './view-collection.store';

@Component({
  selector: 'bd-view-collection',
  template: `
    <div class="flex" *ngIf="collection$ | ngrxPush as collection">
      <div class="p-4 w-1/2 bd-custom-height-layout overflow-auto">
        <header bdPageHeader>
          <h1>
            {{ collection.name }}
          </h1>
          <p>Visualize all the details about this collection.</p>
        </header>

        <main>
          <bd-collection-attributes-list
            class="block mb-16"
            [connected]="(connected$ | ngrxPush) ?? false"
            [collectionAttributes]="(collectionAttributes$ | ngrxPush) ?? null"
            (createCollectionAttribute)="onCreateCollectionAttribute($event)"
            (updateCollectionAttribute)="onUpdateCollectionAttribute($event)"
            (deleteCollectionAttribute)="onDeleteCollectionAttribute($event)"
          >
          </bd-collection-attributes-list>
        </main>
      </div>
      <div class="w-1/2 bd-custom-height-layout overflow-hidden">
        <bd-code-editor
          [customClass]="'bd-custom-monaco-editor'"
          [template]="(collectionCode$ | ngrxPush) ?? null"
          [options]="(editorOptions$ | ngrxPush) ?? null"
        ></bd-code-editor>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ViewCollectionStore,
    ViewCollectionAttributesStore,
    ViewCollectionCodeStore,
  ],
})
export class ViewCollectionComponent {
  @HostBinding('class') class = 'block';
  readonly connected$ = this._walletStore.connected$;
  readonly collection$ = this._viewCollectionStore.collection$;
  readonly collectionAttributes$ =
    this._viewCollectionAttributesStore.collectionAttributes$;
  readonly collectionCode$ = this._viewCollectionCodeStore.code$;
  readonly editorOptions$ = this._viewCollectionCodeStore.editorOptions$;

  constructor(
    private readonly _viewCollectionStore: ViewCollectionStore,
    private readonly _viewCollectionAttributesStore: ViewCollectionAttributesStore,
    private readonly _viewCollectionCodeStore: ViewCollectionCodeStore,
    private readonly _walletStore: WalletStore
  ) {}

  onCreateCollectionAttribute(collectionAttributeDto: CollectionAttributeDto) {
    this._viewCollectionAttributesStore.createCollectionAttribute({
      collectionAttributeDto,
    });
  }

  onUpdateCollectionAttribute(request: {
    collectionAttributeId: string;
    collectionAttributeDto: CollectionAttributeDto;
  }) {
    this._viewCollectionAttributesStore.updateCollectionAttribute(request);
  }

  onDeleteCollectionAttribute(collectionAttributeId: string) {
    this._viewCollectionAttributesStore.deleteCollectionAttribute({
      collectionAttributeId,
    });
  }
}
