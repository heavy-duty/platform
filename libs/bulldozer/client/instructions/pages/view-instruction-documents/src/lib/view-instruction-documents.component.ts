import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CollectionQueryStore,
  CollectionsStore,
} from '@bulldozer-client/collections-data-access';
import {
  InstructionAccountApiService,
  InstructionAccountClosesStore,
  InstructionAccountCollectionsStore,
  InstructionAccountPayersStore,
  InstructionAccountQueryStore,
  InstructionAccountsStore,
  InstructionRelationApiService,
  InstructionRelationQueryStore,
  InstructionRelationsStore,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import { InstructionAccountDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { Keypair } from '@solana/web3.js';
import { distinctUntilChanged, map } from 'rxjs';
import { ViewInstructionDocumentsAccountsStore } from './view-instruction-documents-accounts.store';
import { ViewInstructionDocumentsClosesReferencesStore } from './view-instruction-documents-close-references.store';
import { ViewInstructionDocumentsCollectionsReferencesStore } from './view-instruction-documents-collections-references.store';
import { ViewInstructionDocumentsCollectionsStore } from './view-instruction-documents-collections.store';
import { ViewInstructionDocumentsPayersReferencesStore } from './view-instruction-documents-payers-references.store';
import { ViewInstructionDocumentsRelationsStore } from './view-instruction-documents-relations.store';
import { ViewInstructionDocumentsStore } from './view-instruction-documents.store';

@Component({
  selector: 'bd-view-instruction-documents',
  template: `
    <header class="mb-8 ">
      <div>
        <h1 class="text-4xl uppercase mb-1 bd-font">Documents</h1>
        <p class="text-sm font-thin mb-0">
          The documents are the entities that make up the instruction.
        </p>
      </div>

      <ng-container *hdWalletAdapter="let publicKey = publicKey">
        <ng-container *ngrxLet="workspaceId$; let workspaceId">
          <ng-container *ngrxLet="applicationId$; let applicationId">
            <ng-container *ngrxLet="instructionId$; let instructionId">
              <button
                *ngIf="
                  publicKey !== null &&
                  workspaceId !== null &&
                  applicationId !== null &&
                  instructionId !== null
                "
                class="underline text-accent"
                bdEditInstructionDocument
                [collections]="(collections$ | ngrxPush) ?? null"
                [instructionAccounts]="
                  (instructionAccounts$ | ngrxPush) ?? null
                "
                (editInstructionDocument)="
                  onCreateInstructionDocument(
                    publicKey.toBase58(),
                    workspaceId,
                    applicationId,
                    instructionId,
                    $event
                  )
                "
              >
                New document
              </button>
            </ng-container>
          </ng-container>
        </ng-container>
      </ng-container>
    </header>

    <main *ngrxLet="documents$; let documents" class="pb-20">
      <div
        *ngIf="documents && documents.size > 0; else emptyList"
        class="flex gap-6 flex-wrap"
      >
        <div
          *ngFor="let instructionDocument of documents; let i = index"
          class="flex flex-col gap-2 bd-bg-image-5 bg-bd-black px-4 py-5 rounded mat-elevation-z8"
        >
          <div class="flex gap-2">
            <bd-card class="flex-1">
              <div class="flex items-center gap-4">
                <figure
                  class="w-16 h-16 flex justify-center items-center bg-bd-black rounded-full"
                  *ngIf="!(instructionDocument | bdItemChanging)"
                >
                  <img
                    src="assets/icons/instruction-document.svg"
                    onerror="this.src='assets/images/default-profile.png';"
                  />
                </figure>

                <div
                  class="flex justify-center items-center w-16 h-16 rounded-full overflow-hidden bg-bd-black"
                  *ngIf="instructionDocument | bdItemChanging"
                >
                  <mat-progress-spinner
                    diameter="36"
                    mode="indeterminate"
                  ></mat-progress-spinner>
                  <p class="m-0 text-xs text-white text-opacity-60 absolute">
                    <ng-container *ngIf="instructionDocument.isCreating">
                      Creating
                    </ng-container>
                    <ng-container *ngIf="instructionDocument.isUpdating">
                      Updating
                    </ng-container>
                    <ng-container *ngIf="instructionDocument.isDeleting">
                      Deleting
                    </ng-container>
                  </p>
                </div>

                <div class="flex-1 flex gap-8 justify-between">
                  <div class="pr-4">
                    <h2
                      class="mb-0 text-lg font-bold uppercase"
                      [matTooltip]="
                        instructionDocument.name
                          | bdItemUpdatingMessage
                            : instructionDocument
                            : 'Document'
                      "
                      matTooltipShowDelay="500"
                    >
                      {{ instructionDocument.name }}
                    </h2>

                    <p
                      class="text-xs mb-0"
                      *ngIf="instructionDocument.collection"
                    >
                      Collection:
                      <a
                        class="underline text-accent"
                        [routerLink]="[
                          '/workspaces',
                          instructionDocument.workspaceId,
                          'applications',
                          instructionDocument.applicationId,
                          'collections',
                          instructionDocument.collection.id
                        ]"
                      >
                        {{ instructionDocument.collection.name }}
                      </a>
                    </p>
                    <p class="capitalize font-bold m-0">
                      <ng-container
                        *ngIf="instructionDocument.modifier !== null"
                        [ngSwitch]="instructionDocument.modifier.id"
                      >
                        <ng-container *ngSwitchCase="0"> create </ng-container>
                        <ng-container *ngSwitchCase="1">
                          <ng-container
                            *ngIf="instructionDocument.close === null"
                          >
                            update
                          </ng-container>
                          <ng-container
                            *ngIf="instructionDocument.close !== null"
                          >
                            delete
                          </ng-container>
                        </ng-container>
                      </ng-container>

                      <ng-container
                        *ngIf="instructionDocument.modifier === null"
                      >
                        readonly
                      </ng-container>
                    </p>
                  </div>

                  <div class="self-center">
                    <p
                      class="text-xs m-0 overflow-hidden whitespace-nowrap overflow-ellipsis"
                      *ngIf="
                        instructionDocument.modifier !== null &&
                        instructionDocument.modifier.id === 0 &&
                        instructionDocument.payer !== null
                      "
                    >
                      Payed by:

                      <br />

                      <a
                        class="underline text-accent"
                        [routerLink]="[
                          '/workspaces',
                          instructionDocument.workspaceId,
                          'applications',
                          instructionDocument.applicationId,
                          'instructions',
                          instructionDocument.instructionId,
                          instructionDocument.payer.kind.id === 0
                            ? 'documents'
                            : 'signers'
                        ]"
                        >{{ instructionDocument.payer?.name }}</a
                      >

                      <br />

                      ({{ instructionDocument.space }} bytes)
                    </p>

                    <p
                      class="text-xs m-0 overflow-hidden whitespace-nowrap overflow-ellipsis"
                      *ngIf="
                        instructionDocument.modifier !== null &&
                        instructionDocument.modifier.id === 1 &&
                        instructionDocument.close !== null
                      "
                    >
                      Rent sent to:

                      <br />

                      <a
                        class="underline text-accent"
                        [routerLink]="[
                          '/workspaces',
                          instructionDocument.workspaceId,
                          'applications',
                          instructionDocument.applicationId,
                          'instructions',
                          instructionDocument.instructionId,
                          instructionDocument.kind.id === 0
                            ? 'documents'
                            : 'signers'
                        ]"
                      >
                        {{ instructionDocument.close.name }}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </bd-card>
            <bd-card class="flex flex-col justify-center">
              <ng-container *hdWalletAdapter="let publicKey = publicKey">
                <ng-container
                  *ngrxLet="instructionAccounts$; let instructionAccounts"
                >
                  <ng-container *ngrxLet="collections$; let collections">
                    <ng-container
                      *ngIf="
                        instructionAccounts !== null &&
                        collections !== null &&
                        publicKey !== null
                      "
                    >
                      <button
                        class="bd-button w-28"
                        bdEditInstructionDocument
                        [collections]="(collections$ | ngrxPush) ?? null"
                        [instructionAccounts]="
                          instructionAccounts
                            | bdRemoveById: instructionDocument.id
                        "
                        [instructionDocument]="{
                          name: instructionDocument.name,
                          kind: instructionDocument.kind.id,
                          space: instructionDocument.space,
                          payer: instructionDocument.payer?.id ?? null,
                          collection:
                            instructionDocument.collection?.id ?? null,
                          modifier: instructionDocument.modifier?.id ?? null,
                          close: instructionDocument.close?.id ?? null
                        }"
                        (editInstructionDocument)="
                          onUpdateInstructionDocument(
                            publicKey.toBase58(),
                            instructionDocument.workspaceId,
                            instructionDocument.applicationId,
                            instructionDocument.instructionId,
                            instructionDocument.id,
                            $event
                          )
                        "
                        [disabled]="instructionDocument | bdItemChanging"
                        [attr.aria-label]="
                          'Update document ' + instructionDocument.name
                        "
                      >
                        Edit
                      </button>

                      <button
                        class="bd-button w-28"
                        [attr.aria-label]="
                          'Delete document ' + instructionDocument.name
                        "
                        (click)="
                          onDeleteInstructionDocument(
                            publicKey.toBase58(),
                            instructionDocument.workspaceId,
                            instructionDocument.instructionId,
                            instructionDocument.id
                          )
                        "
                        [disabled]="instructionDocument | bdItemChanging"
                      >
                        Delete
                      </button>
                    </ng-container>
                  </ng-container>
                </ng-container>
              </ng-container>
            </bd-card>
          </div>
          <bd-card>
            <section *hdWalletAdapter="let publicKey = publicKey">
              <div class="flex justify-start items-center">
                <p class="uppercase m-0">relations</p>

                <ng-container
                  *ngrxLet="instructionAccounts$; let instructionAccounts"
                >
                  <button
                    *ngIf="publicKey !== null && instructionAccounts !== null"
                    mat-icon-button
                    bdEditInstructionRelation
                    [instructionAccounts]="
                      instructionAccounts | bdRemoveById: instructionDocument.id
                    "
                    [from]="instructionDocument.id"
                    (editInstructionRelation)="
                      onCreateInstructionRelation(
                        publicKey.toBase58(),
                        instructionDocument.workspaceId,
                        instructionDocument.applicationId,
                        instructionDocument.instructionId,
                        $event.from,
                        $event.to
                      )
                    "
                  >
                    <mat-icon class="text-base -mt-1">add</mat-icon>
                  </button>
                </ng-container>
              </div>

              <div class="flex justify-start flex-wrap gap-4">
                <div
                  *ngFor="let relation of instructionDocument.relations"
                  class="relative"
                >
                  <div
                    class="flex justify-between items-center gap-2 bg-bd-black bg-opacity-40 border border-bd-black rounded px-4 py-2"
                    *ngIf="relation.to !== null"
                  >
                    <div class="w-48">
                      <h3
                        class="uppercase font-bold m-0 overflow-hidden whitespace-nowrap overflow-ellipsis"
                        [matTooltip]="
                          relation.to.name
                            | bdItemUpdatingMessage: relation:'Relation to'
                        "
                      >
                        {{ relation.to.name }}
                      </h3>

                      <p class="text-xs font-thin m-0">
                        ({{ relation.id | obscureAddress }})
                      </p>
                    </div>

                    <button
                      *ngIf="publicKey !== null"
                      class="bd-button w-24"
                      [attr.aria-label]="
                        'Delete relation to ' + relation.to.name
                      "
                      (click)="
                        onDeleteInstructionRelation(
                          publicKey.toBase58(),
                          relation.workspaceId,
                          relation.instructionId,
                          relation.from,
                          relation.to.id
                        )
                      "
                      [disabled]="relation | bdItemChanging"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </bd-card>
        </div>
      </div>

      <ng-template #emptyList>
        <p class="text-center text-xl py-8">There's no documents yet.</p>
      </ng-template>
    </main>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    InstructionAccountsStore,
    InstructionAccountPayersStore,
    InstructionAccountClosesStore,
    InstructionAccountCollectionsStore,
    InstructionAccountQueryStore,
    InstructionRelationsStore,
    InstructionRelationQueryStore,
    CollectionsStore,
    CollectionQueryStore,
    ViewInstructionDocumentsStore,
    ViewInstructionDocumentsCollectionsStore,
    ViewInstructionDocumentsAccountsStore,
    ViewInstructionDocumentsPayersReferencesStore,
    ViewInstructionDocumentsClosesReferencesStore,
    ViewInstructionDocumentsCollectionsReferencesStore,
    ViewInstructionDocumentsRelationsStore,
  ],
})
export class ViewInstructionDocumentsComponent implements OnInit {
  @HostBinding('class') class = 'block p-8 pt-5 h-full';
  instructionBody: string | null = null;
  readonly collections$ =
    this._viewInstructionDocumentsCollectionsStore.collections$.pipe(
      map(
        (collections) =>
          collections?.filter(
            (collection) => !collection.isCreating && !collection.isDeleting
          ) ?? null
      )
    );
  readonly instructionAccounts$ =
    this._viewInstructionDocumentsAccountsStore.accounts$.pipe(
      map(
        (accounts) =>
          accounts?.filter(
            (account) => !account.isCreating && !account.isDeleting
          ) ?? null
      )
    );
  readonly documents$ = this._viewInstructionDocumentsStore.documents$;
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
  readonly instructionId$ = this._route.paramMap.pipe(
    map((paramMap) => paramMap.get('instructionId')),
    isNotNullOrUndefined,
    distinctUntilChanged()
  );

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _instructionAccountApiService: InstructionAccountApiService,
    private readonly _instructionRelationApiService: InstructionRelationApiService,
    private readonly _viewInstructionDocumentsStore: ViewInstructionDocumentsStore,
    private readonly _viewInstructionDocumentsAccountsStore: ViewInstructionDocumentsAccountsStore,
    private readonly _viewInstructionDocumentsRelationsStore: ViewInstructionDocumentsRelationsStore,
    private readonly _viewInstructionDocumentsCollectionsStore: ViewInstructionDocumentsCollectionsStore,
    private readonly _viewInstructionDocumentsPayersReferencesStore: ViewInstructionDocumentsPayersReferencesStore,
    private readonly _viewInstructionDocumentsCollectionsReferencesStore: ViewInstructionDocumentsCollectionsReferencesStore,
    private readonly _viewInstructionDocumentsClosesReferencesStore: ViewInstructionDocumentsClosesReferencesStore
  ) {}

  ngOnInit() {
    this._viewInstructionDocumentsAccountsStore.setInstructionId(
      this.instructionId$
    );
    this._viewInstructionDocumentsRelationsStore.setInstructionId(
      this.instructionId$
    );
    this._viewInstructionDocumentsPayersReferencesStore.setInstructionId(
      this.instructionId$
    );
    this._viewInstructionDocumentsCollectionsReferencesStore.setInstructionId(
      this.instructionId$
    );
    this._viewInstructionDocumentsClosesReferencesStore.setInstructionId(
      this.instructionId$
    );
    this._viewInstructionDocumentsCollectionsStore.setApplicationId(
      this.applicationId$
    );
  }

  onCreateInstructionDocument(
    authority: string,
    workspaceId: string,
    applicationId: string,
    instructionId: string,
    instructionAccountDto: InstructionAccountDto
  ) {
    const instructionAccountKeypair = Keypair.generate();

    this._instructionAccountApiService
      .create(instructionAccountKeypair, {
        instructionAccountDto,
        authority,
        workspaceId,
        applicationId,
        instructionId,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Create document request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `authority:${authority}`,
                  `instructions:${instructionId}:accounts`,
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

  onUpdateInstructionDocument(
    authority: string,
    workspaceId: string,
    applicationId: string,
    instructionId: string,
    instructionAccountId: string,
    instructionAccountDto: InstructionAccountDto
  ) {
    this._instructionAccountApiService
      .update({
        authority,
        workspaceId,
        applicationId,
        instructionId,
        instructionAccountDto,
        instructionAccountId,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Update document request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `authority:${authority}`,
                  `instructions:${instructionId}:accounts`,
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

  onDeleteInstructionDocument(
    authority: string,
    workspaceId: string,
    instructionId: string,
    instructionAccountId: string
  ) {
    this._instructionAccountApiService
      .delete({
        authority,
        workspaceId,
        instructionAccountId,
        instructionId,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Delete document request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `authority:${authority}`,
                  `instructions:${instructionId}:accounts`,
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

  onCreateInstructionRelation(
    authority: string,
    workspaceId: string,
    applicationId: string,
    instructionId: string,
    fromAccountId: string,
    toAccountId: string
  ) {
    this._instructionRelationApiService
      .create({
        fromAccountId,
        toAccountId,
        authority,
        workspaceId,
        applicationId,
        instructionId,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Create relation request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `authority:${authority}`,
                  `instructions:${instructionId}:accounts`,
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

  onDeleteInstructionRelation(
    authority: string,
    workspaceId: string,
    instructionId: string,
    fromAccountId: string,
    toAccountId: string
  ) {
    this._instructionRelationApiService
      .delete({
        authority,
        workspaceId,
        instructionId,
        fromAccountId,
        toAccountId,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Delete relation request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `authority:${authority}`,
                  `instructions:${instructionId}:accounts`,
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
