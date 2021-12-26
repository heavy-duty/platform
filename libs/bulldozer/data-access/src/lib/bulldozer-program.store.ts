import { Injectable } from '@angular/core';
import {
  createApplication,
  createCollection,
  createCollectionAttribute,
  createInstruction,
  createInstructionAccount,
  createInstructionArgument,
  createInstructionRelation,
  createWorkspace,
  updateCollection,
  updateCollectionAttribute,
  updateInstruction,
  updateInstructionAccount,
  updateInstructionBody,
  updateInstructionRelation,
  updateWorkspace,
} from '@heavy-duty/bulldozer-devkit';
import {
  Application,
  CollectionAttributeDto,
  CollectionExtended,
  InstructionAccountDto,
  InstructionAccountExtras,
  InstructionArgumentDto,
  InstructionExtended,
  InstructionRelationExtended,
  Workspace,
} from '@heavy-duty/bulldozer/application/utils/types';
import { ProgramStore } from '@heavy-duty/ng-anchor';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import {
  combineLatest,
  concatMap,
  defer,
  forkJoin,
  from,
  map,
  mergeMap,
  Observable,
  of,
  take,
  tap,
  toArray,
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

  getWorkspaces(walletPublicKey: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() =>
            reader.account.workspace.all([
              { memcmp: { bytes: walletPublicKey, offset: 8 } },
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
    return this.context.pipe(
      concatMap(({ program, connection, authority }) =>
        createWorkspace(connection, authority, program, workspaceName).pipe(
          concatMap(({ transaction, signers }) =>
            this._walletStore
              .sendTransaction(transaction, connection, { signers })
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
        updateWorkspace(
          connection,
          authority,
          program,
          new PublicKey(workspaceId),
          workspaceName
        ).pipe(
          concatMap(({ transaction }) =>
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

  deleteWorkspace(workspaceId: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.deleteWorkspace({
              accounts: {
                workspace: new PublicKey(workspaceId),
                authority: walletPublicKey,
              },
            })
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
    return this.context.pipe(
      concatMap(({ program, connection, authority }) =>
        createApplication(
          connection,
          authority,
          program,
          new PublicKey(workspaceId),
          applicationName
        ).pipe(
          concatMap(({ transaction, signers }) =>
            this._walletStore
              .sendTransaction(transaction, connection, { signers })
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
        updateWorkspace(
          connection,
          authority,
          program,
          new PublicKey(applicationId),
          applicationName
        ).pipe(
          concatMap(({ transaction }) =>
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

  deleteApplication(applicationId: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.deleteApplication({
              accounts: {
                application: new PublicKey(applicationId),
                authority: walletPublicKey,
              },
            })
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
    return this.context.pipe(
      concatMap(({ program, connection, authority }) =>
        createCollection(
          connection,
          authority,
          program,
          new PublicKey(workspaceId),
          new PublicKey(applicationId),
          collectionName
        ).pipe(
          concatMap(({ transaction, signers }) =>
            this._walletStore
              .sendTransaction(transaction, connection, { signers })
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
        updateCollection(
          connection,
          authority,
          program,
          new PublicKey(collectionId),
          collectionName
        ).pipe(
          concatMap(({ transaction }) =>
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

  deleteCollection(collectionId: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.deleteCollection({
              accounts: {
                collection: new PublicKey(collectionId),
                authority: walletPublicKey,
              },
            })
          )
        )
      )
    );
  }

  getCollectionAttributes(collectionId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() =>
            reader.account.collectionAttribute.all([
              { memcmp: { bytes: collectionId, offset: 104 } },
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
    return this.context.pipe(
      concatMap(({ program, connection, authority }) =>
        createCollectionAttribute(
          connection,
          authority,
          program,
          new PublicKey(workspaceId),
          new PublicKey(applicationId),
          new PublicKey(collectionId),
          collectionAttributeDto
        ).pipe(
          concatMap(({ transaction, signers }) =>
            this._walletStore
              .sendTransaction(transaction, connection, { signers })
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
        updateCollectionAttribute(
          connection,
          authority,
          program,
          new PublicKey(collectionAttributeId),
          collectionAttributeDto
        ).pipe(
          concatMap(({ transaction }) =>
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

  deleteCollectionAttribute(attributeId: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.deleteCollectionAttribute({
              accounts: {
                attribute: new PublicKey(attributeId),
                authority: walletPublicKey,
              },
            })
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
    return this.context.pipe(
      concatMap(({ program, connection, authority }) =>
        createInstruction(
          connection,
          authority,
          program,
          new PublicKey(workspaceId),
          new PublicKey(applicationId),
          instructionName
        ).pipe(
          concatMap(({ transaction, signers }) =>
            this._walletStore
              .sendTransaction(transaction, connection, { signers })
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
        updateInstruction(
          connection,
          authority,
          program,
          new PublicKey(instructionId),
          instructionName
        ).pipe(
          concatMap(({ transaction }) =>
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
        updateInstructionBody(
          connection,
          authority,
          program,
          new PublicKey(instructionId),
          instructionBody
        ).pipe(
          concatMap(({ transaction }) =>
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

  deleteInstruction(instructionId: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.deleteInstruction({
              accounts: {
                instruction: new PublicKey(instructionId),
                authority: walletPublicKey,
              },
            })
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
    return this.context.pipe(
      concatMap(({ program, connection, authority }) =>
        createInstructionAccount(
          connection,
          authority,
          program,
          new PublicKey(workspaceId),
          new PublicKey(applicationId),
          new PublicKey(instructionId),
          instructionAccountDto,
          instructionAccountExtras
        ).pipe(
          concatMap(({ transaction, signers }) =>
            this._walletStore
              .sendTransaction(transaction, connection, { signers })
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
        updateInstructionAccount(
          connection,
          authority,
          program,
          new PublicKey(instructionAccountId),
          instructionAccountDto,
          instructionAccountExtras
        ).pipe(
          concatMap(({ transaction }) =>
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
    return this.context.pipe(
      concatMap(({ program, connection, authority }) =>
        createInstructionArgument(
          connection,
          authority,
          program,
          new PublicKey(workspaceId),
          new PublicKey(applicationId),
          new PublicKey(instructionId),
          instructionArgumentDto
        ).pipe(
          concatMap(({ transaction, signers }) =>
            this._walletStore
              .sendTransaction(transaction, connection, { signers })
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
        updateCollectionAttribute(
          connection,
          authority,
          program,
          new PublicKey(instructionArgumentId),
          instructionArgumentDto
        ).pipe(
          concatMap(({ transaction }) =>
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

  deleteInstructionArgument(argumentId: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.deleteInstructionArgument({
              accounts: {
                argument: new PublicKey(argumentId),
                authority: walletPublicKey,
              },
            })
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
        createInstructionRelation(
          connection,
          authority,
          program,
          new PublicKey(workspaceId),
          new PublicKey(applicationId),
          new PublicKey(instructionId),
          new PublicKey(fromId),
          new PublicKey(toId)
        ).pipe(
          concatMap(({ transaction, signers }) =>
            this._walletStore
              .sendTransaction(transaction, connection, { signers })
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
        updateInstructionRelation(
          connection,
          authority,
          program,
          new PublicKey(instructionRelationId),
          new PublicKey(fromId),
          new PublicKey(toId)
        ).pipe(
          concatMap(({ transaction }) =>
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

  deleteInstructionRelation(relationId: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.deleteInstructionRelation({
              accounts: {
                relation: new PublicKey(relationId),
                authority: walletPublicKey,
              },
            })
          )
        )
      )
    );
  }

  getExtendedInstructions(
    workspaceId: string
  ): Observable<InstructionExtended[]> {
    return combineLatest([
      this.getCollections(workspaceId),
      this.getInstructions(workspaceId),
    ]).pipe(
      concatMap(([collections, instructions]) =>
        from(instructions).pipe(
          concatMap((instruction) =>
            combineLatest([
              this.getInstructionArguments(instruction.id),
              this.getInstructionAccounts(instruction.id),
              this.getInstructionRelations(instruction.id),
            ]).pipe(
              map(
                ([
                  instructionArguments,
                  instructionAccounts,
                  instructionRelations,
                ]) => ({
                  ...instruction,
                  arguments: instructionArguments,
                  relations: instructionRelations,
                  accounts: instructionAccounts.map((account) => {
                    const relations = instructionRelations
                      .filter((relation) => relation.data.from === account.id)
                      .map((relation) => {
                        const toAccount =
                          instructionAccounts.find(
                            (instructionAccount) =>
                              instructionAccount.id === relation.data.to
                          ) || null;

                        return (
                          toAccount && {
                            ...relation,
                            data: {
                              ...relation.data,
                              from: account,
                              to: toAccount,
                            },
                          }
                        );
                      })
                      .filter(
                        (relation): relation is InstructionRelationExtended =>
                          relation !== null
                      );

                    const collection =
                      account.data.collection &&
                      collections.find(
                        ({ id }) => id === account.data.collection
                      );

                    const payer =
                      account.data.payer &&
                      instructionAccounts.find(
                        ({ id }) => id === account.data.payer
                      );

                    const close =
                      account.data.close &&
                      instructionAccounts.find(
                        ({ id }) => id === account.data.close
                      );

                    return {
                      ...account,
                      data: {
                        ...account.data,
                        collection: collection || null,
                        payer: payer || null,
                        close: close || null,
                        relations,
                      },
                    };
                  }),
                })
              )
            )
          ),
          toArray()
        )
      )
    );
  }

  getExtendedCollections(
    workspaceId: string
  ): Observable<CollectionExtended[]> {
    return this.getCollections(workspaceId).pipe(
      concatMap((collections) =>
        from(collections).pipe(
          mergeMap((collection) =>
            this.getCollectionAttributes(collection.id).pipe(
              map((attributes) => ({
                ...collection,
                attributes,
              }))
            )
          )
        )
      ),
      toArray()
    );
  }

  getDeleteCollectionTransactions(
    connection: Connection,
    walletPublicKey: PublicKey,
    collection: CollectionExtended
  ): Observable<Transaction[]> {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      from(defer(() => connection.getRecentBlockhash())),
    ]).pipe(
      take(1),
      map(([writer, { blockhash }]) => {
        const transaction = new Transaction({
          recentBlockhash: blockhash,
          feePayer: walletPublicKey,
        }).add(
          writer.instruction.deleteCollection({
            accounts: {
              collection: new PublicKey(collection.id),
              authority: walletPublicKey,
            },
          })
        );

        collection.attributes.forEach((attribute) => {
          transaction.add(
            writer.instruction.deleteCollectionAttribute({
              accounts: {
                attribute: new PublicKey(attribute.id),
                authority: walletPublicKey,
              },
            })
          );
        });

        return [transaction];
      })
    );
  }

  getDeleteInstructionTransactions(
    connection: Connection,
    walletPublicKey: PublicKey,
    instruction: InstructionExtended
  ): Observable<Transaction[]> {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      from(defer(() => connection.getRecentBlockhash())),
    ]).pipe(
      take(1),
      map(([writer, { blockhash }]) => {
        const transaction = new Transaction({
          recentBlockhash: blockhash,
          feePayer: walletPublicKey,
        }).add(
          writer.instruction.deleteInstruction({
            accounts: {
              instruction: new PublicKey(instruction.id),
              authority: walletPublicKey,
            },
          })
        );

        instruction.arguments.forEach((argument) => {
          transaction.add(
            writer.instruction.deleteInstructionArgument({
              accounts: {
                argument: new PublicKey(argument.id),
                authority: walletPublicKey,
              },
            })
          );
        });

        instruction.accounts.forEach((account) => {
          transaction.add(
            writer.instruction.deleteInstructionAccount({
              accounts: {
                account: new PublicKey(account.id),
                authority: walletPublicKey,
              },
            })
          );
        });

        instruction.relations.forEach((relation) => {
          transaction.add(
            writer.instruction.deleteInstructionRelation({
              accounts: {
                relation: new PublicKey(relation.id),
                authority: walletPublicKey,
              },
            })
          );
        });

        return [transaction];
      })
    );
  }

  getDeleteApplicationTransactions(
    connection: Connection,
    walletPublicKey: PublicKey,
    application: Application,
    collections: CollectionExtended[],
    instructions: InstructionExtended[]
  ): Observable<Transaction[]> {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined, take(1)),
      from(defer(() => connection.getRecentBlockhash())),
    ]).pipe(
      concatMap(([writer, { blockhash }]) => {
        const transaction = new Transaction({
          recentBlockhash: blockhash,
          feePayer: walletPublicKey,
        }).add(
          writer.instruction.deleteApplication({
            accounts: {
              application: new PublicKey(application.id),
              authority: walletPublicKey,
            },
          })
        );

        const transactions$ = [
          ...collections.map((collection) =>
            this.getDeleteCollectionTransactions(
              connection,
              walletPublicKey,
              collection
            )
          ),
          ...instructions.map((instruction) =>
            this.getDeleteInstructionTransactions(
              connection,
              walletPublicKey,
              instruction
            )
          ),
        ];

        if (transactions$.length === 0) {
          return of([transaction]);
        } else {
          return forkJoin(transactions$).pipe(
            map((transactionsList) =>
              transactionsList.reduce(
                (allTransactions, transactions) =>
                  allTransactions.concat(transactions),
                [transaction]
              )
            )
          );
        }
      })
    );
  }

  getDeleteWorkspaceTransactions(
    connection: Connection,
    walletPublicKey: PublicKey,
    workspace: Workspace,
    applications: Application[],
    collections: CollectionExtended[],
    instructions: InstructionExtended[]
  ): Observable<Transaction[]> {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined, take(1)),
      from(defer(() => connection.getRecentBlockhash())),
    ]).pipe(
      concatMap(([writer, { blockhash }]) => {
        const transaction = new Transaction({
          recentBlockhash: blockhash,
          feePayer: walletPublicKey,
        }).add(
          writer.instruction.deleteWorkspace({
            accounts: {
              workspace: new PublicKey(workspace.id),
              authority: walletPublicKey,
            },
          })
        );

        const transactions$ = applications.map((application) =>
          this.getDeleteApplicationTransactions(
            connection,
            walletPublicKey,
            application,
            collections.filter(
              ({ data }) => data.application === application.id
            ),
            instructions.filter(
              ({ data }) => data.application === application.id
            )
          )
        );

        if (transactions$.length === 0) {
          return of([transaction]);
        } else {
          return combineLatest(transactions$).pipe(
            map((transactionsList) =>
              transactionsList.reduce(
                (allTransactions, transactions) =>
                  allTransactions.concat(transactions),
                [transaction]
              )
            )
          );
        }
      })
    );
  }
}
