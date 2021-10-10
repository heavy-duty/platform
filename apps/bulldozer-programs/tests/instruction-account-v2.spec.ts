import {
  ProgramError,
  Provider,
  setProvider,
  utils,
  workspace,
} from '@project-serum/anchor';
import { Keypair, SystemProgram } from '@solana/web3.js';
import { assert } from 'chai';

describe('instruction account', () => {
  setProvider(Provider.env());
  const program = workspace.Bulldozer;
  const instruction = Keypair.generate();
  const instructionName = 'create_document';
  const collection = Keypair.generate();
  const collectionName = 'things';
  const application = Keypair.generate();
  const applicationName = 'my-app';
  const anotherCollection = Keypair.generate();
  const anotherCollectionName = 'another-things';

  before(async () => {
    await program.rpc.createApplication(applicationName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [application],
    });
    await program.rpc.createCollection(collectionName, {
      accounts: {
        collection: collection.publicKey,
        application: application.publicKey,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [collection],
    });
    await program.rpc.createCollection(anotherCollectionName, {
      accounts: {
        collection: anotherCollection.publicKey,
        application: application.publicKey,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [anotherCollection],
    });
    await program.rpc.createInstruction(instructionName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [instruction],
    });
  });

  describe('basic account', () => {
    const instructionAccount = Keypair.generate();

    it('should fail when creating without collection', async () => {
      // arrange
      const instructionAccount = Keypair.generate();
      const instructionAccountName = 'data';
      const instructionAccountKind = 0;
      const instructionAccountModifier = 0;
      const instructionAccountSpace = null;
      const instructionAccountProgram = null;
      let error: ProgramError;
      // act
      try {
        await program.rpc.createInstructionAccount(
          instructionAccountName,
          instructionAccountKind,
          instructionAccountModifier,
          instructionAccountSpace,
          instructionAccountProgram,
          {
            accounts: {
              authority: program.provider.wallet.publicKey,
              application: application.publicKey,
              instruction: instruction.publicKey,
              account: instructionAccount.publicKey,
              systemProgram: SystemProgram.programId,
            },
            signers: [instructionAccount],
          }
        );
      } catch (err) {
        error = err;
      }
      // assert
      assert.equal(error.code, 305);
    });

    it('should create', async () => {
      // arrange
      const instructionAccountName = 'data';
      const instructionAccountKind = 0;
      const instructionAccountModifier = 0;
      const instructionAccountSpace = null;
      const instructionAccountProgram = null;
      // act
      await program.rpc.createInstructionAccount(
        instructionAccountName,
        instructionAccountKind,
        instructionAccountModifier,
        instructionAccountSpace,
        instructionAccountProgram,
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            account: instructionAccount.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [instructionAccount],
          remainingAccounts: [
            {
              pubkey: collection.publicKey,
              isWritable: false,
              isSigner: false,
            },
          ],
        }
      );
      // assert
      const account = await program.account.instructionAccount.fetch(
        instructionAccount.publicKey
      );
      assert.ok(account.authority.equals(program.provider.wallet.publicKey));
      assert.equal(
        utils.bytes.utf8.decode(account.name),
        instructionAccountName
      );
      assert.ok('basic' in account.kind);
      assert.equal(account.kind.basic.id, instructionAccountKind);
      assert.ok('none' in account.modifier);
      assert.equal(account.modifier.none.id, instructionAccountModifier);
      assert.ok(account.instruction.equals(instruction.publicKey));
      assert.ok(account.application.equals(application.publicKey));
      assert.ok(account.collection.equals(collection.publicKey));
      assert.equal(account.program, null);
      assert.equal(account.payer, null);
      assert.equal(account.close, null);
      assert.equal(account.space, null);
    });

    it('should remove collection when changing the kind', async () => {
      // arrange
      const instructionAccountName = 'data';
      const instructionAccountKind = 1;
      const instructionAccountModifier = 0;
      const instructionAccountSpace = null;
      const instructionAccountProgram = SystemProgram.programId;
      // act
      await program.rpc.updateInstructionAccount(
        instructionAccountName,
        instructionAccountKind,
        instructionAccountModifier,
        instructionAccountSpace,
        instructionAccountProgram,
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            account: instructionAccount.publicKey,
          },
        }
      );
      // assert
      const account = await program.account.instructionAccount.fetch(
        instructionAccount.publicKey
      );
      assert.ok('program' in account.kind);
      assert.equal(account.kind.program.id, instructionAccountKind);
      assert.ok(account.program.equals(SystemProgram.programId));
      assert.equal(account.collection, null);
    });

    it('should delete', async () => {
      // arrange
      const instructionAccount = Keypair.generate();
      const instructionAccountName = 'data';
      const instructionAccountKind = 2;
      const instructionAccountModifier = 0;
      const instructionAccountSpace = null;
      const instructionAccountProgram = null;
      // act
      await program.rpc.createInstructionAccount(
        instructionAccountName,
        instructionAccountKind,
        instructionAccountModifier,
        instructionAccountSpace,
        instructionAccountProgram,
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            account: instructionAccount.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [instructionAccount],
          remainingAccounts: [
            {
              pubkey: collection.publicKey,
              isWritable: false,
              isSigner: false,
            },
          ],
        }
      );
      await program.rpc.deleteInstructionAccount({
        accounts: {
          authority: program.provider.wallet.publicKey,
          account: instructionAccount.publicKey,
        },
      });
      // assert
      const account = await program.account.instructionAccount.fetchNullable(
        instructionAccount.publicKey
      );
      assert.equal(account, null);
    });

    describe('with init modifier', () => {
      const instructionAccount = Keypair.generate();
      const instructionPayerAccount = Keypair.generate();

      before(async () => {
        await program.rpc.createInstructionAccount('payer', 2, 0, null, null, {
          accounts: {
            authority: program.provider.wallet.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            account: instructionPayerAccount.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [instructionPayerAccount],
        });
      });

      it('should create', async () => {
        // arrange
        const instructionAccountName = 'data';
        const instructionAccountKind = 0;
        const instructionAccountModifier = 1;
        const instructionAccountSpace = 150;
        const instructionAccountProgram = null;
        // act
        await program.rpc.createInstructionAccount(
          instructionAccountName,
          instructionAccountKind,
          instructionAccountModifier,
          instructionAccountSpace,
          instructionAccountProgram,
          {
            accounts: {
              authority: program.provider.wallet.publicKey,
              application: application.publicKey,
              instruction: instruction.publicKey,
              account: instructionAccount.publicKey,
              systemProgram: SystemProgram.programId,
            },
            signers: [instructionAccount],
            remainingAccounts: [
              {
                pubkey: collection.publicKey,
                isWritable: false,
                isSigner: false,
              },
              {
                pubkey: instructionPayerAccount.publicKey,
                isWritable: false,
                isSigner: false,
              },
            ],
          }
        );
        // assert
        const account = await program.account.instructionAccount.fetch(
          instructionAccount.publicKey
        );
        assert.ok('init' in account.modifier);
        assert.equal(account.modifier.init.id, instructionAccountModifier);
        assert.ok(account.payer.equals(instructionPayerAccount.publicKey));
        assert.equal(account.space, 150);
      });

      it('should remove payer and space when changing the modifier', async () => {
        // arrange
        const instructionAccountName = 'data';
        const instructionAccountKind = 0;
        const instructionAccountModifier = 0;
        const instructionAccountSpace = 150;
        const instructionAccountProgram = null;
        // act
        await program.rpc.updateInstructionAccount(
          instructionAccountName,
          instructionAccountKind,
          instructionAccountModifier,
          instructionAccountSpace,
          instructionAccountProgram,
          {
            accounts: {
              authority: program.provider.wallet.publicKey,
              account: instructionAccount.publicKey,
            },
            remainingAccounts: [
              {
                pubkey: collection.publicKey,
                isWritable: false,
                isSigner: false,
              },
            ],
          }
        );
        // assert
        const account = await program.account.instructionAccount.fetch(
          instructionAccount.publicKey
        );
        assert.ok('none' in account.modifier);
        assert.equal(account.modifier.none.id, instructionAccountModifier);
        assert.equal(account.payer, null);
        assert.equal(account.space, null);
      });

      it('should fail when space is not provided', async () => {
        // arrange
        const instructionAccount = Keypair.generate();
        const instructionAccountName = 'data';
        const instructionAccountKind = 0;
        const instructionAccountModifier = 1;
        const instructionAccountSpace = null;
        const instructionAccountProgram = null;
        let error: ProgramError;
        // act
        try {
          await program.rpc.createInstructionAccount(
            instructionAccountName,
            instructionAccountKind,
            instructionAccountModifier,
            instructionAccountSpace,
            instructionAccountProgram,
            {
              accounts: {
                authority: program.provider.wallet.publicKey,
                application: application.publicKey,
                instruction: instruction.publicKey,
                account: instructionAccount.publicKey,
                systemProgram: SystemProgram.programId,
              },
              signers: [instructionAccount],
              remainingAccounts: [
                {
                  pubkey: collection.publicKey,
                  isWritable: false,
                  isSigner: false,
                },
                {
                  pubkey: instructionPayerAccount.publicKey,
                  isWritable: false,
                  isSigner: false,
                },
              ],
            }
          );
        } catch (err) {
          error = err;
        }
        // assert
        assert.equal(error.code, 309);
      });
    });

    describe('with mut modifier', () => {
      const instructionAccount = Keypair.generate();

      it('should create', async () => {
        // arrange
        const instructionAccountName = 'data';
        const instructionAccountKind = 0;
        const instructionAccountModifier = 2;
        const instructionAccountSpace = null;
        const instructionAccountProgram = null;
        // act
        await program.rpc.createInstructionAccount(
          instructionAccountName,
          instructionAccountKind,
          instructionAccountModifier,
          instructionAccountSpace,
          instructionAccountProgram,
          {
            accounts: {
              authority: program.provider.wallet.publicKey,
              application: application.publicKey,
              instruction: instruction.publicKey,
              account: instructionAccount.publicKey,
              systemProgram: SystemProgram.programId,
            },
            signers: [instructionAccount],
            remainingAccounts: [
              {
                pubkey: collection.publicKey,
                isWritable: false,
                isSigner: false,
              },
            ],
          }
        );
        // assert
        const account = await program.account.instructionAccount.fetch(
          instructionAccount.publicKey
        );
        assert.ok(account.authority.equals(program.provider.wallet.publicKey));
        assert.equal(
          utils.bytes.utf8.decode(account.name),
          instructionAccountName
        );
        assert.ok('basic' in account.kind);
        assert.equal(account.kind.basic.id, instructionAccountKind);
        assert.ok('mut' in account.modifier);
        assert.equal(account.modifier.mut.id, instructionAccountModifier);
        assert.ok(account.instruction.equals(instruction.publicKey));
        assert.ok(account.application.equals(application.publicKey));
        assert.ok(account.collection.equals(collection.publicKey));
        assert.equal(account.program, null);
        assert.equal(account.close, null);
        assert.equal(account.space, null);
      });
    });

    describe('with mut modifier and close constraint', () => {
      const instructionAccount = Keypair.generate();
      const instructionCloseAccount = Keypair.generate();

      before(async () => {
        await program.rpc.createInstructionAccount(
          'authority',
          2,
          0,
          null,
          null,
          {
            accounts: {
              authority: program.provider.wallet.publicKey,
              application: application.publicKey,
              instruction: instruction.publicKey,
              account: instructionCloseAccount.publicKey,
              systemProgram: SystemProgram.programId,
            },
            signers: [instructionCloseAccount],
          }
        );
      });

      it('should create', async () => {
        // arrange
        const instructionAccountName = 'data';
        const instructionAccountKind = 0;
        const instructionAccountModifier = 2;
        const instructionAccountSpace = null;
        const instructionAccountProgram = null;
        // act
        await program.rpc.createInstructionAccount(
          instructionAccountName,
          instructionAccountKind,
          instructionAccountModifier,
          instructionAccountSpace,
          instructionAccountProgram,
          {
            accounts: {
              authority: program.provider.wallet.publicKey,
              application: application.publicKey,
              instruction: instruction.publicKey,
              account: instructionAccount.publicKey,
              systemProgram: SystemProgram.programId,
            },
            signers: [instructionAccount],
            remainingAccounts: [
              {
                pubkey: collection.publicKey,
                isWritable: false,
                isSigner: false,
              },
              {
                pubkey: instructionCloseAccount.publicKey,
                isWritable: false,
                isSigner: false,
              },
            ],
          }
        );
        // assert
        const account = await program.account.instructionAccount.fetch(
          instructionAccount.publicKey
        );
        assert.ok(account.authority.equals(program.provider.wallet.publicKey));
        assert.equal(
          utils.bytes.utf8.decode(account.name),
          instructionAccountName
        );
        assert.ok('basic' in account.kind);
        assert.equal(account.kind.basic.id, instructionAccountKind);
        assert.ok('mut' in account.modifier);
        assert.equal(account.modifier.mut.id, instructionAccountModifier);
        assert.ok(account.instruction.equals(instruction.publicKey));
        assert.ok(account.application.equals(application.publicKey));
        assert.ok(account.collection.equals(collection.publicKey));
        assert.ok(account.close.equals(instructionCloseAccount.publicKey));
        assert.equal(account.program, null);
        assert.equal(account.space, null);
      });

      it('should remove close when changing the modifier', async () => {
        // arrange
        const instructionAccountName = 'data';
        const instructionAccountKind = 2;
        const instructionAccountModifier = 0;
        const instructionAccountSpace = null;
        const instructionAccountProgram = null;
        // act
        await program.rpc.updateInstructionAccount(
          instructionAccountName,
          instructionAccountKind,
          instructionAccountModifier,
          instructionAccountSpace,
          instructionAccountProgram,
          {
            accounts: {
              authority: program.provider.wallet.publicKey,
              account: instructionAccount.publicKey,
            },
          }
        );
        // assert
        const account = await program.account.instructionAccount.fetch(
          instructionAccount.publicKey
        );
        console.log(account);
        assert.ok('signer' in account.kind);
        assert.equal(account.kind.signer.id, instructionAccountKind);
        assert.ok('none' in account.modifier);
        assert.equal(account.modifier.none.id, instructionAccountModifier);
        assert.equal(account.close, null);
        assert.equal(account.program, null);
        assert.equal(account.space, null);
      });
    });
  });
});
