import { Provider, setProvider, utils, workspace } from '@project-serum/anchor';
import { Keypair, SystemProgram } from '@solana/web3.js';
import { assert } from 'chai';

describe('bulldozer', () => {
  setProvider(Provider.env());
  const program = workspace.Bulldozer;

  describe('application', () => {
    const application = Keypair.generate();

    it('should create account', async () => {
      // arrange
      const applicationName = 'my-app';
      // act
      await program.rpc.createApplication(applicationName, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [application],
      });
      // assert
      const account = await program.account.application.fetch(
        application.publicKey
      );
      assert.ok(account.authority.equals(program.provider.wallet.publicKey));
      assert.equal(utils.bytes.utf8.decode(account.name), applicationName);
    });

    it('should update account', async () => {
      // arrange
      const applicationName = 'my-app2';
      // act
      await program.rpc.updateApplication(applicationName, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
        },
      });
      // assert
      const account = await program.account.application.fetch(
        application.publicKey
      );
      assert.equal(utils.bytes.utf8.decode(account.name), applicationName);
    });

    it('should delete account', async () => {
      // act
      await program.rpc.deleteApplication({
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
        },
      });
      // assert
      const account = await program.account.application.fetchNullable(
        application.publicKey
      );
      assert.equal(account, null);
    });
  });

  describe('collection', () => {
    const collection = Keypair.generate();
    const application = Keypair.generate();
    const applicationName = 'my-app';

    before(async () => {
      await program.rpc.createApplication(applicationName, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [application],
      });
    });

    it('should create account', async () => {
      // arrange
      const collectionName = 'things';
      // act
      await program.rpc.createCollection(collectionName, {
        accounts: {
          collection: collection.publicKey,
          application: application.publicKey,
          authority: program.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [collection],
      });
      // assert
      const account = await program.account.collection.fetch(
        collection.publicKey
      );
      assert.ok(account.authority.equals(program.provider.wallet.publicKey));
      assert.equal(utils.bytes.utf8.decode(account.name), collectionName);
    });

    it('should update account', async () => {
      // arrange
      const collectionName = 'things2';
      // act
      await program.rpc.updateCollection(collectionName, {
        accounts: {
          collection: collection.publicKey,
          authority: program.provider.wallet.publicKey,
        },
      });
      // assert
      const account = await program.account.collection.fetch(
        collection.publicKey
      );
      assert.equal(utils.bytes.utf8.decode(account.name), collectionName);
    });

    it('should delete account', async () => {
      // act
      await program.rpc.deleteCollection({
        accounts: {
          collection: collection.publicKey,
          authority: program.provider.wallet.publicKey,
        },
      });
      // assert
      const account = await program.account.collection.fetchNullable(
        collection.publicKey
      );
      assert.equal(account, null);
    });
  });

  describe('collection attribute', () => {
    const attribute = Keypair.generate();
    const collection = Keypair.generate();
    const collectionName = 'things';
    const application = Keypair.generate();
    const applicationName = 'my-app';

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
    });

    it('should create account', async () => {
      // arrange
      const attributeName = 'attr1_name';
      const attributeKind = 0;
      const attributeModifier = 1;
      const attributeSize = 32;
      // act
      await program.rpc.createCollectionAttribute(
        attributeName,
        attributeKind,
        attributeModifier,
        attributeSize,
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            application: application.publicKey,
            collection: collection.publicKey,
            attribute: attribute.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [attribute],
        }
      );
      // assert
      const account = await program.account.collectionAttribute.fetch(
        attribute.publicKey
      );
      assert.ok(account.authority.equals(program.provider.wallet.publicKey));
      assert.equal(utils.bytes.utf8.decode(account.name), attributeName);
      assert.ok('u8' in account.kind);
      assert.equal(account.kind.u8.id, attributeKind);
      assert.equal(account.kind.u8.size, 1);
      assert.ok('array' in account.modifier);
      assert.equal(account.modifier.array.size, attributeSize);
      assert.equal(account.modifier.array.id, attributeModifier);
      assert.ok(account.collection.equals(collection.publicKey));
      assert.ok(account.application.equals(application.publicKey));
    });

    it('should update account', async () => {
      // arrange
      const attributeName = 'attr2_name';
      const attributeKind = 1;
      const attributeModifier = 2;
      const attributeSize = 5;
      // act
      await program.rpc.updateCollectionAttribute(
        attributeName,
        attributeKind,
        attributeModifier,
        attributeSize,
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            application: application.publicKey,
            collection: collection.publicKey,
            attribute: attribute.publicKey,
            systemProgram: SystemProgram.programId,
          },
        }
      );
      // assert
      const account = await program.account.collectionAttribute.fetch(
        attribute.publicKey
      );
      assert.equal(utils.bytes.utf8.decode(account.name), attributeName);
      assert.ok('u16' in account.kind);
      assert.equal(account.kind.u16.id, attributeKind);
      assert.equal(account.kind.u16.size, 2);
      assert.ok('vector' in account.modifier);
      assert.equal(account.modifier.vector.id, attributeModifier);
      assert.equal(account.modifier.vector.size, attributeSize);
    });

    it('should delete account', async () => {
      // act
      await program.rpc.deleteCollectionAttribute({
        accounts: {
          authority: program.provider.wallet.publicKey,
          attribute: attribute.publicKey,
        },
      });
      // assert
      const account = await program.account.collectionAttribute.fetchNullable(
        attribute.publicKey
      );
      assert.equal(account, null);
    });
  });

  describe('instruction', () => {
    const instruction = Keypair.generate();
    const application = Keypair.generate();
    const applicationName = 'my-app';

    before(async () => {
      await program.rpc.createApplication(applicationName, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [application],
      });
    });

    it('should create account', async () => {
      // arrange
      const instructionName = 'create_document';
      // act
      await program.rpc.createInstruction(instructionName, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [instruction],
      });
      // assert
      const account = await program.account.instruction.fetch(
        instruction.publicKey
      );
      assert.ok(account.authority.equals(program.provider.wallet.publicKey));
      assert.equal(utils.bytes.utf8.decode(account.name), instructionName);
      assert.ok(account.application.equals(application.publicKey));
    });

    it('should update account', async () => {
      // arrange
      const instructionName = 'update_document';
      // act
      await program.rpc.updateInstruction(instructionName, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          instruction: instruction.publicKey,
        },
      });
      // assert
      const account = await program.account.instruction.fetch(
        instruction.publicKey
      );
      assert.equal(utils.bytes.utf8.decode(account.name), instructionName);
    });

    it('should delete account', async () => {
      // act
      await program.rpc.deleteInstruction({
        accounts: {
          authority: program.provider.wallet.publicKey,
          instruction: instruction.publicKey,
        },
      });
      // assert
      const account = await program.account.instruction.fetchNullable(
        instruction.publicKey
      );
      assert.equal(account, null);
    });
  });

  describe('instruction argument', () => {
    const instruction = Keypair.generate();
    const instructionArgument = Keypair.generate();
    const instructionName = 'create_document';
    const application = Keypair.generate();
    const applicationName = 'my-app';

    before(async () => {
      await program.rpc.createApplication(applicationName, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [application],
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

    it('should create account', async () => {
      // arrange
      const argumentName = 'name';
      const argumentKind = 1;
      const argumentSize = 32;
      const argumentModifier = 1;
      // act
      await program.rpc.createInstructionArgument(
        argumentName,
        argumentKind,
        argumentModifier,
        argumentSize,
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            argument: instructionArgument.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [instructionArgument],
        }
      );
      // assert
      const account = await program.account.instructionArgument.fetch(
        instructionArgument.publicKey
      );
      assert.ok(account.authority.equals(program.provider.wallet.publicKey));
      assert.equal(utils.bytes.utf8.decode(account.name), argumentName);
      assert.ok('u16' in account.kind);
      assert.equal(account.kind.u16.id, argumentKind);
      assert.equal(account.kind.u16.size, 2);
      assert.ok('array' in account.modifier);
      assert.equal(account.modifier.array.id, argumentModifier);
      assert.equal(account.modifier.array.size, argumentSize);
      assert.ok(account.instruction.equals(instruction.publicKey));
      assert.ok(account.application.equals(application.publicKey));
    });

    it('should update account', async () => {
      // arrange
      const argumentName = 'new-name';
      const argumentKind = 2;
      const argumentSize = 5;
      const argumentModifier = 2;
      // act
      await program.rpc.updateInstructionArgument(
        argumentName,
        argumentKind,
        argumentModifier,
        argumentSize,
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            argument: instructionArgument.publicKey,
          },
        }
      );
      // assert
      const account = await program.account.instructionArgument.fetch(
        instructionArgument.publicKey
      );
      assert.equal(utils.bytes.utf8.decode(account.name), argumentName);
      assert.ok('u32' in account.kind);
      assert.equal(account.kind.u32.id, argumentKind);
      assert.equal(account.kind.u32.size, 4);
      assert.ok('vector' in account.modifier);
      assert.equal(account.modifier.vector.id, argumentModifier);
      assert.equal(account.modifier.vector.size, argumentSize);
    });

    it('should delete account', async () => {
      // act
      await program.rpc.deleteInstructionArgument({
        accounts: {
          authority: program.provider.wallet.publicKey,
          argument: instructionArgument.publicKey,
        },
      });
      // assert
      const argumentAccount =
        await program.account.instructionArgument.fetchNullable(
          instructionArgument.publicKey
        );
      assert.equal(argumentAccount, null);
    });
  });

  describe('instruction account', () => {
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
});
