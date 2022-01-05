import { Injectable } from '@angular/core';
import {
  Collection,
  CollectionAttribute,
  CollectionAttributeDto,
  Document,
  findInstructionRelationAddress,
  getApplication,
  getApplicationsByWorkspace,
  getCollection,
  getCollectionAttributesByCollection,
  getCollectionsByApplication,
  getCreateApplicationTransaction,
  getCreateCollectionAttributeTransaction,
  getCreateCollectionTransaction,
  getCreateInstructionAccountTransaction,
  getCreateInstructionArgumentTransaction,
  getCreateInstructionRelationTransaction,
  getCreateInstructionTransaction,
  getCreateWorkspaceTransaction,
  getDeleteApplicationTransaction,
  getDeleteCollectionAttributeTransaction,
  getDeleteCollectionTransaction,
  getDeleteInstructionAccountTransaction,
  getDeleteInstructionArgumentTransaction,
  getDeleteInstructionRelationTransaction,
  getDeleteInstructionTransaction,
  getDeleteWorkspaceTransaction,
  getInstruction,
  getInstructionAccountsByInstruction,
  getInstructionArgumentsByInstruction,
  getInstructionRelationsByInstruction,
  getInstructionsByApplication,
  getUpdateApplicationTransaction,
  getUpdateCollectionAttributeTransaction,
  getUpdateCollectionTransaction,
  getUpdateInstructionAccountTransaction,
  getUpdateInstructionArgumentTransaction,
  getUpdateInstructionBodyTransaction,
  getUpdateInstructionRelationTransaction,
  getUpdateInstructionTransaction,
  getUpdateWorkspaceTransaction,
  getWorkspace,
  getWorkspacesByAuthority,
  Instruction,
  InstructionAccount,
  InstructionAccountDto,
  InstructionArgument,
  InstructionArgumentDto,
  InstructionRelation,
  onApplicationByWorkspaceChanges,
  onApplicationUpdated,
  onCollectionAttributeByCollectionChanges,
  onCollectionAttributeUpdated,
  onCollectionByApplicationChanges,
  onCollectionUpdated,
  onInstructionAccountByInstructionChanges,
  onInstructionAccountUpdated,
  onInstructionArgumentByInstructionChanges,
  onInstructionArgumentUpdated,
  onInstructionByApplicationChanges,
  onInstructionRelationByInstructionChanges,
  onInstructionRelationUpdated,
  onInstructionUpdated,
  onWorkspaceByAuthorityChanges,
  onWorkspaceUpdated,
  parseBulldozerError,
  Workspace,
} from '@heavy-duty/bulldozer-devkit';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { Program } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import {
  catchError,
  combineLatest,
  concatMap,
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
        getWorkspacesByAuthority(connection, authority)
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
        getCreateWorkspaceTransaction(
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
        getUpdateWorkspaceTransaction(
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
        getDeleteWorkspaceTransaction(
          connection,
          authority,
          new PublicKey(workspaceId)
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  onWorkspaceByAuthorityChanges() {
    return combineLatest([
      this._connectionStore.connection$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      concatMap(([connection, walletPublicKey]) =>
        onWorkspaceByAuthorityChanges(connection, walletPublicKey).pipe(
          tap(() => this._events.next(new WorkspaceCreated()))
        )
      )
    );
  }

  onWorkspaceUpdated(workspaceId: string) {
    return this._connectionStore.connection$.pipe(
      isNotNullOrUndefined,
      concatMap((connection) =>
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

  getApplicationsByWorkspace(workspaceId: string) {
    return this.context.pipe(
      concatMap(({ connection }) =>
        getApplicationsByWorkspace(connection, new PublicKey(workspaceId))
      )
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
        getCreateApplicationTransaction(
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
        getUpdateApplicationTransaction(
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
        getDeleteApplicationTransaction(
          connection,
          authority,
          new PublicKey(workspaceId),
          new PublicKey(applicationId)
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  onApplicationByWorkspaceChanges(workspaceId: string) {
    return this._connectionStore.connection$.pipe(
      isNotNullOrUndefined,
      concatMap((connection) =>
        onApplicationByWorkspaceChanges(
          connection,
          new PublicKey(workspaceId)
        ).pipe(tap(() => this._events.next(new ApplicationCreated())))
      )
    );
  }

  onApplicationUpdated(applicationId: string) {
    return this._connectionStore.connection$.pipe(
      isNotNullOrUndefined,
      concatMap((connection) =>
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

  getCollectionsByApplication(
    applicationId: string
  ): Observable<Document<Collection>[]> {
    return this.context.pipe(
      concatMap(({ connection }) =>
        getCollectionsByApplication(connection, new PublicKey(applicationId))
      )
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
        getCreateCollectionTransaction(
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
        getUpdateCollectionTransaction(
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
        getDeleteCollectionTransaction(
          connection,
          authority,
          new PublicKey(applicationId),
          new PublicKey(collectionId)
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  onCollectionByApplicationChanges(applicationId: string) {
    return this._connectionStore.connection$.pipe(
      isNotNullOrUndefined,
      concatMap((connection) =>
        onCollectionByApplicationChanges(
          connection,
          new PublicKey(applicationId)
        ).pipe(tap(() => this._events.next(new CollectionCreated())))
      )
    );
  }

  onCollectionUpdated(collectionId: string) {
    return this._connectionStore.connection$.pipe(
      isNotNullOrUndefined,
      concatMap((connection) =>
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

  getCollectionAttributesByCollection(
    applicationId: string
  ): Observable<Document<CollectionAttribute>[]> {
    return this.context.pipe(
      concatMap(({ connection }) =>
        getCollectionAttributesByCollection(
          connection,
          new PublicKey(applicationId)
        )
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
        getCreateCollectionAttributeTransaction(
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
        getUpdateCollectionAttributeTransaction(
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
        getDeleteCollectionAttributeTransaction(
          connection,
          authority,
          new PublicKey(collectionId),
          new PublicKey(collectionAttributeId)
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  onCollectionAttributeByCollectionChanges(collectionId: string) {
    return this._connectionStore.connection$.pipe(
      isNotNullOrUndefined,
      concatMap((connection) =>
        onCollectionAttributeByCollectionChanges(
          connection,
          new PublicKey(collectionId)
        ).pipe(
          tap({
            next: () => this._events.next(new CollectionAttributeCreated()),
            complete: () => console.log('i should complete'),
          })
        )
      )
    );
  }

  onCollectionAttributeUpdated(collectionAttributeId: string) {
    return this._connectionStore.connection$.pipe(
      isNotNullOrUndefined,
      concatMap((connection) =>
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

  getInstructionsByApplication(
    applicationId: string
  ): Observable<Document<Instruction>[]> {
    return this.context.pipe(
      concatMap(({ connection }) =>
        getInstructionsByApplication(connection, new PublicKey(applicationId))
      )
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
        getCreateInstructionTransaction(
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
        getUpdateInstructionTransaction(
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
        getUpdateInstructionBodyTransaction(
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
        getDeleteInstructionTransaction(
          connection,
          authority,
          new PublicKey(applicationId),
          new PublicKey(instructionId)
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  onInstructionByApplicationChanges(applicationId: string) {
    return this._connectionStore.connection$.pipe(
      isNotNullOrUndefined,
      concatMap((connection) =>
        onInstructionByApplicationChanges(
          connection,
          new PublicKey(applicationId)
        ).pipe(tap(() => this._events.next(new InstructionCreated())))
      )
    );
  }

  onInstructionUpdated(instructionId: string) {
    return this._connectionStore.connection$.pipe(
      isNotNullOrUndefined,
      concatMap((connection) =>
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

  getInstructionAccountsByInstruction(
    instructionId: string
  ): Observable<Document<InstructionAccount>[]> {
    return this.context.pipe(
      concatMap(({ connection }) =>
        getInstructionAccountsByInstruction(
          connection,
          new PublicKey(instructionId)
        )
      )
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
        getCreateInstructionAccountTransaction(
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
        getUpdateInstructionAccountTransaction(
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
        getDeleteInstructionAccountTransaction(
          connection,
          authority,
          new PublicKey(instructionId),
          new PublicKey(instructionAccountId)
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  onInstructionAccountByInstructionChanges(instructionId: string) {
    return this._connectionStore.connection$.pipe(
      isNotNullOrUndefined,
      concatMap((connection) =>
        onInstructionAccountByInstructionChanges(
          connection,
          new PublicKey(instructionId)
        ).pipe(tap(() => this._events.next(new InstructionAccountCreated())))
      )
    );
  }

  onInstructionAccountUpdated(instructionAccountId: string) {
    return this._connectionStore.connection$.pipe(
      isNotNullOrUndefined,
      concatMap((connection) =>
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

  getInstructionArgumentsByInstruction(
    instructionId: string
  ): Observable<Document<InstructionArgument>[]> {
    return this.context.pipe(
      concatMap(({ connection }) =>
        getInstructionArgumentsByInstruction(
          connection,
          new PublicKey(instructionId)
        )
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
        getCreateInstructionArgumentTransaction(
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
        getUpdateInstructionArgumentTransaction(
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
        getDeleteInstructionArgumentTransaction(
          connection,
          authority,
          new PublicKey(instructionId),
          new PublicKey(instructionArgumentId)
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  onInstructionArgumentByInstructionChanges(instructionId: string) {
    return this._connectionStore.connection$.pipe(
      isNotNullOrUndefined,
      concatMap((connection) =>
        onInstructionArgumentByInstructionChanges(
          connection,
          new PublicKey(instructionId)
        ).pipe(tap(() => this._events.next(new InstructionArgumentCreated())))
      )
    );
  }

  onInstructionArgumentUpdated(instructionArgumentId: string) {
    return this._connectionStore.connection$.pipe(
      isNotNullOrUndefined,
      concatMap((connection) =>
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

  getInstructionRelationsByInstruction(
    instructionId: string
  ): Observable<Document<InstructionRelation>[]> {
    return this.context.pipe(
      concatMap(({ connection }) =>
        getInstructionRelationsByInstruction(
          connection,
          new PublicKey(instructionId)
        )
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
            getCreateInstructionRelationTransaction(
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
        getUpdateInstructionRelationTransaction(
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
        getDeleteInstructionRelationTransaction(
          connection,
          authority,
          new PublicKey(fromId),
          new PublicKey(toId),
          new PublicKey(instructionRelationId)
        ).pipe(this._signSendAndConfirmTransactions(connection))
      )
    );
  }

  onInstructionRelationByInstructionChanges(instructionId: string) {
    return this._connectionStore.connection$.pipe(
      isNotNullOrUndefined,
      concatMap((connection) =>
        onInstructionRelationByInstructionChanges(
          connection,
          new PublicKey(instructionId)
        ).pipe(tap(() => this._events.next(new InstructionRelationCreated())))
      )
    );
  }

  onInstructionRelationUpdated(instructionRelationId: string) {
    return this._connectionStore.connection$.pipe(
      isNotNullOrUndefined,
      concatMap((connection) =>
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
