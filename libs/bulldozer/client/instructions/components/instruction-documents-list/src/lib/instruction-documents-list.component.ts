import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { InstructionAccountDto } from '@heavy-duty/bulldozer-devkit';
import {
  CollectionStore,
  InstructionAccountStore,
  InstructionRelationStore,
} from '@heavy-duty/bulldozer-store';
import { InstructionDocumentsListStore } from './instruction-documents-list.store';

@Component({
  selector: 'bd-instruction-documents-list',
  template: `
    <ng-container *ngIf="instructionId$ | ngrxPush as instructionId">
      <section *ngIf="applicationId">
        <mat-card class="mb-4">
          <header bdSectionHeader>
            <h2>
              Documents
              <button
                color="primary"
                mat-icon-button
                aria-label="Add instruction document"
                bdEditInstructionDocumentTrigger
                [collections]="collections$ | ngrxPush"
                [instructionAccounts]="instructionAccounts$ | ngrxPush"
                (editInstructionDocument)="
                  onCreateInstructionDocument(
                    applicationId,
                    instructionId,
                    $event
                  )
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
                              bdEditInstructionRelationTrigger
                              [instructionRelation]="relation"
                              [collections]="collections$ | ngrxPush"
                              [instructionAccounts]="
                                instructionAccounts$ | ngrxPush
                              "
                              [from]="instructionDocument.id"
                              (editInstructionRelation)="
                                onUpdateInstructionRelation(
                                  relation.id,
                                  $event.from,
                                  $event.to
                                )
                              "
                              [disabled]="!connected"
                            >
                              <mat-icon>edit</mat-icon>
                              <span>Update relation</span>
                            </button>
                            <button
                              mat-menu-item
                              (click)="
                                onDeleteInstructionRelation(
                                  relation.id,
                                  relation.from,
                                  relation.to
                                )
                              "
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
                      bdEditInstructionRelationTrigger
                      [collections]="collections$ | ngrxPush"
                      [instructionAccounts]="instructionAccounts$ | ngrxPush"
                      [from]="instructionDocument.id"
                      (editInstructionRelation)="
                        onCreateInstructionRelation(
                          applicationId,
                          instructionId,
                          $event.from,
                          $event.to
                        )
                      "
                      [disabled]="!connected"
                    >
                      <mat-icon>add</mat-icon>
                      <span>Create relation</span>
                    </button>
                    <button
                      mat-menu-item
                      bdEditInstructionDocumentTrigger
                      [collections]="collections$ | ngrxPush"
                      [instructionAccounts]="instructionAccounts$ | ngrxPush"
                      [instructionDocument]="instructionDocument"
                      (editInstructionDocument)="
                        onUpdateInstructionDocument(
                          instructionDocument.id,
                          $event
                        )
                      "
                      [disabled]="!connected"
                    >
                      <mat-icon>edit</mat-icon>
                      <span>Update document</span>
                    </button>
                    <button
                      mat-menu-item
                      (click)="
                        onDeleteInstructionDocument(
                          instructionId,
                          instructionDocument.id
                        )
                      "
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
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [InstructionDocumentsListStore],
})
export class InstructionDocumentsListComponent {
  @Input() connected = false;
  @Input() applicationId?: string;
  @Input() set instructionId(value: string | undefined) {
    this._instructionDocumentsListStore.setInstructionId(value);
  }
  readonly instructionId$ = this._instructionDocumentsListStore.instructionId$;
  readonly instructionDocuments$ =
    this._instructionDocumentsListStore.instructionDocuments$;
  readonly collections$ = this._collectionStore.collections$;
  readonly instructionAccounts$ =
    this._instructionDocumentsListStore.instructionAccounts$;

  constructor(
    private readonly _instructionDocumentsListStore: InstructionDocumentsListStore,
    private readonly _instructionAccountStore: InstructionAccountStore,
    private readonly _instructionRelationStore: InstructionRelationStore,
    private readonly _collectionStore: CollectionStore
  ) {}

  onCreateInstructionDocument(
    applicationId: string,
    instructionId: string,
    instructionAccountDto: InstructionAccountDto
  ) {
    this._instructionAccountStore.createInstructionAccount({
      applicationId,
      instructionId,
      instructionAccountDto,
    });
  }

  onUpdateInstructionDocument(
    instructionDocumentId: string,
    instructionDocumentDto: InstructionAccountDto
  ) {
    this._instructionAccountStore.updateInstructionAccount({
      instructionAccountId: instructionDocumentId,
      instructionAccountDto: instructionDocumentDto,
    });
  }

  onDeleteInstructionDocument(
    instructionId: string,
    instructionDocumentId: string
  ) {
    this._instructionAccountStore.deleteInstructionAccount({
      instructionId,
      instructionAccountId: instructionDocumentId,
    });
  }

  onCreateInstructionRelation(
    applicationId: string,
    instructionId: string,
    from: string,
    to: string
  ) {
    this._instructionRelationStore.createInstructionRelation({
      applicationId,
      instructionId,
      from,
      to,
    });
  }

  onUpdateInstructionRelation(
    instructionRelationId: string,
    from: string,
    to: string
  ) {
    this._instructionRelationStore.updateInstructionRelation({
      instructionRelationId,
      from,
      to,
    });
  }

  onDeleteInstructionRelation(
    instructionRelationId: string,
    from: string,
    to: string
  ) {
    this._instructionRelationStore.deleteInstructionRelation({
      instructionRelationId,
      from,
      to,
    });
  }
}
