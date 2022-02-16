import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import {
  CollectionAttributesStore,
  CollectionStore,
} from '@bulldozer-client/collections-data-access';
import { CollectionAttributeDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { map } from 'rxjs';
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
            (createCollectionAttribute)="
              onCreateCollectionAttribute(
                collection.data.workspace,
                collection.data.application,
                collection.id,
                $event
              )
            "
            (updateCollectionAttribute)="
              onUpdateCollectionAttribute(
                $event.collectionAttributeId,
                $event.collectionAttributeDto
              )
            "
            (deleteCollectionAttribute)="
              onDeleteCollectionAttribute(
                $event.collectionId,
                $event.collectionAttributeId
              )
            "
          >
          </bd-collection-attributes-list>
        </main>
      </div>
      <div class="w-1/2 bd-custom-height-layout overflow-hidden">
        <bd-code-editor
          [customClass]="'bd-custom-monaco-editor'"
          [template]="(code$ | ngrxPush) ?? null"
          [options]="(editorOptions$ | ngrxPush) ?? null"
        ></bd-code-editor>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    CollectionStore,
    CollectionAttributesStore,
    ViewCollectionStore,
    ViewCollectionCodeStore,
  ],
})
export class ViewCollectionComponent {
  @HostBinding('class') class = 'block';
  readonly connected$ = this._walletStore.connected$;
  readonly collection$ = this._collectionStore.collection$;
  readonly collectionAttributes$ =
    this._collectionAttributesStore.collectionAttributes$;
  readonly code$ = this._viewCollectionCodeStore.code$;
  readonly editorOptions$ = this._viewCollectionCodeStore.editorOptions$;

  constructor(
    private readonly _viewCollectionStore: ViewCollectionStore,
    private readonly _viewCollectionCodeStore: ViewCollectionCodeStore,
    private readonly _collectionStore: CollectionStore,
    private readonly _collectionAttributesStore: CollectionAttributesStore,
    private readonly _walletStore: WalletStore
  ) {
    this._collectionAttributesStore.setFilters(
      this._viewCollectionStore.collectionId$.pipe(
        isNotNullOrUndefined,
        map((collectionId) => ({ collection: collectionId }))
      )
    );
    this._collectionStore.setCollectionId(
      this._viewCollectionStore.collectionId$
    );
  }

  onCreateCollectionAttribute(
    workspaceId: string,
    applicationId: string,
    collectionId: string,
    collectionAttributeDto: CollectionAttributeDto
  ) {
    this._collectionAttributesStore.createCollectionAttribute({
      workspaceId,
      applicationId,
      collectionId,
      collectionAttributeDto,
    });
  }

  onUpdateCollectionAttribute(
    collectionAttributeId: string,
    collectionAttributeDto: CollectionAttributeDto
  ) {
    this._collectionAttributesStore.updateCollectionAttribute({
      collectionAttributeId,
      collectionAttributeDto,
    });
  }

  onDeleteCollectionAttribute(
    collectionId: string,
    collectionAttributeId: string
  ) {
    this._collectionAttributesStore.deleteCollectionAttribute({
      collectionId,
      collectionAttributeId,
    });
  }
}
