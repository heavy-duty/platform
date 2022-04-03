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
    <div class="p-5 flex-1 flex flex-col gap-5">
      <main
        class="flex flex-col gap-3"
        *ngIf="collectionAttributes$ | ngrxPush as collectionAttributes"
      >
        <mat-list
          role="list"
          *ngIf="
            collectionAttributes && collectionAttributes.length > 0;
            else emptyList
          "
          class="flex flex-col gap-2"
        >
          <mat-list-item
            role="listitem"
            *ngFor="
              let collectionAttribute of collectionAttributes;
              let i = index
            "
            class="h-20 bg-white bg-opacity-5 mat-elevation-z2"
          >
            <div class="flex items-center gap-4 w-full">
              <div
                class="flex justify-center items-center w-12 h-12 rounded-full bg-black bg-opacity-10 text-xl font-bold"
              >
                {{ i + 1 }}
              </div>
              <div class="flex-grow">
                <h3 class="mb-0 text-lg font-bold flex items-center gap-2">
                  <span
                    [matTooltip]="
                      collectionAttribute.document.name
                        | bdItemUpdatingMessage: collectionAttribute:'Attribute'
                    "
                  >
                    {{ collectionAttribute.document.name }}
                  </span>
                  <mat-progress-spinner
                    *ngIf="collectionAttribute | bdItemShowSpinner"
                    diameter="16"
                    mode="indeterminate"
                  ></mat-progress-spinner>
                </h3>
                <p class="text-xs mb-0 italic">
                  Type:

                  <ng-container
                    *ngIf="collectionAttribute.document.data.modifier"
                  >
                    {{ collectionAttribute.document.data.modifier.name }}
                    <ng-container
                      *ngIf="
                        collectionAttribute.document.data.modifier.name ===
                        'array'
                      "
                    >
                      ({{ collectionAttribute.document.data.modifier?.size }})
                    </ng-container>
                    of
                  </ng-container>

                  {{ collectionAttribute.document.data.kind.name }}.
                </p>
              </div>
              <button
                mat-mini-fab
                color="primary"
                aria-label="Attributes menu"
                [matMenuTriggerFor]="collectionAttributeMenu"
              >
                <mat-icon>more_horiz</mat-icon>
              </button>
              <mat-menu #collectionAttributeMenu="matMenu">
                <button
                  mat-menu-item
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
                  [disabled]="(connected$ | ngrxPush) === false"
                >
                  <mat-icon>edit</mat-icon>
                  <span>Update attribute</span>
                </button>
                <button
                  mat-menu-item
                  (click)="
                    onDeleteCollectionAttribute(
                      collectionAttribute.document.data.workspace,
                      collectionAttribute.document.data.collection,
                      collectionAttribute.document.id
                    )
                  "
                  [disabled]="(connected$ | ngrxPush) === false"
                >
                  <mat-icon>delete</mat-icon>
                  <span>Delete attribute</span>
                </button>
              </mat-menu>
            </div>
          </mat-list-item>
        </mat-list>

        <ng-template #emptyList>
          <p class="text-center text-xl py-8">There's no attributes yet.</p>
        </ng-template>
      </main>
    </div>
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
