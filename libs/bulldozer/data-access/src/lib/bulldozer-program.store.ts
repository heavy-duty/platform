import { Injectable } from '@angular/core';
import {
  findInstructionRelationAddress,
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
  getDeleteInstructionArgumentTransaction,
  getDeleteInstructionRelationTransaction,
  getDeleteInstructionTransaction,
  getDeleteWorkspaceTransaction,
  getUpdateApplicationTransaction,
  getUpdateCollectionAttributeTransaction,
  getUpdateCollectionTransaction,
  getUpdateInstructionAccountTransaction,
  getUpdateInstructionBodyTransaction,
  getUpdateInstructionRelationTransaction,
  getUpdateInstructionTransaction,
  getUpdateWorkspaceTransaction,
} from '@heavy-duty/bulldozer-devkit';
import {
  CollectionAttributeDto,
  InstructionAccountDto,
  InstructionAccountExtras,
  InstructionArgumentDto,
} from '@heavy-duty/bulldozer/application/utils/types';
import { ProgramStore } from '@heavy-duty/ng-anchor';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { Program } from '@project-serum/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import {
  combineLatest,
  concatMap,
  defer,
  from,
  map,
  of,
  take,
  tap,
  withLatestFrom,
} from 'rxjs';
import {
  ApplicationParser,
  CollectionAttributeParser,
  CollectionParser,
  InstructionAccountParser,
  InstructionArgumentParser,
  InstructionParser,
  InstructionRelationParser,
  RawApplication,
  RawCollection,
  RawCollectionAttribute,
  RawInstruction,
  RawInstructionAccount,
  RawInstructionArgument,
  RawInstructionRelation,
  RawWorkspace,
  WorkspaceParser,
} from './utils';

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
  readonly reader$ = this.select(({ reader }) => reader);
  readonly writer$ = this.select(({ writer }) => writer);

  get context() {
    return of(null).pipe(
      concatMap(() =>
        of(null).pipe(
          withLatestFrom(
            this.writer$.pipe(isNotNullOrUndefined),
            this._connectionStore.connection$.pipe(isNotNullOrUndefined),
            this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
            (_, program, connection, authority) => ({
              program,
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
    private readonly _walletStore: WalletStore,
    private readonly _programStore: ProgramStore
  ) {
    super(initialState);
  }

  loadReader = this.effect(() =>
    this._programStore
      .getReader('bulldozer')
      .pipe(tap((reader) => this.patchState({ reader })))
  );

  loadWriter = this.effect(() =>
    this._programStore
      .getWriter('bulldozer')
      .pipe(tap((writer) => this.patchState({ writer })))
  );

  getWorkspaces() {
    return this.context.pipe(
      concatMap(({ program, authority }) =>
        from(
          defer(() =>
            program.account.workspace.all([
              { memcmp: { bytes: authority.toBase58(), offset: 8 } },
            ])
          )
        ).pipe(
          map((programAccounts) =>
            programAccounts.map(({ publicKey, account }) =>
              WorkspaceParser(publicKey, account as RawWorkspace)
            )
          )
        )
      )
    );
  }

  getWorkspace(workspaceId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() => reader.account.workspace.fetchNullable(workspaceId))
        ).pipe(
          map(
            (account) =>
              account &&
              WorkspaceParser(
                new PublicKey(workspaceId),
                account as RawWorkspace
              )
          )
        )
      )
    );
  }

  createWorkspace(workspaceName: string) {
    const workspaceKeypair = new Keypair();

    return this.context.pipe(
      concatMap(({ program, connection, authority }) =>
        getCreateWorkspaceTransaction(
          connection,
          authority,
          program,
          workspaceKeypair,
          workspaceName
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection, {
                signers: [workspaceKeypair],
              })
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
          )
        )
      )
    );
  }

  updateWorkspace(workspaceId: string, workspaceName: string) {
    return this.context.pipe(
      concatMap(({ program, connection, authority }) =>
        getUpdateWorkspaceTransaction(
          connection,
          authority,
          program,
          new PublicKey(workspaceId),
          workspaceName
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
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
      concatMap(({ program, connection, authority }) =>
        getDeleteWorkspaceTransaction(
          connection,
          authority,
          program,
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
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
          )
        )
      )
    );
  }

  getApplications(workspaceId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() =>
            reader.account.application.all([
              { memcmp: { bytes: workspaceId, offset: 40 } },
            ])
          )
        ).pipe(
          map((programAccounts) =>
            programAccounts.map(({ publicKey, account }) =>
              ApplicationParser(publicKey, account as RawApplication)
            )
          )
        )
      )
    );
  }

  getApplication(applicationId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() => reader.account.application.fetchNullable(applicationId))
        ).pipe(
          map(
            (account) =>
              account &&
              ApplicationParser(
                new PublicKey(applicationId),
                account as RawApplication
              )
          )
        )
      )
    );
  }

  createApplication(workspaceId: string, applicationName: string) {
    const applicationKeypair = new Keypair();

    return this.context.pipe(
      concatMap(({ program, connection, authority }) =>
        getCreateApplicationTransaction(
          connection,
          authority,
          program,
          new PublicKey(workspaceId),
          applicationKeypair,
          applicationName
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection, {
                signers: [applicationKeypair],
              })
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
          )
        )
      )
    );
  }

  updateApplication(applicationId: string, applicationName: string) {
    return this.context.pipe(
      concatMap(({ program, connection, authority }) =>
        getUpdateApplicationTransaction(
          connection,
          authority,
          program,
          new PublicKey(applicationId),
          applicationName
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
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
      concatMap(({ program, connection, authority }) =>
        getDeleteApplicationTransaction(
          connection,
          authority,
          program,
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
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
          )
        )
      )
    );
  }

  getCollections(workspaceId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() =>
            reader.account.collection.all([
              { memcmp: { bytes: workspaceId, offset: 40 } },
            ])
          )
        ).pipe(
          map((programAccounts) =>
            programAccounts.map(({ publicKey, account }) =>
              CollectionParser(publicKey, account as RawCollection)
            )
          )
        )
      )
    );
  }

  getCollection(collectionId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() => reader.account.collection.fetchNullable(collectionId))
        ).pipe(
          map(
            (account) =>
              account &&
              CollectionParser(
                new PublicKey(collectionId),
                account as RawCollection
              )
          )
        )
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
      concatMap(({ program, connection, authority }) =>
        getCreateCollectionTransaction(
          connection,
          authority,
          program,
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
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
          )
        )
      )
    );
  }

  updateCollection(collectionId: string, collectionName: string) {
    return this.context.pipe(
      concatMap(({ program, connection, authority }) =>
        getUpdateCollectionTransaction(
          connection,
          authority,
          program,
          new PublicKey(collectionId),
          collectionName
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
          )
        )
      )
    );
  }

  deleteCollection(collectionId: string, collectionAttributeIds: string[]) {
    return this.context.pipe(
      concatMap(({ program, connection, authority }) =>
        getDeleteCollectionTransaction(
          connection,
          authority,
          program,
          new PublicKey(collectionId),
          collectionAttributeIds.map(
            (collectionAttributeId) => new PublicKey(collectionAttributeId)
          )
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
          )
        )
      )
    );
  }

  getCollectionAttributes(workspaceId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() =>
            reader.account.collectionAttribute.all([
              { memcmp: { bytes: workspaceId, offset: 40 } },
            ])
          )
        ).pipe(
          map((programAccounts) =>
            programAccounts.map(({ publicKey, account }) =>
              CollectionAttributeParser(
                publicKey,
                account as RawCollectionAttribute
              )
            )
          )
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
      concatMap(({ program, connection, authority }) =>
        getCreateCollectionAttributeTransaction(
          connection,
          authority,
          program,
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
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
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
      concatMap(({ program, connection, authority }) =>
        getUpdateCollectionAttributeTransaction(
          connection,
          authority,
          program,
          new PublicKey(collectionAttributeId),
          collectionAttributeDto
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
          )
        )
      )
    );
  }

  deleteCollectionAttribute(collectionAttributeId: string) {
    return this.context.pipe(
      concatMap(({ program, connection, authority }) =>
        getDeleteCollectionAttributeTransaction(
          connection,
          authority,
          program,
          new PublicKey(collectionAttributeId)
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
          )
        )
      )
    );
  }

  getInstructions(workspaceId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() =>
            reader.account.instruction.all([
              { memcmp: { bytes: workspaceId, offset: 40 } },
            ])
          )
        ).pipe(
          map((programAccounts) =>
            programAccounts.map(({ publicKey, account }) =>
              InstructionParser(publicKey, account as RawInstruction)
            )
          )
        )
      )
    );
  }

  getInstruction(instructionId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() => reader.account.instruction.fetchNullable(instructionId))
        ).pipe(
          map(
            (account) =>
              account &&
              InstructionParser(
                new PublicKey(instructionId),
                account as RawInstruction
              )
          )
        )
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
      concatMap(({ program, connection, authority }) =>
        getCreateInstructionTransaction(
          connection,
          authority,
          program,
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
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
          )
        )
      )
    );
  }

  updateInstruction(instructionId: string, instructionName: string) {
    return this.context.pipe(
      concatMap(({ program, connection, authority }) =>
        getUpdateInstructionTransaction(
          connection,
          authority,
          program,
          new PublicKey(instructionId),
          instructionName
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
          )
        )
      )
    );
  }

  updateInstructionBody(instructionId: string, instructionBody: string) {
    return this.context.pipe(
      concatMap(({ program, connection, authority }) =>
        getUpdateInstructionBodyTransaction(
          connection,
          authority,
          program,
          new PublicKey(instructionId),
          instructionBody
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
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
      concatMap(({ program, connection, authority }) =>
        getDeleteInstructionTransaction(
          connection,
          authority,
          program,
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
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
          )
        )
      )
    );
  }

  getInstructionAccounts(instructionId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() =>
            reader.account.instructionAccount.all([
              { memcmp: { bytes: instructionId, offset: 104 } },
            ])
          )
        ).pipe(
          map((programAccounts) =>
            programAccounts.map(({ publicKey, account }) =>
              InstructionAccountParser(
                publicKey,
                account as RawInstructionAccount
              )
            )
          )
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
      concatMap(({ program, connection, authority }) =>
        getCreateInstructionAccountTransaction(
          connection,
          authority,
          program,
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
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
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
      concatMap(({ program, connection, authority }) =>
        getUpdateInstructionAccountTransaction(
          connection,
          authority,
          program,
          new PublicKey(instructionAccountId),
          instructionAccountDto,
          instructionAccountExtras
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
          )
        )
      )
    );
  }

  deleteInstructionAccount(accountId: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.deleteInstructionAccount({
              accounts: {
                authority: walletPublicKey,
                account: new PublicKey(accountId),
              },
            })
          )
        )
      )
    );
  }

  getInstructionArguments(instructionId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() =>
            reader.account.instructionArgument.all([
              { memcmp: { bytes: instructionId, offset: 104 } },
            ])
          )
        ).pipe(
          map((programAccounts) =>
            programAccounts.map(({ publicKey, account }) =>
              InstructionArgumentParser(
                publicKey,
                account as RawInstructionArgument
              )
            )
          )
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
      concatMap(({ program, connection, authority }) =>
        getCreateInstructionArgumentTransaction(
          connection,
          authority,
          program,
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
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
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
      concatMap(({ program, connection, authority }) =>
        getUpdateCollectionAttributeTransaction(
          connection,
          authority,
          program,
          new PublicKey(instructionArgumentId),
          instructionArgumentDto
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
          )
        )
      )
    );
  }

  deleteInstructionArgument(instructionArgumentId: string) {
    return this.context.pipe(
      concatMap(({ program, connection, authority }) =>
        getDeleteInstructionArgumentTransaction(
          connection,
          authority,
          program,
          new PublicKey(instructionArgumentId)
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
          )
        )
      )
    );
  }

  getInstructionRelations(instructionId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() =>
            reader.account.instructionRelation.all([
              { memcmp: { bytes: instructionId, offset: 104 } },
            ])
          )
        ).pipe(
          map((programAccounts) =>
            programAccounts.map(({ publicKey, account }) =>
              InstructionRelationParser(
                publicKey,
                account as RawInstructionRelation
              )
            )
          )
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
      concatMap(({ program, connection, authority }) =>
        findInstructionRelationAddress(
          new PublicKey(fromId),
          new PublicKey(toId)
        ).pipe(
          concatMap(([relationPublicKey, relationBump]) =>
            getCreateInstructionRelationTransaction(
              connection,
              authority,
              program,
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
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
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
      concatMap(({ program, connection, authority }) =>
        getUpdateInstructionRelationTransaction(
          connection,
          authority,
          program,
          new PublicKey(instructionRelationId),
          new PublicKey(fromId),
          new PublicKey(toId)
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
          )
        )
      )
    );
  }

  deleteInstructionRelation(instructionRelationId: string) {
    return this.context.pipe(
      concatMap(({ program, connection, authority }) =>
        getDeleteInstructionRelationTransaction(
          connection,
          authority,
          program,
          new PublicKey(instructionRelationId)
        ).pipe(
          concatMap((transaction) =>
            this._walletStore
              .sendTransaction(transaction, connection)
              .pipe(
                concatMap((signature) =>
                  from(defer(() => connection.confirmTransaction(signature)))
                )
              )
          )
        )
      )
    );
  }
}
