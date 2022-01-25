import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  Document,
  InstructionAccount,
  InstructionRelation,
  Relation,
} from '@heavy-duty/bulldozer-devkit';
import {
  CollectionStore,
  InstructionAccountStore,
} from '@heavy-duty/bulldozer-store';
import { combineLatest, first, map, of } from 'rxjs';
import { InstructionDocumentsListStore } from './instruction-documents-list.store';

@Component({
  selector: 'bd-instruction-documents-list',
  template: `
    <section *ngIf="instructionId && applicationId">
      <mat-card class="mb-4">
        <header bdSectionHeader>
          <h2>
            Documents
            <button
              color="primary"
              mat-icon-button
              aria-label="Add instruction document"
              (click)="
                onCreateInstructionDocument(applicationId, instructionId)
              "
            >
              <mat-icon>add</mat-icon>
            </button>
          </h2>
          <p>Visualize the list of documents and manage them.</p>
        </header>

        <ng-container
          *ngrxLet="instructionDocuments$; let instructionDocuments"
        >
          <mat-list
            role="list"
            *ngIf="
              instructionDocuments && instructionDocuments.length > 0;
              else emptyList
            "
          >
            <mat-list-item
              role="listitem"
              *ngFor="
                let instructionDocument of instructionDocuments;
                let i = index
              "
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
                    {{ instructionDocument.name }}

                    <span
                      class="text-xs font-thin"
                      *ngIf="instructionDocument.data.modifier"
                      [ngSwitch]="instructionDocument.data.modifier.id"
                    >
                      <ng-container *ngSwitchCase="0">
                        ({{ instructionDocument.data.modifier.name }}: space
                        {{ instructionDocument.data.modifier.space }})
                      </ng-container>
                      <ng-container *ngSwitchCase="1">
                        ({{ instructionDocument.data.modifier.name }})
                      </ng-container>
                    </span>
                  </h3>
                  <p
                    class="text-xs mb-0 italic"
                    *ngIf="instructionDocument.collection"
                  >
                    Collection:
                    {{ instructionDocument.collection.name }}
                    <a
                      class="underline text-accent"
                      [routerLink]="[
                        '/applications',
                        instructionDocument.data.application,
                        'collections',
                        instructionDocument.collection.id
                      ]"
                      >{{
                        instructionDocument.collection.id | obscureAddress
                      }}</a
                    >
                  </p>
                  <p
                    class="text-xs mb-0 italic"
                    *ngIf="instructionDocument.close"
                  >
                    Close:
                    {{ instructionDocument.close.name }} ({{
                      instructionDocument.close.id | obscureAddress
                    }})
                  </p>
                  <p
                    class="text-xs mb-0 italic"
                    *ngIf="instructionDocument.payer"
                  >
                    Payer:
                    {{ instructionDocument.payer.name }} ({{
                      instructionDocument.payer.id | obscureAddress
                    }})
                  </p>
                  <ng-container
                    *ngIf="
                      instructionDocument.relations &&
                      instructionDocument.relations.length > 0
                    "
                  >
                    <p class="mt-2 mb-0 font-bold">Relations</p>
                    <ul class="list-disc pl-4">
                      <li
                        *ngFor="let relation of instructionDocument.relations"
                        class="text-xs"
                      >
                        {{ relation.extras.to.name }} ({{
                          relation.id | obscureAddress
                        }})
                        <button
                          class="w-6 h-6 leading-6"
                          mat-icon-button
                          [attr.aria-label]="
                            'More options of ' +
                            relation.extras.to.name +
                            ' has one relation'
                          "
                          [matMenuTriggerFor]="documentRelationMenu"
                        >
                          <mat-icon>more_horiz</mat-icon>
                        </button>
                        <mat-menu #documentRelationMenu="matMenu">
                          <button
                            mat-menu-item
                            (click)="onUpdateInstructionRelation(relation)"
                            [disabled]="!connected"
                          >
                            <mat-icon>edit</mat-icon>
                            <span>Update relation</span>
                          </button>
                          <button
                            mat-menu-item
                            (click)="onDeleteInstructionRelation(relation)"
                            [disabled]="!connected"
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
                    (click)="
                      onCreateInstructionRelation(
                        instructionDocument.data.application,
                        instructionDocument.data.instruction,
                        instructionDocument.id
                      )
                    "
                    [disabled]="!connected"
                  >
                    <mat-icon>add</mat-icon>
                    <span>Create relation</span>
                  </button>
                  <button
                    mat-menu-item
                    (click)="onUpdateInstructionDocument(instructionDocument)"
                    [disabled]="!connected"
                  >
                    <mat-icon>edit</mat-icon>
                    <span>Update document</span>
                  </button>
                  <button
                    mat-menu-item
                    (click)="onDeleteInstructionDocument(instructionDocument)"
                    [disabled]="!connected"
                  >
                    <mat-icon>delete</mat-icon>
                    <span>Delete document</span>
                  </button>
                </mat-menu>
              </div>
            </mat-list-item>
          </mat-list>
        </ng-container>

        <ng-template #emptyList>
          <p class="text-center text-xl py-8">There's no documents yet.</p>
        </ng-template>
      </mat-card>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [InstructionDocumentsListStore],
})
export class InstructionDocumentsListComponent {
  @Input() applicationId?: string;
  @Input() instructionId?: string;
  @Input() connected = false;
  readonly instructionDocuments$ =
    this._instructionDocumentsListStore.instructionDocuments$;

  constructor(
    private readonly _instructionDocumentsListStore: InstructionDocumentsListStore,
    private readonly _instructionAccountStore: InstructionAccountStore,
    private readonly _collectionStore: CollectionStore
  ) {}

  onCreateInstructionDocument(applicationId: string, instructionId: string) {
    this._instructionDocumentsListStore.createInstructionDocument(
      combineLatest({
        applicationId: of(applicationId),
        instructionId: of(instructionId),
        collections: this._collectionStore.collections$,
        instructionAccounts:
          this._instructionAccountStore.instructionAccounts$.pipe(
            map((instructionAccounts) =>
              instructionAccounts.filter(
                (instructionAccount) =>
                  instructionAccount.data.instruction === instructionId
              )
            )
          ),
      }).pipe(first())
    );
  }

  onUpdateInstructionDocument(
    instructionDocument: Document<InstructionAccount>
  ) {
    this._instructionDocumentsListStore.updateInstructionDocument(
      combineLatest({
        instructionAccount: of(instructionDocument),
        collections: this._collectionStore.collections$,
        instructionAccounts:
          this._instructionAccountStore.instructionAccounts$.pipe(
            map((instructionAccounts) =>
              instructionAccounts.filter(
                (instructionAccount) =>
                  instructionAccount.data.instruction ===
                  instructionDocument.data.instruction
              )
            )
          ),
      })
    );
  }

  onDeleteInstructionDocument(
    instructionDocument: Document<InstructionAccount>
  ) {
    this._instructionDocumentsListStore.deleteInstructionDocument({
      instructionAccount: instructionDocument,
    });
  }

  onCreateInstructionRelation(
    applicationId: string,
    instructionId: string,
    documentId: string
  ) {
    this._instructionDocumentsListStore.createInstructionRelation(
      combineLatest({
        instructionId: of(instructionId),
        applicationId: of(applicationId),
        documentId: of(documentId),
        instructionAccounts:
          this._instructionAccountStore.instructionAccounts$.pipe(
            map((instructionAccounts) =>
              instructionAccounts.filter(
                (instructionAccount) =>
                  instructionAccount.data.instruction === instructionId
              )
            )
          ),
      }).pipe(first())
    );
  }

  onUpdateInstructionRelation(
    instructionRelation: Relation<InstructionRelation>
  ) {
    this._instructionDocumentsListStore.updateInstructionRelation(
      combineLatest({
        instructionRelation: of(instructionRelation),
        instructionAccounts:
          this._instructionAccountStore.instructionAccounts$.pipe(
            map((instructionAccounts) =>
              instructionAccounts.filter(
                (instructionAccount) =>
                  instructionAccount.data.instruction ===
                  instructionRelation.from
              )
            )
          ),
      }).pipe(first())
    );
  }

  onDeleteInstructionRelation(
    instructionRelation: Relation<InstructionRelation>
  ) {
    this._instructionDocumentsListStore.deleteInstructionRelation({
      instructionRelation,
    });
  }
}
