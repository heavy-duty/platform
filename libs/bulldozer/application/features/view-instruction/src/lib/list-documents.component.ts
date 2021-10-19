import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  InstructionAccountExtended,
  InstructionRelationExtended,
} from '@heavy-duty/bulldozer/application/utils/types';

@Component({
  selector: 'bd-list-documents',
  template: `
    <section>
      <mat-card>
        <header bdSectionHeader>
          <h2>Documents</h2>
          <p>Manage documents in the context of the instruction.</p>
        </header>

        <mat-list
          *ngIf="documents !== null && documents.length > 0; else emptyList"
          role="list"
        >
          <mat-list-item
            role="listitem"
            *ngFor="let document of documents"
            class="h-auto bg-white bg-opacity-5 mat-elevation-z2 mb-2 last:mb-0 py-2"
          >
            <div class="flex items-center gap-4 w-full">
              <div
                class="flex justify-center items-center w-12 h-12 rounded-full bg-black bg-opacity-10 text-xl font-bold"
              >
                <mat-icon>description</mat-icon>
              </div>

              <div class="flex-grow">
                <h3 class="mb-0 text-lg font-bold">
                  {{ document.data.name }}

                  <span
                    class="text-xs font-thin"
                    [ngSwitch]="document.data.modifier.id"
                  >
                    <ng-container *ngSwitchCase="1">
                      ({{ document.data.modifier.name }}: space
                      {{ document.data.space }})
                    </ng-container>
                    <ng-container *ngSwitchCase="2">
                      ({{ document.data.modifier.name }})
                    </ng-container>
                  </span>
                </h3>
                <p class="text-xs mb-0 italic" *ngIf="document.data.collection">
                  Collection:
                  {{ document.data.collection.data.name }}
                  <a
                    class="underline text-accent"
                    [routerLink]="[
                      '/applications',
                      document.data.application,
                      'collections',
                      document.data.collection.id
                    ]"
                    >{{ document.data.collection.id | obscureAddress }}</a
                  >
                </p>
                <p class="text-xs mb-0 italic" *ngIf="document.data.close">
                  Close:
                  {{ document.data.close.data.name }} ({{
                    document.data.close.id | obscureAddress
                  }})
                </p>
                <p class="text-xs mb-0 italic" *ngIf="document.data.payer">
                  Payer:
                  {{ document.data.payer.data.name }} ({{
                    document.data.payer.id | obscureAddress
                  }})
                </p>
                <ng-container
                  *ngIf="
                    document.data.relations &&
                    document.data.relations.length > 0
                  "
                >
                  <p class="mt-2 mb-0 font-bold">Relations</p>
                  <ul class="list-disc pl-4">
                    <li
                      *ngFor="let relation of document.data.relations"
                      class="text-xs"
                    >
                      {{ relation.data.to.data.name }} ({{
                        relation.data.to.id | obscureAddress
                      }})
                      <button
                        class="w-6 h-6 leading-6"
                        mat-icon-button
                        [attr.aria-label]="
                          'More options of ' +
                          relation.data.to.data.name +
                          ' has one relation'
                        "
                        [matMenuTriggerFor]="documentRelationMenu"
                      >
                        <mat-icon>more_horiz</mat-icon>
                      </button>
                      <mat-menu #documentRelationMenu="matMenu">
                        <button
                          mat-menu-item
                          (click)="onUpdateRelation(relation)"
                          [disabled]="connected === false"
                        >
                          <mat-icon>edit</mat-icon>
                          <span>Update relation</span>
                        </button>
                        <button
                          mat-menu-item
                          (click)="onDeleteRelation(relation.id)"
                          [disabled]="connected === false"
                        >
                          <mat-icon>delete</mat-icon>
                          <span>Delete relation</span>
                        </button>
                      </mat-menu>
                    </li>
                  </ul>
                </ng-container>
              </div>

              <button
                mat-mini-fab
                color="primary"
                aria-label="Document menu"
                [matMenuTriggerFor]="documentMenu"
              >
                <mat-icon>more_horiz</mat-icon>
              </button>
              <mat-menu #documentMenu="matMenu">
                <button
                  mat-menu-item
                  (click)="onUpdateDocument(document)"
                  [disabled]="!connected"
                >
                  <mat-icon>edit</mat-icon>
                  <span>Update document</span>
                </button>
                <button
                  mat-menu-item
                  (click)="onDeleteDocument(document.id)"
                  [disabled]="!connected"
                >
                  <mat-icon>delete</mat-icon>
                  <span>Delete document</span>
                </button>
              </mat-menu>
            </div>
          </mat-list-item>
        </mat-list>

        <ng-template #emptyList>
          <p class="text-center text-xl py-8">There's no documents yet.</p>
        </ng-template>
      </mat-card>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListDocumentsComponent {
  @Input() connected: boolean | null = null;
  @Input() documents: InstructionAccountExtended[] | null = null;
  @Output() updateDocument = new EventEmitter<InstructionAccountExtended>();
  @Output() deleteDocument = new EventEmitter<string>();
  @Output() updateRelation = new EventEmitter<InstructionRelationExtended>();
  @Output() deleteRelation = new EventEmitter<string>();

  onUpdateDocument(document: InstructionAccountExtended) {
    this.updateDocument.emit(document);
  }

  onDeleteDocument(documentId: string) {
    this.deleteDocument.emit(documentId);
  }

  onUpdateRelation(relation: InstructionRelationExtended) {
    this.updateRelation.emit(relation);
  }

  onDeleteRelation(relationId: string) {
    this.deleteRelation.emit(relationId);
  }
}
