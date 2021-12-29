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
  getCollectionAttributesByWorkspace,
  getCollectionsByWorkspace,
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
  getInstructionAccountsByWorkspace,
  getInstructionArgumentsByWorkspace,
  getInstructionRelationsByWorkspace,
  getInstructionsByWorkspace,
  getUpdateApplicationTransaction,
  getUpdateCollectionAttributeTransaction,
  getUpdateCollectionTransaction,
  getUpdateInstructionAccountTransaction,
  getUpdateInstructionBodyTransaction,
  getUpdateInstructionRelationTransaction,
  getUpdateInstructionTransaction,
  getUpdateWorkspaceTransaction,
  getWorkspace,
  getWorkspacesByAuthority,
  Instruction,
  InstructionAccount,
  InstructionAccountDto,
  InstructionAccountExtras,
  InstructionArgument,
  InstructionArgumentDto,
  InstructionRelation,
  Workspace,
} from '@heavy-duty/bulldozer-devkit';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { Program } from '@project-serum/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import { concatMap, Observable, of, withLatestFrom } from 'rxjs';
import { confirmTransaction, isNotNullOrUndefined } from './operators';

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
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection, {
                signers: [workspaceKeypair],
              })
              .pipe(confirmTransaction(connection))
          )
        )
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
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(confirmTransaction(connection))
          )
        )
      )
    );
  }

  deleteWorkspace(
    workspaceId: string,
    workspaceApplicationIds: string[],
    workspaceApplicationCollectionIds: string[],
    workspaceApplicationCollectionAttributeIds: string[],
    workspaceApplicationInstructionIds: string[],
    workspaceApplicationInstructionArgumentIds: string[],
    workspaceApplicationInstructionAccountIds: string[],
    workspaceApplicationInstructionRelationIds: string[]
  ) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        getDeleteWorkspaceTransaction(
          connection,
          authority,
          new PublicKey(workspaceId),
          workspaceApplicationIds.map(
            (workspaceApplicationId) => new PublicKey(workspaceApplicationId)
          ),
          workspaceApplicationCollectionIds.map(
            (workspaceApplicationCollectionId) =>
              new PublicKey(workspaceApplicationCollectionId)
          ),
          workspaceApplicationCollectionAttributeIds.map(
            (workspaceApplicationCollectionAttributeId) =>
              new PublicKey(workspaceApplicationCollectionAttributeId)
          ),
          workspaceApplicationInstructionIds.map(
            (workspaceApplicationInstructionId) =>
              new PublicKey(workspaceApplicationInstructionId)
          ),
          workspaceApplicationInstructionArgumentIds.map(
            (workspaceApplicationInstructionArgumentId) =>
              new PublicKey(workspaceApplicationInstructionArgumentId)
          ),
          workspaceApplicationInstructionAccountIds.map(
            (workspaceApplicationInstructionAccountId) =>
              new PublicKey(workspaceApplicationInstructionAccountId)
          ),
          workspaceApplicationInstructionRelationIds.map(
            (workspaceApplicationInstructionRelationId) =>
              new PublicKey(workspaceApplicationInstructionRelationId)
          )
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(confirmTransaction(connection))
          )
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
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(confirmTransaction(connection))
          )
        )
      )
    );
  }

  deleteApplication(
    applicationId: string,
    applicationCollectionIds: string[],
    applicationCollectionAttributeIds: string[],
    applicationInstructionIds: string[],
    applicationInstructionArgumentIds: string[],
    applicationInstructionAccountIds: string[],
    applicationInstructionRelationIds: string[]
  ) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        getDeleteApplicationTransaction(
          connection,
          authority,
          new PublicKey(applicationId),
          applicationCollectionIds.map(
            (applicationCollectionId) => new PublicKey(applicationCollectionId)
          ),
          applicationCollectionAttributeIds.map(
            (applicationCollectionAttributeId) =>
              new PublicKey(applicationCollectionAttributeId)
          ),
          applicationInstructionIds.map(
            (applicationInstructionId) =>
              new PublicKey(applicationInstructionId)
          ),
          applicationInstructionArgumentIds.map(
            (applicationInstructionArgumentId) =>
              new PublicKey(applicationInstructionArgumentId)
          ),
          applicationInstructionAccountIds.map(
            (applicationInstructionAccountId) =>
              new PublicKey(applicationInstructionAccountId)
          ),
          applicationInstructionRelationIds.map(
            (applicationInstructionRelationId) =>
              new PublicKey(applicationInstructionRelationId)
          )
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(confirmTransaction(connection))
          )
        )
      )
    );
  }

  getCollectionsByWorkspace(
    workspaceId: string
  ): Observable<Document<Collection>[]> {
    return this.context.pipe(
      concatMap(({ connection }) =>
        getCollectionsByWorkspace(connection, new PublicKey(workspaceId))
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
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(confirmTransaction(connection))
          )
        )
      )
    );
  }

  deleteCollection(collectionId: string, collectionAttributeIds: string[]) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        getDeleteCollectionTransaction(
          connection,
          authority,
          new PublicKey(collectionId),
          collectionAttributeIds.map(
            (collectionAttributeId) => new PublicKey(collectionAttributeId)
          )
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(confirmTransaction(connection))
          )
        )
      )
    );
  }

  getCollectionAttributesByWorkspace(
    workspaceId: string
  ): Observable<Document<CollectionAttribute>[]> {
    return this.context.pipe(
      concatMap(({ connection }) =>
        getCollectionAttributesByWorkspace(
          connection,
          new PublicKey(workspaceId)
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
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(confirmTransaction(connection))
          )
        )
      )
    );
  }

  deleteCollectionAttribute(collectionAttributeId: string) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        getDeleteCollectionAttributeTransaction(
          connection,
          authority,
          new PublicKey(collectionAttributeId)
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(confirmTransaction(connection))
          )
        )
      )
    );
  }

  getInstructionsByWorkspace(
    workspaceId: string
  ): Observable<Document<Instruction>[]> {
    return this.context.pipe(
      concatMap(({ connection }) =>
        getInstructionsByWorkspace(connection, new PublicKey(workspaceId))
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
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(confirmTransaction(connection))
          )
        )
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
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(confirmTransaction(connection))
          )
        )
      )
    );
  }

  deleteInstruction(
    instructionId: string,
    instructionArgumentIds: string[],
    instructionAccountIds: string[],
    instructionRelationIds: string[]
  ) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        getDeleteInstructionTransaction(
          connection,
          authority,
          new PublicKey(instructionId),
          instructionArgumentIds.map(
            (instructionArgumentId) => new PublicKey(instructionArgumentId)
          ),
          instructionAccountIds.map(
            (instructionAccountId) => new PublicKey(instructionAccountId)
          ),
          instructionRelationIds.map(
            (instructionRelationId) => new PublicKey(instructionRelationId)
          )
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(confirmTransaction(connection))
          )
        )
      )
    );
  }

  getInstructionAccountsByWorkspace(
    workspaceId: string
  ): Observable<Document<InstructionAccount>[]> {
    return this.context.pipe(
      concatMap(({ connection }) =>
        getInstructionAccountsByWorkspace(
          connection,
          new PublicKey(workspaceId)
        )
      )
    );
  }

  createInstructionAccount(
    workspaceId: string,
    applicationId: string,
    instructionId: string,
    instructionAccountDto: InstructionAccountDto,
    instructionAccountExtras: InstructionAccountExtras
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
          instructionAccountDto,
          instructionAccountExtras
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
    instructionAccountDto: InstructionAccountDto,
    instructionAccountExtras: InstructionAccountExtras
  ) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        getUpdateInstructionAccountTransaction(
          connection,
          authority,
          new PublicKey(instructionAccountId),
          instructionAccountDto,
          instructionAccountExtras
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(confirmTransaction(connection))
          )
        )
      )
    );
  }

  deleteInstructionAccount(instructionAccountId: string) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        getDeleteInstructionAccountTransaction(
          connection,
          authority,
          new PublicKey(instructionAccountId)
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(confirmTransaction(connection))
          )
        )
      )
    );
  }

  getInstructionArgumentsByWorkspace(
    workspaceId: string
  ): Observable<Document<InstructionArgument>[]> {
    return this.context.pipe(
      concatMap(({ connection }) =>
        getInstructionArgumentsByWorkspace(
          connection,
          new PublicKey(workspaceId)
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
        getUpdateCollectionAttributeTransaction(
          connection,
          authority,
          new PublicKey(instructionArgumentId),
          instructionArgumentDto
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(confirmTransaction(connection))
          )
        )
      )
    );
  }

  deleteInstructionArgument(instructionArgumentId: string) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        getDeleteInstructionArgumentTransaction(
          connection,
          authority,
          new PublicKey(instructionArgumentId)
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(confirmTransaction(connection))
          )
        )
      )
    );
  }

  getInstructionRelationsByWorkspace(
    workspaceId: string
  ): Observable<Document<InstructionRelation>[]> {
    return this.context.pipe(
      concatMap(({ connection }) =>
        getInstructionRelationsByWorkspace(
          connection,
          new PublicKey(workspaceId)
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
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(confirmTransaction(connection))
          )
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
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(confirmTransaction(connection))
          )
        )
      )
    );
  }

  deleteInstructionRelation(instructionRelationId: string) {
    return this.context.pipe(
      concatMap(({ connection, authority }) =>
        getDeleteInstructionRelationTransaction(
          connection,
          authority,
          new PublicKey(instructionRelationId)
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(confirmTransaction(connection))
          )
        )
      )
    );
  }
}
