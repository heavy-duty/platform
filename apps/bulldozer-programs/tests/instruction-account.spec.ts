import { Program, ProgramError, Provider } from '@heavy-duty/anchor';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import { assert } from 'chai';
import { Bulldozer, IDL } from '../target/types/bulldozer';
import {
  BULLDOZER_PROGRAM_ID,
  decodeAccountKind,
  decodeAccountModifier,
} from './utils';

describe('instruction account', () => {
  const program = new Program<Bulldozer>(
    IDL,
    BULLDOZER_PROGRAM_ID,
    Provider.env()
  );
  const instruction = Keypair.generate();
  const instructionName = 'create_document';
  const collection = Keypair.generate();
  const collectionName = 'things';
  const anotherCollection = Keypair.generate();
  const anotherCollectionName = 'another-things';
  const application = Keypair.generate();
  const workspace = Keypair.generate();
  const applicationName = 'my-app';
  const workspaceName = 'my-workspace';
  let budgetPublicKey: PublicKey;
  let instructionStatsPublicKey: PublicKey;

  before(async () => {
    [budgetPublicKey] = await PublicKey.findProgramAddress(
      [Buffer.from('budget', 'utf8'), workspace.publicKey.toBuffer()],
      program.programId
    );
    [instructionStatsPublicKey] = await PublicKey.findProgramAddress(
      [
        Buffer.from('instruction_stats', 'utf8'),
        instruction.publicKey.toBuffer(),
      ],
      program.programId
    );

    try {
      await program.methods
        .createUser()
        .accounts({
          authority: program.provider.wallet.publicKey,
        })
        .rpc();
    } catch (error) {}

    await program.methods
      .createWorkspace({ name: workspaceName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
      })
      .signers([workspace])
      .postInstructions([
        SystemProgram.transfer({
          fromPubkey: program.provider.wallet.publicKey,
          toPubkey: budgetPublicKey,
          lamports: LAMPORTS_PER_SOL,
        }),
      ])
      .rpc();
    await program.methods
      .createApplication({ name: applicationName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
      })
      .signers([application])
      .rpc();
    await program.methods
      .createInstruction({ name: instructionName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
      })
      .signers([instruction])
      .rpc();
    await program.methods
      .createCollection({ name: collectionName })
      .accounts({
        collection: collection.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        authority: program.provider.wallet.publicKey,
      })
      .signers([collection])
      .rpc();
    await program.methods
      .createCollection({ name: anotherCollectionName })
      .accounts({
        collection: anotherCollection.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        authority: program.provider.wallet.publicKey,
      })
      .signers([anotherCollection])
      .rpc();
  });

  describe('document', () => {
    const instructionAccount = Keypair.generate();

    it('should fail when creating without collection', async () => {
      // arrange
      const instructionAccount = Keypair.generate();
      const accountsData = {
        name: '12345678901234567890123456789012',
        kind: 0,
        modifier: null,
        space: null,
      };
      let error: ProgramError | null = null;
      // act
      try {
        await program.methods
          .createInstructionAccount(accountsData)
          .accounts({
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            account: instructionAccount.publicKey,
          })
          .signers([instructionAccount])
          .rpc();
      } catch (err) {
        error = err as ProgramError;
      }
      // assert
      assert.equal(error?.code, 6005);
    });

    it('should create', async () => {
      // arrange
      const accountsData = {
        name: 'data',
        kind: 0,
        modifier: null,
        space: null,
      };
      // act
      const signature = await program.methods
        .createInstructionAccount(accountsData)
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          account: instructionAccount.publicKey,
        })
        .signers([instructionAccount])
        .remainingAccounts([
          {
            pubkey: collection.publicKey,
            isWritable: false,
            isSigner: false,
          },
        ])
        .rpc();
      await program.provider.connection.confirmTransaction(signature);
      // assert
      const account = await program.account.instructionAccount.fetch(
        instructionAccount.publicKey
      );
      const instructionStatsAccount =
        await program.account.instructionStats.fetch(instructionStatsPublicKey);
      const decodedKind = decodeAccountKind(account.kind as any);
      assert.ok(account.authority.equals(program.provider.wallet.publicKey));
      assert.ok(account.instruction.equals(instruction.publicKey));
      assert.ok(account.workspace.equals(workspace.publicKey));
      assert.ok(account.application.equals(application.publicKey));
      assert.equal(account.name, accountsData.name);
      assert.ok('document' in account.kind);
      assert.equal(decodedKind.id, accountsData.kind);
      assert.equal(decodedKind.collection, collection.publicKey.toBase58());
      assert.equal(account.modifier, null);
      assert.ok(account.createdAt.eq(account.updatedAt));

      console.log(instructionStatsAccount);

      assert.equal(instructionStatsAccount.quantityOfAccounts, 1);
    });

    it('should remove collection when changing the kind', async () => {
      // arrange
      const accountsData = {
        name: 'data',
        kind: 1,
        modifier: null,
        space: null,
      };
      // act
      await program.methods
        .updateInstructionAccount(accountsData)
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          account: instructionAccount.publicKey,
        })
        .rpc();
      // assert
      const account = await program.account.instructionAccount.fetch(
        instructionAccount.publicKey
      );
      const decodedKind = decodeAccountKind(account.kind as any);
      assert.ok('signer' in account.kind);
      assert.equal(decodedKind.id, accountsData.kind);
      assert.ok(account.createdAt.lte(account.updatedAt));
    });

    it('should delete', async () => {
      // arrange
      const instructionAccount = Keypair.generate();
      const accountsData = {
        name: 'data',
        kind: 0,
        modifier: null,
        space: null,
      };
      // act
      await program.methods
        .createInstructionAccount(accountsData)
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          account: instructionAccount.publicKey,
        })
        .signers([instructionAccount])
        .remainingAccounts([
          {
            pubkey: collection.publicKey,
            isWritable: false,
            isSigner: false,
          },
        ])
        .rpc();
      await program.methods
        .deleteInstructionAccount()
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          account: instructionAccount.publicKey,
          instruction: instruction.publicKey,
        })
        .rpc();
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
        const accountsData = {
          name: 'payer',
          kind: 1,
          modifier: 1,
          space: null,
        };

        await program.methods
          .createInstructionAccount(accountsData)
          .accounts({
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            account: instructionPayerAccount.publicKey,
          })
          .signers([instructionPayerAccount])
          .rpc();
      });

      it('should create', async () => {
        // arrange
        const accountsData = {
          name: 'data',
          kind: 0,
          modifier: 0,
          space: 150,
        };
        // act
        await program.methods
          .createInstructionAccount(accountsData)
          .accounts({
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            account: instructionAccount.publicKey,
          })
          .signers([instructionAccount])
          .remainingAccounts([
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
          ])
          .rpc();
        // assert
        const account = await program.account.instructionAccount.fetch(
          instructionAccount.publicKey
        );
        const decodedModifier = decodeAccountModifier(account.modifier as any);
        assert.equal(decodedModifier.id, accountsData.modifier);
        assert.equal(decodedModifier.name, 'init');
        assert.equal(
          decodedModifier.payer,
          instructionPayerAccount.publicKey.toBase58()
        );
        assert.equal(decodedModifier.space, 150);
      });

      it('should remove payer and space when changing the modifier', async () => {
        // arrange
        const accountsData = {
          name: 'data',
          kind: 0,
          modifier: null,
          space: null,
        };
        // act
        await program.methods
          .updateInstructionAccount(accountsData)
          .accounts({
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            account: instructionAccount.publicKey,
          })
          .remainingAccounts([
            {
              pubkey: collection.publicKey,
              isWritable: false,
              isSigner: false,
            },
          ])
          .rpc();
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
        const accountsData = {
          name: 'data',
          kind: 0,
          modifier: 0,
          space: null,
        };
        let error: ProgramError | null = null;
        // act
        try {
          await program.methods
            .createInstructionAccount(accountsData)
            .accounts({
              authority: program.provider.wallet.publicKey,
              workspace: workspace.publicKey,
              application: application.publicKey,
              instruction: instruction.publicKey,
              account: instructionAccount.publicKey,
            })
            .signers([instructionAccount])
            .remainingAccounts([
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
            ])
            .rpc();
        } catch (err) {
          error = err as ProgramError;
        }
        // assert
        assert.equal(error?.code, 6007);
      });
    });

    describe('with mut modifier', () => {
      const instructionAccount = Keypair.generate();

      it('should create', async () => {
        // arrange
        const accountsData = {
          name: 'data',
          kind: 0,
          modifier: 1,
          space: null,
        };
        // act
        await program.methods
          .createInstructionAccount(accountsData)
          .accounts({
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            account: instructionAccount.publicKey,
          })
          .signers([instructionAccount])
          .remainingAccounts([
            {
              pubkey: collection.publicKey,
              isWritable: false,
              isSigner: false,
            },
          ])
          .rpc();
        // assert
        const account = await program.account.instructionAccount.fetch(
          instructionAccount.publicKey
        );
        const decodedKind = decodeAccountKind(account.kind as any);
        const decodedModifier = decodeAccountModifier(account.modifier as any);
        assert.ok(account.authority.equals(program.provider.wallet.publicKey));
        assert.ok(account.instruction.equals(instruction.publicKey));
        assert.ok(account.workspace.equals(workspace.publicKey));
        assert.ok(account.application.equals(application.publicKey));
        assert.equal(account.name, accountsData.name);
        assert.equal(decodedKind.id, accountsData.kind);
        assert.equal(decodedKind.collection, collection.publicKey.toBase58());
        assert.equal(decodedModifier.id, accountsData.modifier);
        assert.equal(decodedModifier.name, 'mut');
        assert.equal(decodedModifier.close, null);
      });
    });

    describe('with mut modifier and close constraint', () => {
      const instructionAccount = Keypair.generate();
      const instructionCloseAccount = Keypair.generate();

      before(async () => {
        const accountsData = {
          name: 'payer',
          kind: 1,
          modifier: 1,
          space: null,
        };

        await program.methods
          .createInstructionAccount(accountsData)
          .accounts({
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            account: instructionCloseAccount.publicKey,
          })
          .signers([instructionCloseAccount])
          .rpc();
      });

      it('should create', async () => {
        // arrange
        const accountsData = {
          name: 'data',
          kind: 0,
          modifier: 1,
          space: null,
        };
        // act
        await program.methods
          .createInstructionAccount(accountsData)
          .accounts({
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            account: instructionAccount.publicKey,
          })
          .signers([instructionAccount])
          .remainingAccounts([
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
          ])
          .rpc();
        // assert
        const account = await program.account.instructionAccount.fetch(
          instructionAccount.publicKey
        );
        const decodedKind = decodeAccountKind(account.kind as any);
        const decodedModifier = decodeAccountModifier(account.modifier as any);
        assert.ok(account.authority.equals(program.provider.wallet.publicKey));
        assert.ok(account.instruction.equals(instruction.publicKey));
        assert.ok(account.workspace.equals(workspace.publicKey));
        assert.ok(account.application.equals(application.publicKey));
        assert.equal(account.name, accountsData.name);
        assert.equal(decodedKind.id, accountsData.kind);
        assert.equal(decodedKind.name, 'document');
        assert.equal(decodedKind.collection, collection.publicKey.toBase58());
        assert.equal(decodedModifier.id, accountsData.modifier);
        assert.equal(decodedModifier.name, 'mut');
        assert.equal(
          decodedModifier.close,
          instructionCloseAccount.publicKey.toBase58()
        );
      });

      it('should remove close when changing the modifier', async () => {
        // arrange
        const accountsData = {
          name: 'data',
          kind: 1,
          modifier: null,
          space: null,
        };
        // act
        await program.methods
          .updateInstructionAccount(accountsData)
          .accounts({
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            account: instructionAccount.publicKey,
          })
          .rpc();
        // assert
        const account = await program.account.instructionAccount.fetch(
          instructionAccount.publicKey
        );
        const decodedKind = decodeAccountKind(account.kind as any);
        assert.equal(decodedKind.id, accountsData.kind);
        assert.equal(decodedKind.name, 'signer');
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
      const accountsData = {
        name: 'data',
        kind: 1,
        modifier: null,
        space: null,
      };
      // act
      await program.methods
        .createInstructionAccount(accountsData)
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          account: instructionAccount.publicKey,
        })
        .signers([instructionAccount])
        .rpc();
      // assert
      const account = await program.account.instructionAccount.fetch(
        instructionAccount.publicKey
      );
      const decodedKind = decodeAccountKind(account.kind as any);
      assert.ok(account.authority.equals(program.provider.wallet.publicKey));
      assert.ok(account.instruction.equals(instruction.publicKey));
      assert.ok(account.workspace.equals(workspace.publicKey));
      assert.ok(account.application.equals(application.publicKey));
      assert.equal(account.name, accountsData.name);
      assert.equal(decodedKind.id, accountsData.kind);
      assert.equal(decodedKind.name, 'signer');
      assert.equal(account.modifier, null);
      assert.equal(account.collection, null);
      assert.equal(account.payer, null);
      assert.equal(account.close, null);
      assert.equal(account.space, null);
    });
  });

  describe('unhappy paths', () => {
    let instruction = Keypair.generate();

    before(async () => {
      [instructionStatsPublicKey] = await PublicKey.findProgramAddress(
        [
          Buffer.from('instruction_stats', 'utf8'),
          instruction.publicKey.toBuffer(),
        ],
        program.programId
      );

      await program.methods
        .createInstruction({ name: instructionName })
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
        })
        .signers([instruction])
        .rpc();
    });

    it('should fail when deleting account with relations', async () => {
      // arrange
      const instructionAccount1 = Keypair.generate();
      const instructionAccount2 = Keypair.generate();
      const accountsData = {
        name: '12345678901234567890123456789012',
        kind: 0,
        modifier: null,
        space: null,
      };
      let error: ProgramError | null = null;
      // act
      try {
        await program.methods
          .createInstructionAccount(accountsData)
          .accounts({
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            account: instructionAccount1.publicKey,
          })
          .signers([instructionAccount1])
          .remainingAccounts([
            {
              pubkey: collection.publicKey,
              isWritable: false,
              isSigner: false,
            },
          ])
          .rpc();
        await program.methods
          .createInstructionAccount(accountsData)
          .accounts({
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            account: instructionAccount2.publicKey,
          })
          .signers([instructionAccount2])
          .remainingAccounts([
            {
              pubkey: collection.publicKey,
              isWritable: false,
              isSigner: false,
            },
          ])
          .rpc();
        await program.methods
          .createInstructionRelation()
          .accounts({
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            from: instructionAccount1.publicKey,
            to: instructionAccount2.publicKey,
          })
          .rpc();
        await program.methods
          .deleteInstructionAccount()
          .accounts({
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            instruction: instruction.publicKey,
            account: instructionAccount1.publicKey,
          })
          .rpc();
      } catch (err) {
        error = err as ProgramError;
      }
      // assert
      assert.equal(error?.code, 6015);
    });

    it('should increment instruction account quantity on create', async () => {
      // arrange
      const instructionAccount = Keypair.generate();
      const instruction = Keypair.generate();
      const accountsData = {
        name: 'data',
        kind: 0,
        modifier: null,
        space: null,
      };
      [instructionStatsPublicKey] = await PublicKey.findProgramAddress(
        [
          Buffer.from('instruction_stats', 'utf8'),
          instruction.publicKey.toBuffer(),
        ],
        program.programId
      );
      // act
      await program.methods
        .createInstruction({ name: instructionName })
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
        })
        .signers([instruction])
        .rpc();
      await program.methods
        .createInstructionAccount(accountsData)
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          account: instructionAccount.publicKey,
        })
        .signers([instructionAccount])
        .remainingAccounts([
          {
            pubkey: collection.publicKey,
            isWritable: false,
            isSigner: false,
          },
        ])
        .rpc();
      // assert
      const instructionStatsAccount =
        await program.account.instructionStats.fetch(instructionStatsPublicKey);
      assert.equal(instructionStatsAccount.quantityOfAccounts, 1);
    });

    it('should decrement instruction account quantity on delete', async () => {
      // arrange
      const instructionAccount = Keypair.generate();
      const instruction = Keypair.generate();
      const accountsData = {
        name: 'data',
        kind: 0,
        modifier: null,
        space: null,
      };
      [instructionStatsPublicKey] = await PublicKey.findProgramAddress(
        [
          Buffer.from('instruction_stats', 'utf8'),
          instruction.publicKey.toBuffer(),
        ],
        program.programId
      );
      // act
      await program.methods
        .createInstruction({ name: instructionName })
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
        })
        .signers([instruction])
        .rpc();
      await program.methods
        .createInstructionAccount(accountsData)
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          account: instructionAccount.publicKey,
        })
        .signers([instructionAccount])
        .remainingAccounts([
          {
            pubkey: collection.publicKey,
            isWritable: false,
            isSigner: false,
          },
        ])
        .rpc();
      await program.methods
        .deleteInstructionAccount()
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          instruction: instruction.publicKey,
          account: instructionAccount.publicKey,
        })
        .rpc();
      // assert
      const instructionStatsAccount =
        await program.account.instructionStats.fetch(instructionStatsPublicKey);
      assert.equal(instructionStatsAccount.quantityOfAccounts, 0);
    });

    it('should fail when providing wrong "instruction" to delete', async () => {
      // arrange
      const newInstruction = Keypair.generate();
      const newInstructionName = 'sample';
      const newAccount = Keypair.generate();
      const accountsData = {
        name: 'data',
        kind: 1,
        modifier: null,
        space: null,
      };
      let error: ProgramError | null = null;
      // act
      try {
        await program.methods
          .createInstruction({ name: newInstructionName })
          .accounts({
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: newInstruction.publicKey,
          })
          .signers([newInstruction])
          .rpc();
        await program.methods
          .createInstructionAccount(accountsData)
          .accounts({
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: newInstruction.publicKey,
            account: newAccount.publicKey,
          })
          .signers([newAccount])
          .rpc();
        await program.methods
          .deleteInstructionAccount()
          .accounts({
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            instruction: instruction.publicKey,
            account: newAccount.publicKey,
          })
          .rpc();
      } catch (err) {
        error = err as ProgramError;
      }
      // assert
      assert.equal(error?.code, 6044);
    });

    it('should fail when workspace has insufficient funds', async () => {
      // arrange
      const newWorkspace = Keypair.generate();
      const newWorkspaceName = 'sample';
      const newApplication = Keypair.generate();
      const newApplicationName = 'sample';
      const newInstruction = Keypair.generate();
      const newInstructionName = 'sample';
      const newAccount = Keypair.generate();
      const accountsData = {
        name: 'data',
        kind: 0,
        modifier: null,
        space: null,
      };
      const [newBudgetPublicKey] = await PublicKey.findProgramAddress(
        [Buffer.from('budget', 'utf8'), newWorkspace.publicKey.toBuffer()],
        program.programId
      );
      let error: ProgramError | null = null;
      // act
      await program.methods
        .createWorkspace({ name: newWorkspaceName })
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: newWorkspace.publicKey,
        })
        .signers([newWorkspace])
        .postInstructions([
          SystemProgram.transfer({
            fromPubkey: program.provider.wallet.publicKey,
            toPubkey: newBudgetPublicKey,
            lamports:
              (await program.provider.connection.getMinimumBalanceForRentExemption(
                2155 // instruction account size
              )) +
              (await program.provider.connection.getMinimumBalanceForRentExemption(
                10 // instruction stats account size
              )) +
              (await program.provider.connection.getMinimumBalanceForRentExemption(
                125 // application account size
              )) +
              (await program.provider.connection.getMinimumBalanceForRentExemption(
                10 // application stats account size
              )),
          }),
        ])
        .rpc();
      await program.methods
        .createApplication({ name: newApplicationName })
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: newWorkspace.publicKey,
          application: newApplication.publicKey,
        })
        .signers([newApplication])
        .rpc();
      await program.methods
        .createInstruction({ name: newInstructionName })
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: newWorkspace.publicKey,
          application: newApplication.publicKey,
          instruction: newInstruction.publicKey,
        })
        .signers([newInstruction])
        .rpc();
      try {
        await program.methods
          .createInstructionAccount(accountsData)
          .accounts({
            authority: program.provider.wallet.publicKey,
            workspace: newWorkspace.publicKey,
            application: newApplication.publicKey,
            instruction: newInstruction.publicKey,
            account: newAccount.publicKey,
          })
          .signers([newAccount])
          .remainingAccounts([
            {
              pubkey: collection.publicKey,
              isWritable: false,
              isSigner: false,
            },
          ])
          .rpc();
      } catch (err) {
        error = err as ProgramError;
      }
      // assert
      assert.equal(error?.code, 6027);
    });

    it('should fail when user is not a collaborator', async () => {
      // arrange
      const newUser = Keypair.generate();
      const newAccount = Keypair.generate();
      const accountsData = {
        name: 'data',
        kind: 0,
        modifier: null,
        space: null,
      };
      let error: ProgramError | null = null;
      // act
      try {
        await program.methods
          .createInstructionAccount(accountsData)
          .accounts({
            authority: newUser.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            account: newAccount.publicKey,
          })
          .signers([newUser, newAccount])
          .preInstructions([
            SystemProgram.transfer({
              fromPubkey: program.provider.wallet.publicKey,
              toPubkey: newUser.publicKey,
              lamports: LAMPORTS_PER_SOL,
            }),
          ])
          .rpc();
      } catch (err) {
        error = err as ProgramError;
      }
      // assert
      assert.equal(error?.code, 3012);
    });

    it('should fail when user is not an approved collaborator', async () => {
      // arrange
      const newAccount = Keypair.generate();
      const accountsData = {
        name: 'data',
        kind: 0,
        modifier: null,
        space: null,
      };
      const newUser = Keypair.generate();
      let error: ProgramError | null = null;
      // act
      const [newUserPublicKey] = await PublicKey.findProgramAddress(
        [Buffer.from('user', 'utf8'), newUser.publicKey.toBuffer()],
        program.programId
      );
      await program.methods
        .createUser()
        .accounts({
          authority: newUser.publicKey,
        })
        .signers([newUser])
        .preInstructions([
          SystemProgram.transfer({
            fromPubkey: program.provider.wallet.publicKey,
            toPubkey: newUser.publicKey,
            lamports: LAMPORTS_PER_SOL,
          }),
        ])
        .rpc();
      await program.methods
        .requestCollaboratorStatus()
        .accounts({
          authority: newUser.publicKey,
          workspace: workspace.publicKey,
          user: newUserPublicKey,
        })
        .signers([newUser])
        .rpc();

      try {
        await program.methods
          .createInstructionAccount(accountsData)
          .accounts({
            authority: newUser.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            account: newAccount.publicKey,
          })
          .signers([newUser, newAccount])
          .rpc();
      } catch (err) {
        error = err as ProgramError;
      }
      // assert
      assert.equal(error?.code, 6029);
    });
  });
});
