import { Injectable } from '@angular/core';
import {
  ApplicationFilters,
  Collection,
  CollectionAttribute,
  CollectionAttributeDto,
  CollectionAttributeFilters,
  CollectionFilters,
  createCreateApplicationTransaction,
  createCreateCollectionAttributeTransaction,
  createCreateCollectionTransaction,
  createCreateInstructionAccountTransaction,
  createCreateInstructionArgumentTransaction,
  createCreateInstructionRelationTransaction,
  createCreateInstructionTransaction,
  createCreateWorkspaceTransaction,
  createDeleteApplicationTransaction,
  createDeleteCollectionAttributeTransaction,
  createDeleteCollectionTransaction,
  createDeleteInstructionAccountTransaction,
  createDeleteInstructionArgumentTransaction,
  createDeleteInstructionRelationTransaction,
  createDeleteInstructionTransaction,
  createDeleteWorkspaceTransaction,
  createUpdateApplicationTransaction,
  createUpdateCollectionAttributeTransaction,
  createUpdateCollectionTransaction,
  createUpdateInstructionAccountTransaction,
  createUpdateInstructionArgumentTransaction,
  createUpdateInstructionBodyTransaction,
  createUpdateInstructionRelationTransaction,
  createUpdateInstructionTransaction,
  createUpdateWorkspaceTransaction,
  Document,
  findInstructionRelationAddress,
  getApplication,
  getApplications,
  getCollection,
  getCollectionAttributes,
  getCollections,
  getInstruction,
  getInstructionAccounts,
  getInstructionArguments,
  getInstructionRelations,
  getInstructions,
  getWorkspace,
  getWorkspaces,
  Instruction,
  InstructionAccount,
  InstructionAccountDto,
  InstructionAccountFilters,
  InstructionArgument,
  InstructionArgumentDto,
  InstructionArgumentFilters,
  InstructionFilters,
  InstructionRelation,
  InstructionRelationFilters,
  onApplicationsChanges,
  onApplicationUpdated,
  onCollectionAttributesChanges,
  onCollectionAttributeUpdated,
  onCollectionsChanges,
  onCollectionUpdated,
  onInstructionAccountsChanges,
  onInstructionAccountUpdated,
  onInstructionArgumentsChanges,
  onInstructionArgumentUpdated,
  onInstructionRelationsChanges,
  onInstructionRelationUpdated,
  onInstructionsChanges,
  onInstructionUpdated,
  onWorkspacesChanges,
  onWorkspaceUpdated,
  parseBulldozerError,
  Workspace,
} from '@heavy-duty/bulldozer-devkit';
import {
  generateWorkspaceMetadata,
  generateWorkspaceZip,
} from '@heavy-duty/generator';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { Program } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import {
  catchError,
  concatMap,
  forkJoin,
  Observable,
  of,
  shareReplay,
  Subject,
  tap,
  throwError,
  withLatestFrom,
} from 'rxjs';
import {
  ApplicationCreated,
  ApplicationDeleted,
  ApplicationUpdated,
  BulldozerActions,
  CollectionAttributeCreated,
  CollectionAttributeDeleted,
  CollectionAttributeUpdated,
  CollectionCreated,
  CollectionDeleted,
  CollectionUpdated,
  InstructionAccountCreated,
  InstructionAccountDeleted,
  InstructionAccountUpdated,
  InstructionArgumentCreated,
  InstructionArgumentDeleted,
  InstructionArgumentUpdated,
  InstructionCreated,
  InstructionDeleted,
  InstructionRelationCreated,
  InstructionRelationDeleted,
  InstructionRelationUpdated,
  InstructionUpdated,
  WorkspaceCreated,
  WorkspaceDeleted,
  WorkspaceUpdated,
} from './actions';
import {
  confirmTransaction,
  isNotNullOrUndefined,
  sendAndConfirmTransactions,
} from './operators';

interface ViewModel {
  reader: Program | null;
  writer: Program | null;
}

const initialState = {
  reader: null,
  writer: null,
};

@Injectable()
export class BulldozerProgramStore extends ComponentStore<ViewModel> {
  private readonly _events = new Subject<BulldozerActions>();
  readonly events$ = this._events
    .asObservable()
    .pipe(shareReplay({ refCount: true, bufferSize: 1 }));

  get context() {
    return of(null).pipe(
      concatMap(() =>
        of(null).pipe(
          withLatestFrom(
            this._connectionStore.connection$.pipe(isNotNullOrUndefined),
            this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
            (_, connection, authority) => ({
              connection,
              authority,
            })
          )
        )
      )
    );
  }

