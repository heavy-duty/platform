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
    await program.rpc.createApplication(applicationName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [application],
    });
    await program.rpc.createCollection(collectionName, {
      accounts: {
        collection: collection.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [collection],
    });
    await program.rpc.createCollection(anotherCollectionName, {
      accounts: {
        collection: anotherCollection.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [anotherCollection],
    });
    await program.rpc.createInstruction(instructionName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [instruction],
    });
  });

  describe('document', () => {
    const instructionAccount = Keypair.generate();

    it('should fail when creating without collection', async () => {
      // arrange
      const instructionAccount = Keypair.generate();
      const dto = {
        name: '12345678901234567890123456789012',
        kind: 0,
        modifier: null,
        space: null,
      };
      let error: ProgramError;
      // act
      try {
        await program.rpc.createInstructionAccount(dto, {
          accounts: {
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            account: instructionAccount.publicKey,
            systemProgram: SystemProgram.programId,
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
      const dto = {
        name: 'data',
        kind: 0,
        modifier: null,
        space: null,
      };
      // act
      await program.rpc.createInstructionAccount(dto, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
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
      });
      // assert
      const account = await program.account.instructionAccount.fetch(
        instructionAccount.publicKey
      );
      assert.ok(account.authority.equals(program.provider.wallet.publicKey));
      assert.ok(account.instruction.equals(instruction.publicKey));
      assert.ok(account.workspace.equals(workspace.publicKey));
      assert.ok(account.application.equals(application.publicKey));
      assert.equal(account.data.name, dto.name);
      assert.ok('document' in account.data.kind);
      assert.equal(account.data.kind.document.id, dto.kind);
      assert.ok(account.data.collection.equals(collection.publicKey));
      assert.equal(account.data.modifier, null);
      assert.equal(account.data.payer, null);
      assert.equal(account.data.close, null);
      assert.equal(account.data.space, null);
    });

    it('should remove collection when changing the kind', async () => {
      // arrange
      const dto = {
        name: 'data',
        kind: 1,
        modifier: null,
        space: null,
      };
      // act
      await program.rpc.updateInstructionAccount(dto, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          account: instructionAccount.publicKey,
        },
      });
      // assert
      const account = await program.account.instructionAccount.fetch(
        instructionAccount.publicKey
      );
      assert.ok('signer' in account.data.kind);
      assert.equal(account.data.kind.signer.id, dto.kind);
      assert.equal(account.data.collection, null);
    });

    it('should delete', async () => {
      // arrange
      const instructionAccount = Keypair.generate();
      const dto = {
        name: 'data',
        kind: 0,
        modifier: null,
        space: null,
      };
      // act
      await program.rpc.createInstructionAccount(dto, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
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
        const dto = {
          name: 'payer',
          kind: 1,
          modifier: 1,
          space: null,
        };

        await program.rpc.createInstructionAccount(dto, {
          accounts: {
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
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
        const dto = {
          name: 'data',
          kind: 0,
          modifier: 0,
          space: 150,
        };
        // act
        await program.rpc.createInstructionAccount(dto, {
          accounts: {
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
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
        });
        // assert
        const account = await program.account.instructionAccount.fetch(
          instructionAccount.publicKey
        );
        assert.ok('init' in account.data.modifier);
        assert.equal(account.data.modifier.init.id, dto.modifier);
        assert.ok(account.data.payer.equals(instructionPayerAccount.publicKey));
        assert.equal(account.data.space, 150);
      });

      it('should remove payer and space when changing the modifier', async () => {
        // arrange
        const dto = {
          name: 'data',
          kind: 0,
          modifier: null,
          space: null,
        };
        // act
        await program.rpc.updateInstructionAccount(dto, {
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
        const dto = {
          name: 'data',
          kind: 0,
          modifier: 0,
          space: null,
        };
        let error: ProgramError;
        // act
        try {
          await program.rpc.createInstructionAccount(dto, {
            accounts: {
              authority: program.provider.wallet.publicKey,
              workspace: workspace.publicKey,
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
        const dto = {
          name: 'data',
          kind: 0,
          modifier: 1,
          space: null,
        };
        // act
        await program.rpc.createInstructionAccount(dto, {
          accounts: {
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
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
        });
        // assert
        const account = await program.account.instructionAccount.fetch(
          instructionAccount.publicKey
        );
        assert.ok(account.authority.equals(program.provider.wallet.publicKey));
        assert.ok(account.instruction.equals(instruction.publicKey));
        assert.ok(account.workspace.equals(workspace.publicKey));
        assert.ok(account.application.equals(application.publicKey));
        assert.equal(account.data.name, dto.name);
        assert.ok(account.data.collection.equals(collection.publicKey));
        assert.ok('document' in account.data.kind);
        assert.equal(account.data.kind.document.id, dto.kind);
        assert.ok('mut' in account.data.modifier);
        assert.equal(account.data.modifier.mut.id, dto.modifier);
        assert.equal(account.data.close, null);
        assert.equal(account.data.space, null);
      });
    });

    describe('with mut modifier and close constraint', () => {
      const instructionAccount = Keypair.generate();
      const instructionCloseAccount = Keypair.generate();

      before(async () => {
        const dto = {
          name: 'payer',
          kind: 1,
          modifier: 1,
          space: null,
        };

        await program.rpc.createInstructionAccount(dto, {
          accounts: {
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            account: instructionCloseAccount.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [instructionCloseAccount],
        });
      });

      it('should create', async () => {
        // arrange
        const dto = {
          name: 'data',
          kind: 0,
          modifier: 1,
          space: null,
        };
        // act
        await program.rpc.createInstructionAccount(dto, {
          accounts: {
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
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
        });
        // assert
        const account = await program.account.instructionAccount.fetch(
          instructionAccount.publicKey
        );
        assert.ok(account.authority.equals(program.provider.wallet.publicKey));
        assert.ok(account.instruction.equals(instruction.publicKey));
        assert.ok(account.workspace.equals(workspace.publicKey));
        assert.ok(account.application.equals(application.publicKey));
        assert.equal(account.data.name, dto.name);
        assert.ok('document' in account.data.kind);
        assert.equal(account.data.kind.document.id, dto.kind);
        assert.ok('mut' in account.data.modifier);
        assert.equal(account.data.modifier.mut.id, dto.modifier);
        assert.ok(account.data.collection.equals(collection.publicKey));
        assert.ok(account.data.close.equals(instructionCloseAccount.publicKey));
        assert.equal(account.data.space, null);
      });

      it('should remove close when changing the modifier', async () => {
        // arrange
        const dto = {
          name: 'data',
          kind: 1,
          modifier: null,
          space: null,
        };
        // act
        await program.rpc.updateInstructionAccount(dto, {
          accounts: {
            authority: program.provider.wallet.publicKey,
            account: instructionAccount.publicKey,
          },
        });
        // assert
        const account = await program.account.instructionAccount.fetch(
          instructionAccount.publicKey
        );
        assert.ok('signer' in account.data.kind);
        assert.equal(account.data.kind.signer.id, dto.kind);
        assert.equal(account.data.modifier, null);
        assert.equal(account.data.close, null);
        assert.equal(account.data.space, null);
      });
    });
  });

  describe('signer', () => {
    const instructionAccount = Keypair.generate();

    it('should create', async () => {
      // arrange
      const dto = {
        name: 'data',
        kind: 1,
        modifier: null,
        space: null,
      };
      // act
      await program.rpc.createInstructionAccount(dto, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          account: instructionAccount.publicKey,
          systemProgram: SystemProgram.programId,
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
      assert.equal(account.data.name, dto.name);
      assert.ok('signer' in account.data.kind);
      assert.equal(account.data.kind.signer.id, dto.kind);
      assert.equal(account.data.modifier, null);
      assert.equal(account.data.collection, null);
      assert.equal(account.data.payer, null);
      assert.equal(account.data.close, null);
      assert.equal(account.data.space, null);
    });
  });

  it('should fail when deleting account with relations', async () => {
    // arrange
    const instructionAccount1 = Keypair.generate();
    const instructionAccount2 = Keypair.generate();
    const dto = {
      name: '12345678901234567890123456789012',
      kind: 0,
      modifier: null,
      space: null,
    };
    let error: ProgramError;
    // act
    try {
      await program.rpc.createInstructionAccount(dto, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          account: instructionAccount1.publicKey,
          systemProgram: SystemProgram.programId,
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
      await program.rpc.createInstructionAccount(dto, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          account: instructionAccount2.publicKey,
          systemProgram: SystemProgram.programId,
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
      const [relationPublicKey, relationBump] =
        await PublicKey.findProgramAddress(
          [
            Buffer.from('instruction_relation', 'utf8'),
            instructionAccount1.publicKey.toBuffer(),
            instructionAccount2.publicKey.toBuffer(),
          ],
          program.programId
        );
      await program.rpc.createInstructionRelation(relationBump, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          from: instructionAccount1.publicKey,
          to: instructionAccount2.publicKey,
          relation: relationPublicKey,
          systemProgram: SystemProgram.programId,
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
    const dto = {
      name: 'data',
      kind: 0,
      modifier: null,
      space: null,
    };
    // act
    await program.rpc.createInstruction(instructionName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [instruction],
    });
    await program.rpc.createInstructionAccount(dto, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
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
    const dto = {
      name: 'data',
      kind: 0,
      modifier: null,
      space: null,
    };
    // act
    await program.rpc.createInstruction(instructionName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [instruction],
    });
    await program.rpc.createInstructionAccount(dto, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
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
    const dto = {
      name: 'data',
      kind: 1,
      modifier: null,
      space: null,
    };
    let error: ProgramError;
    // act
    try {
      await program.rpc.createInstruction(newInstructionName, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: newInstruction.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [newInstruction],
      });
      await program.rpc.createInstructionAccount(dto, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: newInstruction.publicKey,
          account: newAccount.publicKey,
          systemProgram: SystemProgram.programId,
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
