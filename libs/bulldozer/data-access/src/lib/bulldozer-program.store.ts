import { Injectable } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ProgramStore } from '@heavy-duty/ng-anchor';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ComponentStore } from '@ngrx/component-store';
import { Program } from '@project-serum/anchor';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { combineLatest, defer, from } from 'rxjs';
import { concatMap, map, switchMap, take, tap } from 'rxjs/operators';

import {
  ApplicationParser,
  CollectionAttributeParser,
  CollectionParser,
  InstructionAccountParser,
  InstructionArgumentParser,
  InstructionParser,
  InstructionRelationParser,
} from './utils';
import {
  CollectionAttributeDto,
  InstructionAccountDto,
  InstructionAccountExtras,
  InstructionArgumentDto,
} from '@heavy-duty/bulldozer/application/utils/types';

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

  constructor(
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

  getApplications() {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(defer(() => reader.account.application.all())).pipe(
          map((programAccounts) =>
            programAccounts.map(({ publicKey, account }) =>
              ApplicationParser(publicKey, account)
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
              ApplicationParser(new PublicKey(applicationId), account)
          )
        )
      )
    );
  }

  createApplication(applicationName: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) => {
        const application = Keypair.generate();

        return from(
          defer(() =>
            writer.rpc.createApplication(applicationName, {
              accounts: {
                application: application.publicKey,
                authority: walletPublicKey,
                systemProgram: SystemProgram.programId,
              },
              signers: [application],
            })
          )
        );
      })
    );
  }

  updateApplication(applicationId: string, applicationName: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.updateApplication(applicationName, {
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

  getCollections(applicationId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() =>
            reader.account.collection.all([
              { memcmp: { bytes: applicationId, offset: 40 } },
            ])
          )
        ).pipe(
          map((programAccounts) =>
            programAccounts.map(({ publicKey, account }) =>
              CollectionParser(publicKey, account)
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
              account && CollectionParser(new PublicKey(collectionId), account)
          )
        )
      )
    );
  }

  createCollection(applicationId: string, collectionName: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) => {
        const collection = Keypair.generate();

        return from(
          defer(() =>
            writer.rpc.createCollection(collectionName, {
              accounts: {
                collection: collection.publicKey,
                application: new PublicKey(applicationId),
                authority: walletPublicKey,
                systemProgram: SystemProgram.programId,
              },
              signers: [collection],
            })
          )
        );
      })
    );
  }

  updateCollection(collectionId: string, collectionName: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.updateCollection(collectionName, {
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
              { memcmp: { bytes: collectionId, offset: 72 } },
            ])
          )
        ).pipe(
          map((programAccounts) =>
            programAccounts.map(({ publicKey, account }) =>
              CollectionAttributeParser(publicKey, account)
            )
          )
        )
      )
    );
  }

  createCollectionAttribute(
    applicationId: string,
    collectionId: string,
    attribute: CollectionAttributeDto
  ) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) => {
        const attributeKeypair = Keypair.generate();

        return from(
          defer(() =>
            writer.rpc.createCollectionAttribute(attribute, {
              accounts: {
                attribute: attributeKeypair.publicKey,
                collection: new PublicKey(collectionId),
                application: new PublicKey(applicationId),
                authority: walletPublicKey,
                systemProgram: SystemProgram.programId,
              },
              signers: [attributeKeypair],
            })
          )
        );
      })
    );
  }

  updateCollectionAttribute(
    attributeId: string,
    attribute: CollectionAttributeDto
  ) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.updateCollectionAttribute(attribute, {
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

  getInstructions(applicationId: string) {
    return this.reader$.pipe(
      isNotNullOrUndefined,
      take(1),
      concatMap((reader) =>
        from(
          defer(() =>
            reader.account.instruction.all([
              { memcmp: { bytes: applicationId, offset: 40 } },
            ])
          )
        ).pipe(
          map((programAccounts) =>
            programAccounts.map(({ publicKey, account }) =>
              InstructionParser(publicKey, account)
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
              InstructionParser(new PublicKey(instructionId), account)
          )
        )
      )
    );
  }

  createInstruction(applicationId: string, instructionName: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) => {
        const instruction = Keypair.generate();

        return from(
          defer(() =>
            writer.rpc.createInstruction(instructionName, {
              accounts: {
                instruction: instruction.publicKey,
                application: new PublicKey(applicationId),
                authority: walletPublicKey,
                systemProgram: SystemProgram.programId,
              },
              signers: [instruction],
            })
          )
        );
      })
    );
  }

  updateInstruction(instructionId: string, instructionName: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.updateInstruction(instructionName, {
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

  updateInstructionBody(instructionId: string, instructionBody: string) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.updateInstructionBody(instructionBody, {
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
              { memcmp: { bytes: instructionId, offset: 72 } },
            ])
          )
        ).pipe(
          map((programAccounts) =>
            programAccounts.map(({ publicKey, account }) =>
              InstructionAccountParser(publicKey, account)
            )
          )
        )
      )
    );
  }

  createInstructionAccount(
    applicationId: string,
    instructionId: string,
    account: InstructionAccountDto,
    extras: InstructionAccountExtras
  ) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) => {
        const accountKeypair = Keypair.generate();

        return from(
          defer(() =>
            writer.rpc.createInstructionAccount(account, {
              accounts: {
                authority: walletPublicKey,
                application: new PublicKey(applicationId),
                instruction: new PublicKey(instructionId),
                account: accountKeypair.publicKey,
                systemProgram: SystemProgram.programId,
              },
              signers: [accountKeypair],
              remainingAccounts: [
                extras.collection &&
                  account.kind === 0 && {
                    pubkey: new PublicKey(extras.collection),
                    isWritable: false,
                    isSigner: false,
                  },
                extras.payer &&
                  account.kind === 0 && {
                    pubkey: new PublicKey(extras.payer),
                    isWritable: false,
                    isSigner: false,
                  },
                extras.close &&
                  account.kind === 0 &&
                  account.modifier === 1 && {
                    pubkey: new PublicKey(extras.close),
                    isWritable: false,
                    isSigner: false,
                  },
              ].filter((account) => account),
            })
          )
        );
      })
    );
  }

  updateInstructionAccount(
    accountId: string,
    account: InstructionAccountDto,
    extras: InstructionAccountExtras
  ) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.updateInstructionAccount(account, {
              accounts: {
                authority: walletPublicKey,
                account: new PublicKey(accountId),
              },
              remainingAccounts: [
                extras.collection &&
                  account.kind === 0 && {
                    pubkey: new PublicKey(extras.collection),
                    isWritable: false,
                    isSigner: false,
                  },
                extras.payer &&
                  account.modifier === 0 && {
                    pubkey: new PublicKey(extras.payer),
                    isWritable: false,
                    isSigner: false,
                  },
                extras.close &&
                  account.modifier === 1 && {
                    pubkey: new PublicKey(extras.close),
                    isWritable: false,
                    isSigner: false,
                  },
              ].filter((account) => account),
            })
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
              { memcmp: { bytes: instructionId, offset: 72 } },
            ])
          )
        ).pipe(
          map((programAccounts) =>
            programAccounts.map(({ publicKey, account }) =>
              InstructionArgumentParser(publicKey, account)
            )
          )
        )
      )
    );
  }

  createInstructionArgument(
    applicationId: string,
    instructionId: string,
    argument: InstructionArgumentDto
  ) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) => {
        const argumentKeypair = Keypair.generate();

        return from(
          defer(() =>
            writer.rpc.createInstructionArgument(argument, {
              accounts: {
                argument: argumentKeypair.publicKey,
                instruction: new PublicKey(instructionId),
                application: new PublicKey(applicationId),
                authority: walletPublicKey,
                systemProgram: SystemProgram.programId,
              },
              signers: [argumentKeypair],
            })
          )
        );
      })
    );
  }

  updateInstructionArgument(
    argumentId: string,
    argument: InstructionArgumentDto
  ) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.updateInstructionArgument(argument, {
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
              { memcmp: { bytes: instructionId, offset: 72 } },
            ])
          )
        ).pipe(
          map((programAccounts) =>
            programAccounts.map(({ publicKey, account }) =>
              InstructionRelationParser(publicKey, account)
            )
          )
        )
      )
    );
  }

  createInstructionRelation(
    applicationId: string,
    instructionId: string,
    fromAccount: string,
    toAccount: string
  ) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) => {
        return from(
          defer(async () => {
            const [relationPublicKey, relationBump] =
              await PublicKey.findProgramAddress(
                [
                  Buffer.from('instruction_relation', 'utf8'),
                  new PublicKey(fromAccount).toBuffer(),
                  new PublicKey(toAccount).toBuffer(),
                ],
                writer.programId
              );

            return writer.rpc.createInstructionRelation(relationBump, {
              accounts: {
                relation: relationPublicKey,
                instruction: new PublicKey(instructionId),
                application: new PublicKey(applicationId),
                from: new PublicKey(fromAccount),
                to: new PublicKey(toAccount),
                authority: walletPublicKey,
                systemProgram: SystemProgram.programId,
              },
            });
          })
        );
      })
    );
  }

  updateInstructionRelation(
    relationId: string,
    fromAccount: string,
    toAccount: string
  ) {
    return combineLatest([
      this.writer$.pipe(isNotNullOrUndefined),
      this._walletStore.publicKey$.pipe(isNotNullOrUndefined),
    ]).pipe(
      take(1),
      concatMap(([writer, walletPublicKey]) =>
        from(
          defer(() =>
            writer.rpc.updateInstructionRelation({
              accounts: {
                relation: new PublicKey(relationId),
                from: new PublicKey(fromAccount),
                to: new PublicKey(toAccount),
                authority: walletPublicKey,
              },
            })
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

  getApplicationMetadata(applicationId: string) {
    const filters = [{ memcmp: { bytes: applicationId, offset: 40 } }];

    return this.reader$.pipe(
      isNotNullOrUndefined,
      switchMap((reader) =>
        combineLatest([
          this.getApplication(applicationId),
          this.getCollections(applicationId),
          from(
            defer(() => reader.account.collectionAttribute.all(filters))
          ).pipe(
            map((programAccounts) =>
              programAccounts.map(({ publicKey, account }) =>
                CollectionAttributeParser(publicKey, account)
              )
            )
          ),
          this.getInstructions(applicationId),
          from(
            defer(() => reader.account.instructionArgument.all(filters))
          ).pipe(
            map((programAccounts) =>
              programAccounts.map(({ publicKey, account }) =>
                InstructionArgumentParser(publicKey, account)
              )
            )
          ),
          from(
            defer(() => reader.account.instructionAccount.all(filters))
          ).pipe(
            map((programAccounts) =>
              programAccounts.map(({ publicKey, account }) =>
                InstructionAccountParser(publicKey, account)
              )
            )
          ),
        ])
      )
    );
  }
}