  constructor(
    private readonly _connectionStore: ConnectionStore,
    private readonly _walletStore: WalletStore
  ) {
    super(initialState);
  }

  private _signSendAndConfirmTransactions(connection: Connection) {
    return (source: Observable<Transaction | Transaction[]>) =>
      source.pipe(
        concatMap((transactions) => {
          const signer: Observable<Transaction | Transaction[]> | undefined =
            Array.isArray(transactions)
              ? this._walletStore.signAllTransactions(transactions)
              : this._walletStore.signTransaction(transactions);

          if (!signer) {
            return throwError(() => 'Current wallet does not support signing.');
          }

          return signer.pipe(
            concatMap((transactions) =>
              sendAndConfirmTransactions(
                connection,
                Array.isArray(transactions) ? transactions : [transactions]
              )
            ),
            catchError((error) => throwError(() => parseBulldozerError(error)))
          );
        })
      );
  }

  getWorkspacesByAuthority(): Observable<Document<Workspace>[]> {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        getWorkspaces(connection, { authority: authority.toBase58() })
      )
    );
  }

  getWorkspace(workspaceId: string): Observable<Document<Workspace> | null> {
    return this.context.pipe(
      concatMap(({ connection }) =>
        getWorkspace(connection, new PublicKey(workspaceId))
      )
    );
  }

  createWorkspace(workspaceName: string) {
    const workspaceKeypair = new Keypair();

    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createCreateWorkspaceTransaction(
          connection,
          authority,
          workspaceKeypair,
          workspaceName
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  updateWorkspace(workspaceId: string, workspaceName: string) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createUpdateWorkspaceTransaction(
          connection,
          authority,
          new PublicKey(workspaceId),
          workspaceName
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  deleteWorkspace(workspaceId: string) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createDeleteWorkspaceTransaction(
          connection,
          authority,
          new PublicKey(workspaceId)
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  downloadWorkspace(workspaceId: string) {
    return this.context.pipe(
      concatMap(({ connection }) =>
        forkJoin([
          getWorkspace(connection, new PublicKey(workspaceId)),
          getApplications(connection, {
            workspace: workspaceId,
          }),
          forkJoin([
            getCollections(connection, { workspace: workspaceId }),
            getCollectionAttributes(connection, { workspace: workspaceId }),
          ]),
          forkJoin([
            getInstructions(connection, { workspace: workspaceId }),
            getInstructionAccounts(connection, { workspace: workspaceId }),
            getInstructionArguments(connection, { workspace: workspaceId }),
            getInstructionRelations(connection, { workspace: workspaceId }),
          ]),
        ]).pipe(
          tap(
            ([
              workspace,
              applications,
              [collections, collectionAttributes],
              [
                instructions,
                instructionAccounts,
                instructionArguments,
                instructionRelations,
              ],
            ]) =>
              workspace &&
              generateWorkspaceZip(
                workspace,
                generateWorkspaceMetadata(
                  applications,
                  collections,
                  collectionAttributes,
                  instructions,
                  instructionArguments,
                  instructionAccounts,
                  instructionRelations
                )
              )
          )
        )
      )
    );
  }

  onWorkspaceByAuthorityChanges() {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        onWorkspacesChanges(connection, {
          authority: authority.toBase58(),
        }).pipe(tap(() => this._events.next(new WorkspaceCreated())))
      )
    );
  }

  onWorkspaceUpdated(workspaceId: string) {
    return this.context.pipe(
      concatMap(({ connection }) =>
        onWorkspaceUpdated(connection, new PublicKey(workspaceId)).pipe(
          tap((changes) => {
            if (changes) {
              this._events.next(new WorkspaceUpdated(changes));
            } else {
              this._events.next(new WorkspaceDeleted(workspaceId));
            }
          })
        )
      )
    );
  }

  getApplications(filters: ApplicationFilters = {}) {
    return this.context.pipe(
      concatMap(({ connection }) => getApplications(connection, { ...filters }))
    );
  }

  getApplication(applicationId: string) {
    return this.context.pipe(
      concatMap(({ connection }) =>
        getApplication(connection, new PublicKey(applicationId))
      )
    );
  }

  createApplication(workspaceId: string, applicationName: string) {
    const applicationKeypair = new Keypair();

    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createCreateApplicationTransaction(
          connection,
          authority,
          new PublicKey(workspaceId),
          applicationKeypair,
          applicationName
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection, {
                signers: [applicationKeypair],
              })
              .pipe(confirmTransaction(connection))
          )
        )
      )
    );
  }

  updateApplication(applicationId: string, applicationName: string) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createUpdateApplicationTransaction(
          connection,
          authority,
          new PublicKey(applicationId),
          applicationName
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  deleteApplication(workspaceId: string, applicationId: string) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createDeleteApplicationTransaction(
          connection,
          authority,
          new PublicKey(workspaceId),
          new PublicKey(applicationId)
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  onApplicationsChanges(filters: ApplicationFilters = {}) {
    return this.context.pipe(
      concatMap(({ connection }) =>
        onApplicationsChanges(connection, filters).pipe(
          tap(() => this._events.next(new ApplicationCreated()))
        )
      )
    );
  }

  onApplicationUpdated(applicationId: string) {
    return this.context.pipe(
      concatMap(({ connection }) =>
        onApplicationUpdated(connection, new PublicKey(applicationId)).pipe(
          tap((changes) => {
            if (changes) {
              this._events.next(new ApplicationUpdated(changes));
            } else {
              this._events.next(new ApplicationDeleted(applicationId));
            }
          })
        )
      )
    );
  }

  getCollections(
    filters: CollectionFilters = {}
  ): Observable<Document<Collection>[]> {
    return this.context.pipe(
      concatMap(({ connection }) => getCollections(connection, filters))
    );
  }

  getCollection(collectionId: string): Observable<Document<Collection> | null> {
    return this.context.pipe(
      concatMap(({ connection }) =>
        getCollection(connection, new PublicKey(collectionId))
      )
    );
  }

  createCollection(
    workspaceId: string,
    applicationId: string,
    collectionName: string
  ) {
    const collectionKeypair = new Keypair();

    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createCreateCollectionTransaction(
          connection,
          authority,
          new PublicKey(workspaceId),
          new PublicKey(applicationId),
          collectionKeypair,
          collectionName
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection, {
                signers: [collectionKeypair],
              })
              .pipe(confirmTransaction(connection))
          )
        )
      )
    );
  }

  updateCollection(collectionId: string, collectionName: string) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createUpdateCollectionTransaction(
          connection,
          authority,
          new PublicKey(collectionId),
          collectionName
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  deleteCollection(applicationId: string, collectionId: string) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createDeleteCollectionTransaction(
          connection,
          authority,
          new PublicKey(applicationId),
          new PublicKey(collectionId)
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  onCollectionsChanges(filters: CollectionFilters = {}) {
    return this.context.pipe(
      concatMap(({ connection }) =>
        onCollectionsChanges(connection, filters).pipe(
          tap(() => this._events.next(new CollectionCreated()))
        )
      )
    );
  }

  onCollectionUpdated(collectionId: string) {
    return this.context.pipe(
      concatMap(({ connection }) =>
        onCollectionUpdated(connection, new PublicKey(collectionId)).pipe(
          tap((changes) => {
            if (changes) {
              this._events.next(new CollectionUpdated(changes));
            } else {
              this._events.next(new CollectionDeleted(collectionId));
            }
          })
        )
      )
    );
  }

  getCollectionAttributes(
    filters: CollectionAttributeFilters
  ): Observable<Document<CollectionAttribute>[]> {
    return this.context.pipe(
      concatMap(({ connection }) =>
        getCollectionAttributes(connection, filters)
      )
    );
  }

  createCollectionAttribute(
    workspaceId: string,
    applicationId: string,
    collectionId: string,
    collectionAttributeDto: CollectionAttributeDto
  ) {
    const collectionAttributeKeypair = new Keypair();

    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createCreateCollectionAttributeTransaction(
          connection,
          authority,
          new PublicKey(workspaceId),
          new PublicKey(applicationId),
          new PublicKey(collectionId),
          collectionAttributeKeypair,
          collectionAttributeDto
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection, {
                signers: [collectionAttributeKeypair],
              })
              .pipe(confirmTransaction(connection))
          )
        )
      )
    );
  }

  updateCollectionAttribute(
    collectionAttributeId: string,
    collectionAttributeDto: CollectionAttributeDto
  ) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createUpdateCollectionAttributeTransaction(
          connection,
          authority,
          new PublicKey(collectionAttributeId),
          collectionAttributeDto
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  deleteCollectionAttribute(
    collectionId: string,
    collectionAttributeId: string
  ) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createDeleteCollectionAttributeTransaction(
          connection,
          authority,
          new PublicKey(collectionId),
          new PublicKey(collectionAttributeId)
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  onCollectionAttributesChanges(filters: CollectionAttributeFilters) {
    return this.context.pipe(
      concatMap(({ connection }) =>
        onCollectionAttributesChanges(connection, filters).pipe(
          tap(() => this._events.next(new CollectionAttributeCreated()))
        )
      )
    );
  }

  onCollectionAttributeUpdated(collectionAttributeId: string) {
    return this.context.pipe(
      concatMap(({ connection }) =>
        onCollectionAttributeUpdated(
          connection,
          new PublicKey(collectionAttributeId)
        ).pipe(
          tap((changes) => {
            if (changes) {
              this._events.next(new CollectionAttributeUpdated(changes));
            } else {
              this._events.next(
                new CollectionAttributeDeleted(collectionAttributeId)
              );
            }
          })
        )
      )
    );
  }

  getInstructions(
    filters: InstructionFilters
  ): Observable<Document<Instruction>[]> {
    return this.context.pipe(
      concatMap(({ connection }) => getInstructions(connection, filters))
    );
  }

  getInstruction(
    instructionId: string
  ): Observable<Document<Instruction> | null> {
    return this.context.pipe(
      concatMap(({ connection }) =>
        getInstruction(connection, new PublicKey(instructionId))
      )
    );
  }

  createInstruction(
    workspaceId: string,
    applicationId: string,
    instructionName: string
  ) {
    const instructionKeypair = new Keypair();

    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createCreateInstructionTransaction(
          connection,
          authority,
          new PublicKey(workspaceId),
          new PublicKey(applicationId),
          instructionKeypair,
          instructionName
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection, {
                signers: [instructionKeypair],
              })
              .pipe(confirmTransaction(connection))
          )
        )
      )
    );
  }

  updateInstruction(instructionId: string, instructionName: string) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createUpdateInstructionTransaction(
          connection,
          authority,
          new PublicKey(instructionId),
          instructionName
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  updateInstructionBody(instructionId: string, instructionBody: string) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createUpdateInstructionBodyTransaction(
          connection,
          authority,
          new PublicKey(instructionId),
          instructionBody
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  deleteInstruction(applicationId: string, instructionId: string) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createDeleteInstructionTransaction(
          connection,
          authority,
          new PublicKey(applicationId),
          new PublicKey(instructionId)
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  onInstructionsChanges(filters: InstructionFilters) {
    return this.context.pipe(
      concatMap(({ connection }) =>
        onInstructionsChanges(connection, filters).pipe(
          tap(() => this._events.next(new InstructionCreated()))
        )
      )
    );
  }

  onInstructionUpdated(instructionId: string) {
    return this.context.pipe(
      concatMap(({ connection }) =>
        onInstructionUpdated(connection, new PublicKey(instructionId)).pipe(
          tap((changes) => {
            if (changes) {
              this._events.next(new InstructionUpdated(changes));
            } else {
              this._events.next(new InstructionDeleted(instructionId));
            }
          })
        )
      )
    );
  }

  getInstructionAccounts(
    filters: InstructionAccountFilters
  ): Observable<Document<InstructionAccount>[]> {
    return this.context.pipe(
      concatMap(({ connection }) => getInstructionAccounts(connection, filters))
    );
  }

  createInstructionAccount(
    workspaceId: string,
    applicationId: string,
    instructionId: string,
    instructionAccountDto: InstructionAccountDto
  ) {
    const instructionAccountKeypair = new Keypair();

    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createCreateInstructionAccountTransaction(
          connection,
          authority,
          new PublicKey(workspaceId),
          new PublicKey(applicationId),
          new PublicKey(instructionId),
          instructionAccountKeypair,
          instructionAccountDto
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection, {
                signers: [instructionAccountKeypair],
              })
              .pipe(confirmTransaction(connection))
          )
        )
      )
    );
  }

  updateInstructionAccount(
    instructionAccountId: string,
    instructionAccountDto: InstructionAccountDto
  ) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createUpdateInstructionAccountTransaction(
          connection,
          authority,
          new PublicKey(instructionAccountId),
          instructionAccountDto
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  deleteInstructionAccount(
    instructionId: string,
    instructionAccountId: string
  ) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createDeleteInstructionAccountTransaction(
          connection,
          authority,
          new PublicKey(instructionId),
          new PublicKey(instructionAccountId)
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  onInstructionAccountsChanges(filters: InstructionAccountFilters) {
    return this.context.pipe(
      concatMap(({ connection }) =>
        onInstructionAccountsChanges(connection, filters).pipe(
          tap(() => this._events.next(new InstructionAccountCreated()))
        )
      )
    );
  }

  onInstructionAccountUpdated(instructionAccountId: string) {
    return this.context.pipe(
      concatMap(({ connection }) =>
        onInstructionAccountUpdated(
          connection,
          new PublicKey(instructionAccountId)
        ).pipe(
          tap((changes) => {
            if (changes) {
              this._events.next(new InstructionAccountUpdated(changes));
            } else {
              this._events.next(
                new InstructionAccountDeleted(instructionAccountId)
              );
            }
          })
        )
      )
    );
  }

  getInstructionArguments(
    filters: InstructionArgumentFilters
  ): Observable<Document<InstructionArgument>[]> {
    return this.context.pipe(
      concatMap(({ connection }) =>
        getInstructionArguments(connection, filters)
      )
    );
  }

  createInstructionArgument(
    workspaceId: string,
    applicationId: string,
    instructionId: string,
    instructionArgumentDto: InstructionArgumentDto
  ) {
    const instructionArgumentKeypair = new Keypair();

    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createCreateInstructionArgumentTransaction(
          connection,
          authority,
          new PublicKey(workspaceId),
          new PublicKey(applicationId),
          new PublicKey(instructionId),
          instructionArgumentKeypair,
          instructionArgumentDto
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection, {
                signers: [instructionArgumentKeypair],
              })
              .pipe(confirmTransaction(connection))
          )
        )
      )
    );
  }

  updateInstructionArgument(
    instructionArgumentId: string,
    instructionArgumentDto: InstructionArgumentDto
  ) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createUpdateInstructionArgumentTransaction(
          connection,
          authority,
          new PublicKey(instructionArgumentId),
          instructionArgumentDto
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  deleteInstructionArgument(
    instructionId: string,
    instructionArgumentId: string
  ) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createDeleteInstructionArgumentTransaction(
          connection,
          authority,
          new PublicKey(instructionId),
          new PublicKey(instructionArgumentId)
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  onInstructionArgumentsChanges(filters: InstructionArgumentFilters) {
    return this.context.pipe(
      concatMap(({ connection }) =>
        onInstructionArgumentsChanges(connection, filters).pipe(
          tap(() => this._events.next(new InstructionArgumentCreated()))
        )
      )
    );
  }

  onInstructionArgumentUpdated(instructionArgumentId: string) {
    return this.context.pipe(
      concatMap(({ connection }) =>
        onInstructionArgumentUpdated(
          connection,
          new PublicKey(instructionArgumentId)
        ).pipe(
          tap((changes) => {
            if (changes) {
              this._events.next(new InstructionArgumentUpdated(changes));
            } else {
              this._events.next(
                new InstructionArgumentDeleted(instructionArgumentId)
              );
            }
          })
        )
      )
    );
  }

  getInstructionRelations(
    filters: InstructionRelationFilters
  ): Observable<Document<InstructionRelation>[]> {
    return this.context.pipe(
      concatMap(({ connection }) =>
        getInstructionRelations(connection, filters)
      )
    );
  }

  createInstructionRelation(
    workspaceId: string,
    applicationId: string,
    instructionId: string,
    fromId: string,
    toId: string
  ) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        findInstructionRelationAddress(
          new PublicKey(fromId),
          new PublicKey(toId)
        ).pipe(
          concatMap(([relationPublicKey, relationBump]) =>
            createCreateInstructionRelationTransaction(
              connection,
              authority,
              new PublicKey(workspaceId),
              new PublicKey(applicationId),
              new PublicKey(instructionId),
              relationPublicKey,
              relationBump,
              new PublicKey(fromId),
              new PublicKey(toId)
            )
          ),
          this._signSendAndConfirmTransactions(connection)
        )
      )
    );
  }

  updateInstructionRelation(
    instructionRelationId: string,
    fromId: string,
    toId: string
  ) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createUpdateInstructionRelationTransaction(
          connection,
          authority,
          new PublicKey(instructionRelationId),
          new PublicKey(fromId),
          new PublicKey(toId)
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  deleteInstructionRelation(
    fromId: string,
    toId: string,
    instructionRelationId: string
  ) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        createDeleteInstructionRelationTransaction(
          connection,
          authority,
          new PublicKey(fromId),
          new PublicKey(toId),
          new PublicKey(instructionRelationId)
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  onInstructionRelationsChanges(filters: InstructionRelationFilters) {
    return this.context.pipe(
      concatMap(({ connection }) =>
        onInstructionRelationsChanges(connection, filters).pipe(
          tap(() => this._events.next(new InstructionRelationCreated()))
        )
      )
    );
  }

  onInstructionRelationUpdated(instructionRelationId: string) {
    return this.context.pipe(
      concatMap(({ connection }) =>
        onInstructionRelationUpdated(
          connection,
          new PublicKey(instructionRelationId)
        ).pipe(
          tap((changes) => {
            if (changes) {
              this._events.next(new InstructionRelationUpdated(changes));
            } else {
              this._events.next(
                new InstructionRelationDeleted(instructionRelationId)
              );
            }
          })
        )
      )
    );
  }
}
