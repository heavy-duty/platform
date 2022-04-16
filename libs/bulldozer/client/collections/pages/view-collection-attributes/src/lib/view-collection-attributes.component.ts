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
    <header
      class="mb-8 border-b-2 border-yellow-500 flex items-center justify-between"
    >
      <div>
        <h1 class="text-2xl uppercase mb-1">Attributes</h1>
        <p class="text-sm font-thin mb-2">
          The attributes of all the elements that compose a collection
        </p>
      </div>

      <ng-container *ngIf="workspaceId$ | ngrxPush as workspaceId">
        <ng-container *ngIf="applicationId$ | ngrxPush as applicationId">
          <button
            *ngIf="collectionId$ | ngrxPush as collectionId"
            mat-mini-fab
            color="accent"
            bdEditCollectionAttribute
            (editCollectionAttribute)="
              onCreateCollectionAttribute(
                workspaceId,
                applicationId,
                collectionId,
                $event
              )
            "
          >
            <mat-icon>add</mat-icon>
          </button>
        </ng-container>
      </ng-container>
    </header>

    <main *ngrxLet="collectionAttributes$; let collectionAttributes">
      <div
        class="flex gap-6 flex-wrap"
        *ngIf="
          collectionAttributes && collectionAttributes.length > 0;
          else emptyList
        "
      >
        <mat-card
          *ngFor="
            let collectionAttribute of collectionAttributes;
            let i = index
          "
          class="h-auto w-96 rounded-lg overflow-hidden bd-bg-image-1 p-0"
        >
          <aside class="flex items-center bd-bg-black px-4 py-1 gap-1">
            <div class="flex-1 flex items-center gap-2">
              <ng-container *ngIf="collectionAttribute | bdItemChanging">
                <mat-progress-spinner
                  diameter="20"
                  mode="indeterminate"
                ></mat-progress-spinner>

                <p class="m-0 text-xs text-white text-opacity-60">
                  <ng-container *ngIf="collectionAttribute.isCreating">
                    Creating...
                  </ng-container>
                  <ng-container *ngIf="collectionAttribute.isUpdating">
                    Updating...
                  </ng-container>
                  <ng-container *ngIf="collectionAttribute.isDeleting">
                    Deleting...
                  </ng-container>
                </p>
              </ng-container>
            </div>
            <div class="flex flex-1 justify-end">
              <button
                mat-icon-button
                bdEditCollectionAttribute
                [collectionAttribute]="collectionAttribute.document"
                (editCollectionAttribute)="
                  onUpdateCollectionAttribute(
                    collectionAttribute.document.data.workspace,
                    collectionAttribute.document.data.collection,
                    collectionAttribute.document.id,
                    $event
                  )
                "
                [disabled]="
                  (connected$ | ngrxPush) === false ||
                  (collectionAttribute | bdItemChanging)
                "
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                (click)="
                  onDeleteCollectionAttribute(
                    collectionAttribute.document.data.workspace,
                    collectionAttribute.document.data.collection,
                    collectionAttribute.document.id
                  )
                "
                [disabled]="
                  (connected$ | ngrxPush) === false ||
                  (collectionAttribute | bdItemChanging)
                "
              >
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </aside>

          <div class="px-8 mt-4">
            <header class="flex gap-2 mb-8">
              <figure
                class="w-12 h-12 flex justify-center items-center bd-bg-black rounded-full mr-2"
              >
                <mat-icon
                  class="w-1/2"
                  [ngClass]="{
                    'text-yellow-500':
                      collectionAttribute.document.data.kind.id === 0,
                    'text-blue-500':
                      collectionAttribute.document.data.kind.id === 1,
                    'text-green-500':
                      collectionAttribute.document.data.kind.id === 2,
                    'text-purple-500':
                      collectionAttribute.document.data.kind.id === 3
                  }"
                  >list_alt</mat-icon
                >
              </figure>

              <div>
                <h2
                  class="mb-0 text-lg font-bold flex items-center gap-2"
                  [matTooltip]="
                    collectionAttribute.document.name
                      | bdItemUpdatingMessage: collectionAttribute:'Attribute'
                  "
                  matTooltipShowDelay="500"
                >
                  {{ collectionAttribute.document.name }}
                </h2>

                <p class="text-sm mb-0">
                  Type: {{ collectionAttribute.document.data.kind.name }}.
                </p>
              </div>
            </header>

            <section class="flex gap-6 mb-4 justify-between">
              <p class="text-sm font-thin m-0">
                <mat-icon inline>auto_awesome_motion</mat-icon>
                &nbsp;
                <ng-container
                  *ngIf="collectionAttribute.document.data.modifier !== null"
                  [ngSwitch]="collectionAttribute.document.data.modifier.id"
                >
                  <ng-container *ngSwitchCase="0">
                    Array of Items
                  </ng-container>
                  <ng-container *ngSwitchCase="1">
                    Vector ofItems
                  </ng-container>
                </ng-container>

                <ng-container
                  *ngIf="collectionAttribute.document.data.modifier === null"
                >
                  Single Item
                </ng-container>
              </p>
              <p
                class="text-sm font-thin m-0"
                *ngIf="
                  collectionAttribute.document.data.modifier !== null &&
                  collectionAttribute.document.data.modifier.size
                "
              >
                <mat-icon inline="">data_array</mat-icon>
                &nbsp; Size:
                {{ collectionAttribute.document.data.modifier?.size }}
              </p>
            </section>
          </div>
        </mat-card>
      </div>

      <ng-template #emptyList>
        <p class="text-center text-xl py-8">There's no attributes yet.</p>
      </ng-template>
    </main>
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

  readonly workspaceId$ = this._viewCollectionAttributesStore.workspaceId$;
  readonly applicationId$ = this._viewCollectionAttributesStore.applicationId$;
  readonly collectionId$ = this._viewCollectionAttributesStore.collectionId$;

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
