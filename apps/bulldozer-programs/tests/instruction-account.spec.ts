import { Provider, setProvider, utils, workspace } from '@project-serum/anchor';
import { Keypair, SystemProgram } from '@solana/web3.js';
import { assert } from 'chai';

describe('instruction account', () => {
  setProvider(Provider.env());
  const program = workspace.Bulldozer;
  const instruction = Keypair.generate();
  const instructionAccount = Keypair.generate();
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

  describe('basic', () => {
    it('should create account', async () => {
      // arrange
      const instructionAccountName = 'data';
      const instructionAccountMarkAttribute = 0;
      // act
      await program.rpc.createInstructionBasicAccount(
        instructionAccountName,
        instructionAccountMarkAttribute,
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            collection: collection.publicKey,
            account: instructionAccount.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [instructionAccount],
        }
      );
      // assert
      const account = await program.account.instructionBasicAccount.fetch(
        instructionAccount.publicKey
      );
      assert.ok(account.authority.equals(program.provider.wallet.publicKey));
      assert.equal(
        utils.bytes.utf8.decode(
          new Uint8Array(
            account.name.filter((segment: number) => segment !== 0)
          )
        ),
        instructionAccountName
      );
      assert.ok('none' in account.markAttribute);
      assert.equal(
        account.markAttribute.none.id,
        instructionAccountMarkAttribute
      );
      assert.ok(account.instruction.equals(instruction.publicKey));
      assert.ok(account.application.equals(application.publicKey));
      assert.ok(account.collection.equals(collection.publicKey));
    });

    it('should update account', async () => {
      // arrange
      const instructionAccountName = 'data-2';
      const instructionAccountMarkAttribute = 1;
      // act
      await program.rpc.updateInstructionBasicAccount(
        instructionAccountName,
        instructionAccountMarkAttribute,
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            account: instructionAccount.publicKey,
            collection: anotherCollection.publicKey,
          },
        }
      );
      // assert
      const account = await program.account.instructionBasicAccount.fetch(
        instructionAccount.publicKey
      );
      assert.equal(
        utils.bytes.utf8.decode(
          new Uint8Array(
            account.name.filter((segment: number) => segment !== 0)
          )
        ),
        instructionAccountName
      );
      assert.ok('init' in account.markAttribute);
      assert.equal(
        account.markAttribute.init.id,
        instructionAccountMarkAttribute
      );
      assert.ok(account.collection.equals(anotherCollection.publicKey));
    });

    it('should delete account', async () => {
      // act
      await program.rpc.deleteInstructionBasicAccount({
        accounts: {
          authority: program.provider.wallet.publicKey,
          account: instructionAccount.publicKey,
        },
      });
      // assert
      const account =
        await program.account.instructionBasicAccount.fetchNullable(
          instructionAccount.publicKey
        );
      assert.equal(account, null);
    });
  });

  describe('signer', () => {
    it('should create account', async () => {
      // arrange
      const instructionAccountName = 'data';
      const instructionAccountMarkAttribute = 0;
      // act
      await program.rpc.createInstructionSignerAccount(
        instructionAccountName,
        instructionAccountMarkAttribute,
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
      // assert
      const account = await program.account.instructionSignerAccount.fetch(
        instructionAccount.publicKey
      );
      assert.ok(account.authority.equals(program.provider.wallet.publicKey));
      assert.equal(
        utils.bytes.utf8.decode(
          new Uint8Array(
            account.name.filter((segment: number) => segment !== 0)
          )
        ),
        instructionAccountName
      );
      assert.ok('none' in account.markAttribute);
      assert.equal(
        account.markAttribute.none.id,
        instructionAccountMarkAttribute
      );
      assert.ok(account.instruction.equals(instruction.publicKey));
      assert.ok(account.application.equals(application.publicKey));
    });

    it('should update account', async () => {
      // arrange
      const instructionAccountName = 'data-2';
      const instructionAccountMarkAttribute = 1;
      // act
      await program.rpc.updateInstructionSignerAccount(
        instructionAccountName,
        instructionAccountMarkAttribute,
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            account: instructionAccount.publicKey,
          },
        }
      );
      // assert
      const account = await program.account.instructionSignerAccount.fetch(
        instructionAccount.publicKey
      );
      assert.equal(
        utils.bytes.utf8.decode(
          new Uint8Array(
            account.name.filter((segment: number) => segment !== 0)
          )
        ),
        instructionAccountName
      );
      assert.ok('init' in account.markAttribute);
      assert.equal(
        account.markAttribute.init.id,
        instructionAccountMarkAttribute
      );
    });

    it('should delete account', async () => {
      // act
      await program.rpc.deleteInstructionSignerAccount({
        accounts: {
          authority: program.provider.wallet.publicKey,
          account: instructionAccount.publicKey,
        },
      });
      // assert
      const account =
        await program.account.instructionSignerAccount.fetchNullable(
          instructionAccount.publicKey
        );
      assert.equal(account, null);
    });
  });

  describe('program', () => {
    it('should create account', async () => {
      // arrange
      const instructionAccountName = 'data';
      // act
      await program.rpc.createInstructionProgramAccount(
        instructionAccountName,
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            program: SystemProgram.programId,
            account: instructionAccount.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [instructionAccount],
        }
      );
      // assert
      const account = await program.account.instructionProgramAccount.fetch(
        instructionAccount.publicKey
      );
      assert.ok(account.authority.equals(program.provider.wallet.publicKey));
      assert.equal(
        utils.bytes.utf8.decode(
          new Uint8Array(
            account.name.filter((segment: number) => segment !== 0)
          )
        ),
        instructionAccountName
      );
      assert.ok(account.instruction.equals(instruction.publicKey));
      assert.ok(account.application.equals(application.publicKey));
      assert.ok(account.program.equals(SystemProgram.programId));
    });

    it('should update account', async () => {
      // arrange
      const instructionAccountName = 'data-2';
      // act
      await program.rpc.updateInstructionProgramAccount(
        instructionAccountName,
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            account: instructionAccount.publicKey,
            program: SystemProgram.programId,
          },
        }
      );
      // assert
      const account = await program.account.instructionProgramAccount.fetch(
        instructionAccount.publicKey
      );
      assert.equal(
        utils.bytes.utf8.decode(
          new Uint8Array(
            account.name.filter((segment: number) => segment !== 0)
          )
        ),
        instructionAccountName
      );
    });

    it('should delete account', async () => {
      // act
      await program.rpc.deleteInstructionProgramAccount({
        accounts: {
          authority: program.provider.wallet.publicKey,
          account: instructionAccount.publicKey,
        },
      });
      // assert
      const account =
        await program.account.instructionProgramAccount.fetchNullable(
          instructionAccount.publicKey
        );
      assert.equal(account, null);
    });
  });
});
