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
  InstructionRelationQueryStore,
  InstructionRelationsStore,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import { InstructionAccountDto } from '@heavy-duty/bulldozer-devkit';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { Keypair } from '@solana/web3.js';
import { distinctUntilChanged, map } from 'rxjs';
import { ViewInstructionDocumentsAccountsStore } from './view-instruction-documents-accounts.store';
import { ViewInstructionDocumentsClosesReferencesStore } from './view-instruction-documents-close-references.store';
import { ViewInstructionDocumentsCollectionsReferencesStore } from './view-instruction-documents-collections-references.store';
import { ViewInstructionDocumentsCollectionsStore } from './view-instruction-documents-collections.store';
import { ViewInstructionDocumentsPayersReferencesStore } from './view-instruction-documents-payers-references.store';
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

    <main *ngrxLet="documents$; let documents">
      <div
        *ngIf="documents && documents.size > 0; else emptyList"
        class="flex gap-6 flex-wrap"
      >
        <mat-card
          *ngFor="let instructionDocument of documents; let i = index"
          class="h-auto w-full rounded-lg overflow-hidden bd-bg-image-1 p-0 mat-elevation-z8"
        >
          <aside class="flex items-center bd-bg-black px-4 py-1 gap-1">
            <div class="flex-1 flex items-center gap-2">
              <ng-container *ngIf="instructionDocument | bdItemChanging">
                <mat-progress-spinner
                  diameter="20"
                  mode="indeterminate"
                ></mat-progress-spinner>

                <p class="m-0 text-xs text-white text-opacity-60">
                  <ng-container *ngIf="instructionDocument.isCreating">
                    Creating...
                  </ng-container>
                  <ng-container *ngIf="instructionDocument.isUpdating">
                    Updating...
                  </ng-container>
                  <ng-container *ngIf="instructionDocument.isDeleting">
                    Deleting...
                  </ng-container>
                </p>
              </ng-container>
            </div>

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
                      mat-icon-button
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
                        collection: instructionDocument.collection?.id ?? null,
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
                      <mat-icon>edit</mat-icon>
                    </button>

                    <button
                      mat-icon-button
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
                      <mat-icon>delete</mat-icon>
                    </button>
                  </ng-container>
                </ng-container>
              </ng-container>
            </ng-container>
          </aside>

          <header class="flex items-center gap-4 p-4">
            <div
              class="w-12 h-12 flex justify-center items-center bd-bg-black rounded-full"
            >
              <mat-icon
                class="w-1/2"
                [ngClass]="{
                  'text-green-500': instructionDocument.modifier === null,
                  'text-blue-500': instructionDocument.modifier?.id === 0,
                  'text-purple-500':
                    instructionDocument.modifier?.id === 1 &&
                    instructionDocument.close === null,
                  'text-yellow-700':
                    instructionDocument.modifier?.id === 1 &&
                    instructionDocument.close !== null
                }"
              >
                description
              </mat-icon>
            </div>

            <div class="flex-1">
              <h2
                class="mb-0 text-lg font-bold uppercase"
                [matTooltip]="
                  instructionDocument.name
                    | bdItemUpdatingMessage: instructionDocument:'Document'
                "
                matTooltipShowDelay="500"
              >
                {{ instructionDocument.name }}
              </h2>

              <p class="text-xs mb-0" *ngIf="instructionDocument.collection">
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
            </div>

            <div class="w-32 text-center">
              <p class="text-lg uppercase font-bold m-0">
                <ng-container
                  *ngIf="instructionDocument.modifier !== null"
                  [ngSwitch]="instructionDocument.modifier.id"
                >
                  <ng-container *ngSwitchCase="0"> create </ng-container>
                  <ng-container *ngSwitchCase="1">
                    <ng-container *ngIf="instructionDocument.close === null">
                      update
                    </ng-container>
                    <ng-container *ngIf="instructionDocument.close !== null">
                      delete
                    </ng-container>
                  </ng-container>
                </ng-container>

                <ng-container *ngIf="instructionDocument.modifier === null">
                  readonly
                </ng-container>
              </p>

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
                    instructionDocument.kind.id === 0 ? 'documents' : 'signers'
                  ]"
                >
                  {{ instructionDocument.close.name }}
                </a>
              </p>
            </div>
          </header>

          <section class="p-4">
            <div class="flex justify-start items-center">
              <p class="text-lg uppercase m-0">relation</p>
              <!-- <button
                mat-icon-button
                bdEditInstructionRelation
                [instructionAccounts]="
                  (instructionAccounts$ | ngrxPush) ?? null
                "
                [from]="instructionDocument.id"
                (editInstructionRelation)="
                  onCreateInstructionRelation(
                    instructionDocument.workspace,
                    instructionDocument.application,
                    instructionDocument.instruction,
                    $event.from,
                    $event.to
                  )
                "
                [disabled]="(connected$ | ngrxPush) === false"
              >
                <mat-icon>add</mat-icon>
              </button> -->
            </div>

            <!-- <div class="flex justify-start flex-wrap gap-4">
              <div
                *ngFor="let relation of instructionDocument.relations"
                class="relative"
              >
                <div
                  class="flex justify-between items-center gap-2 bd-bg-black px-8 py-2"
                >
                  <div class="w-48">
                    <h3
                      class="uppercase font-bold m-0 overflow-hidden whitespace-nowrap overflow-ellipsis"
                      [matTooltip]="
                        relation.extras.to.name
                          | bdItemUpdatingMessage: relation:'Relation to'
                      "
                    >
                      {{ relation.extras.to.name }}
                    </h3>

                    <p class="text-xs font-thin m-0">
                      ({{ relation.id | obscureAddress }})
                    </p>
                  </div>

                  <div class="w-10">
                    <button
                      mat-icon-button
                      [attr.aria-label]="
                        'Delete relation to ' + relation.extras.to.name
                      "
                      (click)="
                        onDeleteInstructionRelation(
                          relation.workspace,
                          relation.instruction,
                          relation.from,
                          relation.to
                        )
                      "
                      [disabled]="
                        (connected$ | ngrxPush) === false ||
                        (relation | bdItemChanging)
                      "
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>

                <div
                  class="w-2.5 h-2.5 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-2 left-2"
                >
                  <div class="w-full h-px bg-gray-600 rotate-45"></div>
                </div>

                <div
                  class="w-2.5 h-2.5 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-2 right-2"
                >
                  <div class="w-full h-px bg-gray-600"></div>
                </div>

                <div
                  class="w-2.5 h-2.5 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute bottom-2 left-2"
                >
                  <div class="w-full h-px bg-gray-600  rotate-90"></div>
                </div>

                <div
                  class="w-2.5 h-2.5 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute bottom-2 right-2"
                >
                  <div class="w-full h-px bg-gray-600  -rotate-12"></div>
                </div>
              </div>
            </div> -->
          </section>
        </mat-card>
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
  ],
})
export class ViewInstructionDocumentsComponent implements OnInit {
  @HostBinding('class') class = 'block p-8 pt-5 h-full';
  instructionBody: string | null = null;
  readonly connected$ = this._walletStore.connected$;
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
    private readonly _walletStore: WalletStore,
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _instructionAccountApiService: InstructionAccountApiService,
    private readonly _viewInstructionDocumentsStore: ViewInstructionDocumentsStore,
    private readonly _viewInstructionDocumentsAccountsStore: ViewInstructionDocumentsAccountsStore,
    private readonly _viewInstructionDocumentsCollectionsStore: ViewInstructionDocumentsCollectionsStore,
    private readonly _viewInstructionDocumentsPayersReferencesStore: ViewInstructionDocumentsPayersReferencesStore,
    private readonly _viewInstructionDocumentsCollectionsReferencesStore: ViewInstructionDocumentsCollectionsReferencesStore,
    private readonly _viewInstructionDocumentsClosesReferencesStore: ViewInstructionDocumentsClosesReferencesStore
  ) {}

  ngOnInit() {
    this._viewInstructionDocumentsAccountsStore.setInstructionId(
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
    console.log(instructionAccountDto);

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

  /* onCreateInstructionRelation(
    workspaceId: string,
    applicationId: string,
    instructionId: string,
    fromAccountId: string,
    toAccountId: string
  ) {
    this._viewInstructionDocumentsStore.createInstructionRelation({
      workspaceId,
      applicationId,
      instructionId,
      fromAccountId,
      toAccountId,
    });
  }

  onDeleteInstructionRelation(
    workspaceId: string,
    instructionId: string,
    fromAccountId: string,
    toAccountId: string
  ) {
    this._viewInstructionDocumentsStore.deleteInstructionRelation({
      workspaceId,
      instructionId,
      fromAccountId,
      toAccountId,
    });
  } */
}
