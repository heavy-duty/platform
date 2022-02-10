import {
  Idl,
  Program,
  ProgramError,
  Provider,
  setProvider,
} from '@project-serum/anchor';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
} from '@solana/web3.js';
import { assert } from 'chai';
import * as bulldozerIdl from '../target/idl/bulldozer.json';
import { BULLDOZER_PROGRAM_ID } from './utils';

describe('instruction account', () => {
  const program = new Program(bulldozerIdl as Idl, BULLDOZER_PROGRAM_ID);
  setProvider(Provider.env());
  const instruction = Keypair.generate();
  const instructionName = 'create_document';
  const collection = Keypair.generate();
  const collectionName = 'things';
  const application = Keypair.generate();
  const applicationName = 'my-app';
  const workspace = Keypair.generate();
  const workspaceName = 'my-workspace';
  const anotherCollection = Keypair.generate();
  const anotherCollectionName = 'another-things';

  before(async () => {
    await program.rpc.createWorkspace(
      { name: workspaceName },
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [workspace],
      }
    );
    await program.rpc.createApplication(
      { name: applicationName },
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [application],
      }
    );
    await program.rpc.createCollection(
      { name: collectionName },
      {
        accounts: {
          collection: collection.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          authority: program.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [collection],
      }
    );
    await program.rpc.createCollection(
      { name: anotherCollectionName },
      {
        accounts: {
          collection: anotherCollection.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          authority: program.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [anotherCollection],
      }
    );
    await program.rpc.createInstruction(
      { name: instructionName },
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [instruction],
      }
    );
  });

  describe('document', () => {
    const instructionAccount = Keypair.generate();

    it('should fail when creating without collection', async () => {
      // arrange
      const instructionAccount = Keypair.generate();
      const argumentsData = {
        name: '12345678901234567890123456789012',
        kind: 0,
        modifier: null,
        space: null,
      };
      let error: ProgramError;
      // act
      try {
        await program.rpc.createInstructionAccount(argumentsData, {
          accounts: {
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            account: instructionAccount.publicKey,
            systemProgram: SystemProgram.programId,
            clock: SYSVAR_CLOCK_PUBKEY,
          },
          signers: [instructionAccount],
        });
      } catch (err) {
        error = err;
      }
      // assert
      assert.equal(error.code, 6005);
    });

    it('should create', async () => {
      // arrange
      const argumentsData = {
        name: 'data',
        kind: 0,
        modifier: null,
        space: null,
      };
      // act
      await program.rpc.createInstructionAccount(argumentsData, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          account: instructionAccount.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [instructionAccount],
        remainingAccounts: [
          {
            pubkey: collection.publicKey,
            isWritable: false,
            isSigner: false,
          },
        ],
      });
      // assert
      const account = await program.account.instructionAccount.fetch(
        instructionAccount.publicKey
      );
      assert.ok(account.authority.equals(program.provider.wallet.publicKey));
      assert.ok(account.instruction.equals(instruction.publicKey));
      assert.ok(account.workspace.equals(workspace.publicKey));
      assert.ok(account.application.equals(application.publicKey));
      assert.equal(account.name, argumentsData.name);
      assert.ok('document' in account.kind);
      assert.equal(account.kind.document.id, argumentsData.kind);
      assert.ok(account.kind.document.collection.equals(collection.publicKey));
      assert.equal(account.modifier, null);
      assert.ok(account.createdAt.eq(account.updatedAt));
    });

    it('should remove collection when changing the kind', async () => {
      // arrange
      const argumentsData = {
        name: 'data',
        kind: 1,
        modifier: null,
        space: null,
      };
      // act
      await program.rpc.updateInstructionAccount(argumentsData, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          account: instructionAccount.publicKey,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
      });
      // assert
      const account = await program.account.instructionAccount.fetch(
        instructionAccount.publicKey
      );
      assert.ok('signer' in account.kind);
      assert.equal(account.kind.signer.id, argumentsData.kind);
      assert.ok(account.createdAt.lte(account.updatedAt));
    });

    it('should delete', async () => {
      // arrange
      const instructionAccount = Keypair.generate();
      const argumentsData = {
        name: 'data',
        kind: 0,
        modifier: null,
        space: null,
      };
      // act
      await program.rpc.createInstructionAccount(argumentsData, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          account: instructionAccount.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [instructionAccount],
        remainingAccounts: [
          {
            pubkey: collection.publicKey,
            isWritable: false,
            isSigner: false,
          },
        ],
      });
      await program.rpc.deleteInstructionAccount({
        accounts: {
          authority: program.provider.wallet.publicKey,
          account: instructionAccount.publicKey,
          instruction: instruction.publicKey,
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
        const argumentsData = {
          name: 'payer',
          kind: 1,
          modifier: 1,
          space: null,
        };

        await program.rpc.createInstructionAccount(argumentsData, {
          accounts: {
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            account: instructionPayerAccount.publicKey,
            systemProgram: SystemProgram.programId,
            clock: SYSVAR_CLOCK_PUBKEY,
          },
          signers: [instructionPayerAccount],
        });
      });

      it('should create', async () => {
        // arrange
        const argumentsData = {
          name: 'data',
          kind: 0,
          modifier: 0,
          space: 150,
        };
        // act
        await program.rpc.createInstructionAccount(argumentsData, {
          accounts: {
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            account: instructionAccount.publicKey,
            systemProgram: SystemProgram.programId,
            clock: SYSVAR_CLOCK_PUBKEY,
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
        });
        // assert
        const account = await program.account.instructionAccount.fetch(
          instructionAccount.publicKey
        );
        assert.ok('init' in account.modifier);
        assert.equal(account.modifier.init.id, argumentsData.modifier);
        assert.ok(
          account.modifier.init.payer.equals(instructionPayerAccount.publicKey)
        );
        assert.equal(account.modifier.init.space, 150);
      });

      it('should remove payer and space when changing the modifier', async () => {
        // arrange
        const argumentsData = {
          name: 'data',
          kind: 0,
          modifier: null,
          space: null,
        };
        // act
        await program.rpc.updateInstructionAccount(argumentsData, {
          accounts: {
            authority: program.provider.wallet.publicKey,
            account: instructionAccount.publicKey,
            clock: SYSVAR_CLOCK_PUBKEY,
          },
          remainingAccounts: [
            {
              pubkey: collection.publicKey,
              isWritable: false,
              isSigner: false,
            },
          ],
        });
        // assert
        const account = await program.account.instructionAccount.fetch(
          instructionAccount.publicKey
        );
        assert.equal(account.modifier, null);
        assert.equal(account.payer, null);
        assert.equal(account.space, null);
      });

      it('should fail when space is not provided', async () => {
        // arrange
        const instructionAccount = Keypair.generate();
        const argumentsData = {
          name: 'data',
          kind: 0,
          modifier: 0,
          space: null,
        };
        let error: ProgramError;
        // act
        try {
          await program.rpc.createInstructionAccount(argumentsData, {
            accounts: {
              authority: program.provider.wallet.publicKey,
              workspace: workspace.publicKey,
              application: application.publicKey,
              instruction: instruction.publicKey,
              account: instructionAccount.publicKey,
              systemProgram: SystemProgram.programId,
              clock: SYSVAR_CLOCK_PUBKEY,
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
          });
        } catch (err) {
          error = err;
        }
        // assert
        assert.equal(error.code, 6007);
      });
    });

    describe('with mut modifier', () => {
      const instructionAccount = Keypair.generate();

      it('should create', async () => {
        // arrange
        const argumentsData = {
          name: 'data',
          kind: 0,
          modifier: 1,
          space: null,
        };
        // act
        await program.rpc.createInstructionAccount(argumentsData, {
          accounts: {
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            account: instructionAccount.publicKey,
            systemProgram: SystemProgram.programId,
            clock: SYSVAR_CLOCK_PUBKEY,
          },
          signers: [instructionAccount],
          remainingAccounts: [
            {
              pubkey: collection.publicKey,
              isWritable: false,
              isSigner: false,
            },
          ],
        });
        // assert
        const account = await program.account.instructionAccount.fetch(
          instructionAccount.publicKey
        );
        assert.ok(account.authority.equals(program.provider.wallet.publicKey));
        assert.ok(account.instruction.equals(instruction.publicKey));
        assert.ok(account.workspace.equals(workspace.publicKey));
        assert.ok(account.application.equals(application.publicKey));
        assert.equal(account.name, argumentsData.name);
        assert.ok('document' in account.kind);
        assert.equal(account.kind.document.id, argumentsData.kind);
        assert.ok(
          account.kind.document.collection.equals(collection.publicKey)
        );
        assert.ok('mut' in account.modifier);
        assert.equal(account.modifier.mut.id, argumentsData.modifier);
        assert.equal(account.modifier.mut.close, null);
      });
    });

    describe('with mut modifier and close constraint', () => {
      const instructionAccount = Keypair.generate();
      const instructionCloseAccount = Keypair.generate();

      before(async () => {
        const argumentsData = {
          name: 'payer',
          kind: 1,
          modifier: 1,
          space: null,
        };

        await program.rpc.createInstructionAccount(argumentsData, {
          accounts: {
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            account: instructionCloseAccount.publicKey,
            systemProgram: SystemProgram.programId,
            clock: SYSVAR_CLOCK_PUBKEY,
          },
          signers: [instructionCloseAccount],
        });
      });

      it('should create', async () => {
        // arrange
        const argumentsData = {
          name: 'data',
          kind: 0,
          modifier: 1,
          space: null,
        };
        // act
        await program.rpc.createInstructionAccount(argumentsData, {
          accounts: {
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            account: instructionAccount.publicKey,
            systemProgram: SystemProgram.programId,
            clock: SYSVAR_CLOCK_PUBKEY,
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
        });
        // assert
        const account = await program.account.instructionAccount.fetch(
          instructionAccount.publicKey
        );
        assert.ok(account.authority.equals(program.provider.wallet.publicKey));
        assert.ok(account.instruction.equals(instruction.publicKey));
        assert.ok(account.workspace.equals(workspace.publicKey));
        assert.ok(account.application.equals(application.publicKey));
        assert.equal(account.name, argumentsData.name);
        assert.ok('document' in account.kind);
        assert.equal(account.kind.document.id, argumentsData.kind);
        assert.ok(
          account.kind.document.collection.equals(collection.publicKey)
        );
        assert.ok('mut' in account.modifier);
        assert.equal(account.modifier.mut.id, argumentsData.modifier);
        assert.ok(
          account.modifier.mut.close.equals(instructionCloseAccount.publicKey)
        );
      });

      it('should remove close when changing the modifier', async () => {
        // arrange
        const argumentsData = {
          name: 'data',
          kind: 1,
          modifier: null,
          space: null,
        };
        // act
        await program.rpc.updateInstructionAccount(argumentsData, {
          accounts: {
            authority: program.provider.wallet.publicKey,
            account: instructionAccount.publicKey,
            clock: SYSVAR_CLOCK_PUBKEY,
          },
        });
        // assert
        const account = await program.account.instructionAccount.fetch(
          instructionAccount.publicKey
        );
        assert.ok('signer' in account.kind);
        assert.equal(account.kind.signer.id, argumentsData.kind);
        assert.equal(account.modifier, null);
        assert.equal(account.close, null);
        assert.equal(account.space, null);
      });
    });
  });

  describe('signer', () => {
    const instructionAccount = Keypair.generate();

    it('should create', async () => {
      // arrange
      const argumentsData = {
        name: 'data',
        kind: 1,
        modifier: null,
        space: null,
      };
      // act
      await program.rpc.createInstructionAccount(argumentsData, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          account: instructionAccount.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [instructionAccount],
      });
      // assert
      const account = await program.account.instructionAccount.fetch(
        instructionAccount.publicKey
      );
      assert.ok(account.authority.equals(program.provider.wallet.publicKey));
      assert.ok(account.instruction.equals(instruction.publicKey));
      assert.ok(account.workspace.equals(workspace.publicKey));
      assert.ok(account.application.equals(application.publicKey));
      assert.equal(account.name, argumentsData.name);
      assert.ok('signer' in account.kind);
      assert.equal(account.kind.signer.id, argumentsData.kind);
      assert.equal(account.modifier, null);
      assert.equal(account.collection, null);
      assert.equal(account.payer, null);
      assert.equal(account.close, null);
      assert.equal(account.space, null);
    });
  });

  it('should fail when deleting account with relations', async () => {
    // arrange
    const instructionAccount1 = Keypair.generate();
    const instructionAccount2 = Keypair.generate();
    const argumentsData = {
      name: '12345678901234567890123456789012',
      kind: 0,
      modifier: null,
      space: null,
    };
    let error: ProgramError;
    // act
    try {
      await program.rpc.createInstructionAccount(argumentsData, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          account: instructionAccount1.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [instructionAccount1],
        remainingAccounts: [
          {
            pubkey: collection.publicKey,
            isWritable: false,
            isSigner: false,
          },
        ],
      });
      await program.rpc.createInstructionAccount(argumentsData, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          account: instructionAccount2.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [instructionAccount2],
        remainingAccounts: [
          {
            pubkey: collection.publicKey,
            isWritable: false,
            isSigner: false,
          },
        ],
      });
      const [relationPublicKey] = await PublicKey.findProgramAddress(
        [
          Buffer.from('instruction_relation', 'utf8'),
          instructionAccount1.publicKey.toBuffer(),
          instructionAccount2.publicKey.toBuffer(),
        ],
        program.programId
      );
      await program.rpc.createInstructionRelation({
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          from: instructionAccount1.publicKey,
          to: instructionAccount2.publicKey,
          relation: relationPublicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
      });
      await program.rpc.deleteInstructionAccount({
        accounts: {
          authority: program.provider.wallet.publicKey,
          account: instructionAccount1.publicKey,
          instruction: instruction.publicKey,
        },
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6015);
  });

  it('should increment instruction account quantity on create', async () => {
    // arrange
    const instructionAccount = Keypair.generate();
    const instruction = Keypair.generate();
    const argumentsData = {
      name: 'data',
      kind: 0,
      modifier: null,
      space: null,
    };
    // act
    await program.rpc.createInstruction(
      { name: instructionName },
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [instruction],
      }
    );
    await program.rpc.createInstructionAccount(argumentsData, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        account: instructionAccount.publicKey,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
      signers: [instructionAccount],
      remainingAccounts: [
        {
          pubkey: collection.publicKey,
          isWritable: false,
          isSigner: false,
        },
      ],
    });
    // assert
    const account = await program.account.instruction.fetch(
      instruction.publicKey
    );
    assert.equal(account.quantityOfAccounts, 1);
  });

  it('should decrement instruction account quantity on delete', async () => {
    // arrange
    const instructionAccount = Keypair.generate();
    const instruction = Keypair.generate();
    const argumentsData = {
      name: 'data',
      kind: 0,
      modifier: null,
      space: null,
    };
    // act
    await program.rpc.createInstruction(
      { name: instructionName },
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [instruction],
      }
    );
    await program.rpc.createInstructionAccount(argumentsData, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        account: instructionAccount.publicKey,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
      signers: [instructionAccount],
      remainingAccounts: [
        {
          pubkey: collection.publicKey,
          isWritable: false,
          isSigner: false,
        },
      ],
    });
    await program.rpc.deleteInstructionAccount({
      accounts: {
        authority: program.provider.wallet.publicKey,
        account: instructionAccount.publicKey,
        instruction: instruction.publicKey,
      },
    });
    // assert
    const account = await program.account.instruction.fetch(
      instruction.publicKey
    );
    assert.equal(account.quantityOfAccounts, 0);
  });

  it('should fail when providing wrong "instruction" to delete', async () => {
    // arrange
    const newInstruction = Keypair.generate();
    const newInstructionName = 'sample';
    const newAccount = Keypair.generate();
    const argumentsData = {
      name: 'data',
      kind: 1,
      modifier: null,
      space: null,
    };
    let error: ProgramError;
    // act
    try {
      await program.rpc.createInstruction(
        { name: newInstructionName },
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: newInstruction.publicKey,
            systemProgram: SystemProgram.programId,
            clock: SYSVAR_CLOCK_PUBKEY,
          },
          signers: [newInstruction],
        }
      );
      await program.rpc.createInstructionAccount(argumentsData, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: newInstruction.publicKey,
          account: newAccount.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [newAccount],
      });
      await program.rpc.deleteInstructionAccount({
        accounts: {
          authority: program.provider.wallet.publicKey,
          instruction: instruction.publicKey,
          account: newAccount.publicKey,
        },
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6021);
  });
});
