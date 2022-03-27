import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CollectionAttributeQueryStore,
  CollectionAttributesStore,
  CollectionStore,
} from '@bulldozer-client/collections-data-access';
import { CollectionAttributeDto } from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { map } from 'rxjs';
import { ViewCollectionCodeStore } from './view-collection-code.store';
import { ViewCollectionStore } from './view-collection.store';

@Component({
  selector: 'bd-view-collection',
  template: `
    <div class="flex" *ngIf="collection$ | ngrxPush as collection">
      <div
        class="p-5 w-1/2 bd-custom-height-content overflow-auto flex flex-col gap-5"
      >
        <header bdPageHeader>
          <h1>
            <span
              [matTooltip]="
                collection.document.name
                  | bdItemUpdatingMessage: collection:'Collection'
              "
              matTooltipShowDelay="500"
              class="flex items-center justify-start gap-2"
            >
              {{ collection.document.name }}
              <mat-progress-spinner
                *ngIf="collection | bdItemShowSpinner"
                diameter="16"
                mode="indeterminate"
              ></mat-progress-spinner>
            </span>
          </h1>
          <p>Visualize all the details about this collection.</p>
        </header>

        <main>
          <bd-collection-attributes-list
            [connected]="(connected$ | ngrxPush) ?? false"
            [collectionAttributes]="(collectionAttributes$ | ngrxPush) ?? null"
            (createCollectionAttribute)="
              onCreateCollectionAttribute(
                collection.document.data.workspace,
                collection.document.data.application,
                collection.document.id,
                $event
              )
            "
            (updateCollectionAttribute)="
              onUpdateCollectionAttribute(
                collection.document.data.workspace,
                collection.document.id,
                $event.collectionAttributeId,
                $event.collectionAttributeDto
              )
            "
            (deleteCollectionAttribute)="
              onDeleteCollectionAttribute(
                collection.document.data.workspace,
                $event.collectionId,
                $event.collectionAttributeId
              )
            "
          >
          </bd-collection-attributes-list>
        </main>
      </div>
      <div class="w-1/2 bd-custom-height-content overflow-hidden">
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
    CollectionAttributeQueryStore,
    ViewCollectionStore,
    ViewCollectionCodeStore,
  ],
})
export class ViewCollectionComponent implements OnInit {
  @HostBinding('class') class = 'block';
  readonly connected$ = this._walletStore.connected$;
  readonly collection$ = this._collectionStore.collection$;
  readonly collectionAttributes$ =
    this._collectionAttributesStore.collectionAttributes$;
  readonly code$ = this._viewCollectionCodeStore.code$;
  readonly editorOptions$ = this._viewCollectionCodeStore.editorOptions$;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _viewCollectionStore: ViewCollectionStore,
    private readonly _viewCollectionCodeStore: ViewCollectionCodeStore,
    private readonly _collectionStore: CollectionStore,
    private readonly _collectionAttributesStore: CollectionAttributesStore,
    private readonly _walletStore: WalletStore
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

  onCreateCollectionAttribute(
    workspaceId: string,
    applicationId: string,
    collectionId: string,
    collectionAttributeDto: CollectionAttributeDto
  ) {
    this._viewCollectionStore.createCollectionAttribute({
      workspaceId,
      applicationId,
      collectionId,
      collectionAttributeDto,
    });
  }

  onUpdateCollectionAttribute(
    workspaceId: string,
    collectionId: string,
    collectionAttributeId: string,
    collectionAttributeDto: CollectionAttributeDto
  ) {
    this._viewCollectionStore.updateCollectionAttribute({
      workspaceId,
      collectionId,
      collectionAttributeId,
      collectionAttributeDto,
    });
  }

  onDeleteCollectionAttribute(
    workspaceId: string,
    collectionId: string,
    collectionAttributeId: string
  ) {
    this._viewCollectionStore.deleteCollectionAttribute({
      workspaceId,
      collectionId,
      collectionAttributeId,
    });
  }
}
