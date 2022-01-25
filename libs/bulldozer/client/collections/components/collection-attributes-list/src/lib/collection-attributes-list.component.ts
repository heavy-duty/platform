import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CollectionAttribute, Document } from '@heavy-duty/bulldozer-devkit';
import { CollectionAttributesListStore } from './collection-attributes-list.store';

@Component({
  selector: 'bd-collection-attributes-list',
  template: `
    <section *ngIf="applicationId && collectionId">
      <mat-card>
        <header bdSectionHeader>
          <h2>
            Attributes
            <button
              color="primary"
              mat-icon-button
              aria-label="Add collection attribute"
              (click)="onCreateCollectionAttribute(applicationId, collectionId)"
            >
              <mat-icon>add</mat-icon>
            </button>
          </h2>
          <p>Visualize the list of attributes and manage them.</p>
        </header>

        <ng-container
          *ngrxLet="collectionAttributes$; let collectionAttributes"
        >
          <mat-list
            role="list"
            *ngIf="
              collectionAttributes && collectionAttributes.length > 0;
              else emptyList
            "
          >
            <mat-list-item
              role="listitem"
              *ngFor="
                let collectionAttribute of collectionAttributes;
                let i = index
              "
              class="h-auto bg-white bg-opacity-5 mat-elevation-z2 mb-2 last:mb-0 py-2"
            >
              <div class="flex items-center gap-4 w-full">
                <div
                  class="flex justify-center items-center w-12 h-12 rounded-full bg-black bg-opacity-10 text-xl font-bold"
                >
                  {{ i + 1 }}
                </div>
                <div class="flex-grow">
                  <h3 class="mb-0 text-lg font-bold">
                    {{ collectionAttribute.name }}
                  </h3>
                  <p class="text-xs mb-0 italic">
                    Type:

                    <ng-container *ngIf="collectionAttribute.data.modifier">
                      {{ collectionAttribute.data.modifier.name }}
                      <ng-container
                        *ngIf="
                          collectionAttribute.data.modifier.name === 'array'
                        "
                      >
                        ({{ collectionAttribute.data.modifier?.size }})
                      </ng-container>
                      of
                    </ng-container>

                    {{ collectionAttribute.data.kind.name }}.
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
                    (click)="onUpdateCollectionAttribute(collectionAttribute)"
                    [disabled]="!connected"
                  >
                    <mat-icon>edit</mat-icon>
                    <span>Update attribute</span>
                  </button>
                  <button
                    mat-menu-item
                    (click)="onDeleteCollectionAttribute(collectionAttribute)"
                    [disabled]="!connected"
                  >
                    <mat-icon>delete</mat-icon>
                    <span>Delete attribute</span>
                  </button>
                </mat-menu>
              </div>
            </mat-list-item>
          </mat-list>
        </ng-container>

        <ng-template #emptyList>
          <p class="text-center text-xl py-8">There's no attributes yet.</p>
        </ng-template>
      </mat-card>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CollectionAttributesListStore],
})
export class CollectionAttributesListComponent {
  @Input() applicationId?: string;
  @Input() collectionId?: string;
  @Input() connected = false;
  readonly collectionAttributes$ =
    this._collectionAttributesListStore.collectionAttributes$;

  constructor(
    private readonly _collectionAttributesListStore: CollectionAttributesListStore
  ) {}

  onCreateCollectionAttribute(applicationId: string, collectionId: string) {
    this._collectionAttributesListStore.createCollectionAttribute({
      applicationId,
      collectionId,
    });
  }

  onUpdateCollectionAttribute(
    collectionAttribute: Document<CollectionAttribute>
  ) {
    this._collectionAttributesListStore.updateCollectionAttribute({
      collectionAttribute,
    });
  }

  onDeleteCollectionAttribute(
    collectionAttribute: Document<CollectionAttribute>
  ) {
    this._collectionAttributesListStore.deleteCollectionAttribute({
      collectionAttribute,
    });
  }
}
