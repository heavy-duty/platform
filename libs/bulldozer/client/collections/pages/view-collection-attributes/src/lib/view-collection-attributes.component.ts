import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CollectionAttributeApiService,
  CollectionAttributeQueryStore,
  CollectionAttributesStore,
  CollectionStore,
} from '@bulldozer-client/collections-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import { CollectionAttributeDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { Keypair } from '@solana/web3.js';
import { distinctUntilChanged, map } from 'rxjs';
import { ViewCollectionAttributesStore } from './view-collection-attributes.store';

@Component({
  selector: 'bd-view-collection-attributes',
  template: `
    <header class="mb-8">
      <div>
        <h1 class="text-4xl uppercase mb-1 bd-font">Attributes</h1>
        <p class="text-sm font-thin mb-0">
          The attributes of all the elements that compose a collection
        </p>
      </div>

      <ng-container *hdWalletAdapter="let publicKey = publicKey">
        <ng-container *ngrxLet="workspaceId$; let workspaceId">
          <ng-container *ngrxLet="applicationId$; let applicationId">
            <ng-container *ngrxLet="collectionId$; let collectionId">
              <button
                *ngIf="
                  publicKey !== null &&
                  workspaceId !== null &&
                  applicationId !== null &&
                  collectionId !== null
                "
                class="underline text-accent"
                bdEditCollectionAttribute
                (editCollectionAttribute)="
                  onCreateCollectionAttribute(
                    publicKey.toBase58(),
                    workspaceId,
                    applicationId,
                    collectionId,
                    $event
                  )
                "
              >
                New attribute
              </button>
            </ng-container>
          </ng-container>
        </ng-container>
      </ng-container>
    </header>

    <main *ngrxLet="collectionAttributes$; let collectionAttributes">
      <div
        class="flex gap-6 flex-wrap"
        *ngIf="
          collectionAttributes && collectionAttributes.size > 0;
          else emptyList
        "
      >
        <div
          class="flex flex-col gap-2 bd-bg-image-5 bg-bd-black px-4 py-5 rounded mat-elevation-z8"
          *ngFor="
            let collectionAttribute of collectionAttributes;
            let i = index
          "
        >
          <bd-card class="flex-1 flex gap-2 justify-between">
            <figure
              *ngIf="!(collectionAttribute | bdItemChanging)"
              class="w-16 h-16 flex justify-center items-center bg-bd-black rounded-full"
            >
              <img
                src="assets/icons/collection-attribute.svg"
                onerror="this.src='assets/images/default-profile.png';"
              />
            </figure>

            <div
              *ngIf="collectionAttribute | bdItemChanging"
              class="flex justify-center items-center w-16 h-16 rounded-full overflow-hidden bg-bd-black"
            >
              <mat-progress-spinner
                diameter="36"
                mode="indeterminate"
              ></mat-progress-spinner>

              <p class="m-0 text-xs text-white text-opacity-60 absolute">
                <ng-container *ngIf="collectionAttribute.isCreating">
                  Creating
                </ng-container>
                <ng-container *ngIf="collectionAttribute.isUpdating">
                  Updating
                </ng-container>
                <ng-container *ngIf="collectionAttribute.isDeleting">
                  Deleting
                </ng-container>
              </p>
            </div>

            <div class="flex gap-10 mt-1">
              <section>
                <h2
                  class="mb-0 text-lg font-bold flex items-center gap-2"
                  [matTooltip]="
                    collectionAttribute.name
                      | bdItemUpdatingMessage: collectionAttribute:'Attribute'
                  "
                  matTooltipShowDelay="500"
                >
                  {{ collectionAttribute.name }}
                </h2>

                <p class="text-sm mb-0 capitalize">
                  {{ collectionAttribute.kind.name }}.
                </p>
              </section>
              <section class="flex flex-col gap-1">
                <p class="text-sm font-thin m-0">
                  <mat-icon inline>auto_awesome_motion</mat-icon>
                  &nbsp;
                  <ng-container
                    *ngIf="collectionAttribute.modifier !== null"
                    [ngSwitch]="collectionAttribute.modifier.id"
                  >
                    <ng-container *ngSwitchCase="0">
                      Array of Items
                    </ng-container>
                    <ng-container *ngSwitchCase="1">
                      Vector ofItems
                    </ng-container>
                  </ng-container>

                  <ng-container *ngIf="collectionAttribute.modifier === null">
                    Single Item
                  </ng-container>
                </p>
                <p
                  class="text-sm font-thin m-0"
                  *ngIf="
                    collectionAttribute.modifier !== null &&
                    collectionAttribute.modifier.size
                  "
                >
                  <mat-icon inline="">data_array</mat-icon>
                  &nbsp; Size:
                  {{ collectionAttribute.modifier?.size }}
                </p>
              </section>
            </div>
          </bd-card>
          <bd-card
            class="flex"
            *hdWalletAdapter="
              let publicKey = publicKey;
              let connected = connected
            "
          >
            <ng-container *ngIf="publicKey !== null">
              <button
                class="bd-button flex-1"
                bdEditCollectionAttribute
                [collectionAttribute]="{
                  name: collectionAttribute.name,
                  kind: collectionAttribute.kind.id,
                  max:
                    collectionAttribute.kind.id === 1
                      ? collectionAttribute.kind.size
                      : null,
                  maxLength: collectionAttribute.kind.size,
                  modifier: collectionAttribute.modifier?.id ?? null,
                  size: collectionAttribute.modifier?.size ?? null
                }"
                (editCollectionAttribute)="
                  onUpdateCollectionAttribute(
                    publicKey.toBase58(),
                    collectionAttribute.workspaceId,
                    collectionAttribute.collectionId,
                    collectionAttribute.id,
                    $event
                  )
                "
                [disabled]="
                  !connected || (collectionAttribute | bdItemChanging)
                "
              >
                Edit
              </button>
              <button
                class="bd-button flex-1"
                (click)="
                  onDeleteCollectionAttribute(
                    publicKey.toBase58(),
                    collectionAttribute.workspaceId,
                    collectionAttribute.collectionId,
                    collectionAttribute.id
                  )
                "
                [disabled]="
                  !connected || (collectionAttribute | bdItemChanging)
                "
              >
                Delete
              </button>
            </ng-container>
          </bd-card>
        </div>
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
  @HostBinding('class') class = 'block p-8 pt-5 h-full';

  readonly collectionAttributes$ =
    this._viewCollectionAttributesStore.collectionAttributes$;

  readonly workspaceId$ = this._route.paramMap.pipe(
    map((paramMap) => paramMap.get('workspaceId')),
    isNotNullOrUndefined,
    distinctUntilChanged()
  );
  readonly applicationId$ = this._route.paramMap.pipe(
    map((paramMap) => paramMap.get('applicationId')),
    isNotNullOrUndefined,
    distinctUntilChanged()
  );
  readonly collectionId$ = this._route.paramMap.pipe(
    map((paramMap) => paramMap.get('collectionId')),
    isNotNullOrUndefined,
    distinctUntilChanged()
  );

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _collectionAttributeApiService: CollectionAttributeApiService,
    private readonly _viewCollectionAttributesStore: ViewCollectionAttributesStore
  ) {}

  ngOnInit() {
    this._viewCollectionAttributesStore.setCollectionId(this.collectionId$);
  }

  onCreateCollectionAttribute(
    authority: string,
    workspaceId: string,
    applicationId: string,
    collectionId: string,
    collectionAttributeDto: CollectionAttributeDto
  ) {
    const collectionAttributeKeypair = Keypair.generate();

    this._collectionAttributeApiService
      .create(collectionAttributeKeypair, {
        collectionAttributeDto,
        authority,
        workspaceId,
        applicationId,
        collectionId,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Create attribute request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `authority:${authority}`,
                  `collections:${collectionId}:attributes`,
                  `collectionAttributes:${collectionAttributeKeypair.publicKey.toBase58()}`,
                ],
              },
            })
          );
        },
        error: (error) => {
          this._notificationStore.setError(error);
        },
      });
  }

  onUpdateCollectionAttribute(
    authority: string,
    workspaceId: string,
    collectionId: string,
    collectionAttributeId: string,
    collectionAttributeDto: CollectionAttributeDto
  ) {
    this._collectionAttributeApiService
      .update({
        authority,
        workspaceId,
        collectionId,
        collectionAttributeDto,
        collectionAttributeId,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Update attribute request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `authority:${authority}`,
                  `collections:${collectionId}:attributes`,
                  `collectionAttributes:${collectionAttributeId}`,
                ],
              },
            })
          );
        },
        error: (error) => {
          this._notificationStore.setError(error);
        },
      });
  }

  onDeleteCollectionAttribute(
    authority: string,
    workspaceId: string,
    collectionId: string,
    collectionAttributeId: string
  ) {
    this._collectionAttributeApiService
      .delete({
        authority,
        workspaceId,
        collectionAttributeId,
        collectionId,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Delete attribute request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `authority:${authority}`,
                  `collections:${collectionId}:attributes`,
                  `collectionAttributes:${collectionAttributeId}`,
                ],
              },
            })
          );
        },
        error: (error) => {
          this._notificationStore.setError(error);
        },
      });
  }
}
