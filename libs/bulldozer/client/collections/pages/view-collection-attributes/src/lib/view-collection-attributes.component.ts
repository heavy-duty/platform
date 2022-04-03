import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CollectionAttributeQueryStore,
  CollectionAttributesStore,
  CollectionStore,
} from '@bulldozer-client/collections-data-access';
import { CollectionAttributeDto } from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { map } from 'rxjs';
import { ViewCollectionAttributesStore } from './view-collection-attributes.store';

@Component({
  selector: 'bd-view-collection-attributes',
  template: `
    <header class="mb-8 border-b-2 border-yellow-500">
      <h1 class="text-2xl uppercase mb-1">attributes</h1>
      <p class="text-sm font-thin mb-2">
        List of the budgets for this workspaces.
      </p>
    </header>
    <ng-container *ngIf="collection$ | ngrxPush as collection">
      <div class="p-5 flex-1 flex flex-col gap-5">
        <!-- <header bdPageHeader>
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
        </header> -->

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
    </ng-container>
  `,
  styles: [],
  providers: [
    CollectionStore,
    CollectionAttributesStore,
    CollectionAttributeQueryStore,
    ViewCollectionAttributesStore,
  ],
})
export class ViewCollectionAttributesComponent implements OnInit {
  @HostBinding('class') class = 'block p-8 bg-white bg-opacity-5 h-full';

  readonly connected$ = this._walletStore.connected$;
  readonly collection$ = this._collectionStore.collection$;
  readonly collectionAttributes$ =
    this._collectionAttributesStore.collectionAttributes$;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _walletStore: WalletStore,
    private readonly _viewCollectionAttributesStore: ViewCollectionAttributesStore,
    private readonly _collectionStore: CollectionStore,
    private readonly _collectionAttributesStore: CollectionAttributesStore
  ) {}

  ngOnInit(): void {
    this._viewCollectionAttributesStore.setWorkspaceId(
      this._route.paramMap.pipe(map((paramMap) => paramMap.get('workspaceId')))
    );
    this._viewCollectionAttributesStore.setApplicationId(
      this._route.paramMap.pipe(
        map((paramMap) => paramMap.get('applicationId'))
      )
    );
    this._viewCollectionAttributesStore.setCollectionId(
      this._route.paramMap.pipe(map((paramMap) => paramMap.get('collectionId')))
    );
  }

  onCreateCollectionAttribute(
    workspaceId: string,
    applicationId: string,
    collectionId: string,
    collectionAttributeDto: CollectionAttributeDto
  ) {
    this._viewCollectionAttributesStore.createCollectionAttribute({
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
    this._viewCollectionAttributesStore.updateCollectionAttribute({
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
    this._viewCollectionAttributesStore.deleteCollectionAttribute({
      workspaceId,
      collectionId,
      collectionAttributeId,
    });
  }
}
