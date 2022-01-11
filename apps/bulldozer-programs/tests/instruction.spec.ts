import {
  Idl,
  Program,
  ProgramError,
  Provider,
  setProvider,
} from '@project-serum/anchor';
import { Keypair, SystemProgram, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js';
import { assert } from 'chai';
import * as bulldozerIdl from '../target/idl/bulldozer.json';
import { BULLDOZER_PROGRAM_ID } from './utils';

describe('instruction', () => {
  const program = new Program(bulldozerIdl as Idl, BULLDOZER_PROGRAM_ID);
  setProvider(Provider.env());
  const instruction = Keypair.generate();
  const application = Keypair.generate();
  const applicationName = 'my-app';
  const workspace = Keypair.generate();
  const workspaceName = 'my-workspace';

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
  });

  it('should create account', async () => {
    // arrange
    const instructionName = 'create_document';
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
    // assert
    const account = await program.account.instruction.fetch(
      instruction.publicKey
    );
    const applicationAccount = await program.account.application.fetch(
      application.publicKey
    );
    assert.ok(account.authority.equals(program.provider.wallet.publicKey));
    assert.equal(account.name, instructionName);
    assert.equal(account.body, '');
    assert.ok(account.workspace.equals(workspace.publicKey));
    assert.ok(account.application.equals(application.publicKey));
    assert.equal(applicationAccount.quantityOfInstructions, 1);
    assert.ok(account.createdAt.eq(account.updatedAt));
  });

  it('should update account', async () => {
    // arrange
    const instructionName = 'update_document';
    // act
    await program.rpc.updateInstruction(
      { name: instructionName },
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          instruction: instruction.publicKey,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
      }
    );
    // assert
    const account = await program.account.instruction.fetch(
      instruction.publicKey
    );
    assert.equal(account.name, instructionName);
    assert.ok(account.createdAt.lte(account.updatedAt));
  });

  it('should update instruction body', async () => {
    // arrange
    const instructionBody = `
      msg!("Create instruction argument");
      ctx.accounts.argument.name = name;
      ctx.accounts.argument.kind = AttributeKind::from_index(kind)?;
      ctx.accounts.argument.modifier = AttributeKindModifier::from_index(modifier, size)?;
      ctx.accounts.argument.authority = ctx.accounts.authority.key();
      ctx.accounts.argument.instruction = ctx.accounts.instruction.key();
      ctx.accounts.argument.application = ctx.accounts.application.key();
    `;
    // act
    await program.rpc.updateInstructionBody(
      { body: instructionBody },
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          instruction: instruction.publicKey,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
      }
    );
    // assert
    const account = await program.account.instruction.fetch(
      instruction.publicKey
    );
    assert.equal(account.body, instructionBody);
  });

  it('should delete account', async () => {
    // act
    await program.rpc.deleteInstruction({
      accounts: {
        authority: program.provider.wallet.publicKey,
        instruction: instruction.publicKey,
        application: application.publicKey,
      },
    });
    // assert
    const account = await program.account.instruction.fetchNullable(
      instruction.publicKey
    );
    const applicationAccount = await program.account.application.fetch(
      application.publicKey
    );
    assert.equal(account, null);
    assert.equal(applicationAccount.quantityOfInstructions, 0);
  });

  it('should fail when deleting instruction with arguments', async () => {
    // arrange
    const instructionName = 'sample';
    const instruction = Keypair.generate();
    const argument = Keypair.generate();
    const dto = {
      name: 'arg1_name',
      kind: 0,
      modifier: null,
      size: null,
      max: null,
      maxLength: null,
    };
    let error: ProgramError;
    // act
    try {
      await program.rpc.createInstruction(
        { name: instructionName },
        {
          accounts: {
            instruction: instruction.publicKey,
            application: application.publicKey,
            workspace: workspace.publicKey,
            authority: program.provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
            clock: SYSVAR_CLOCK_PUBKEY,
          },
          signers: [instruction],
        }
      );
      await program.rpc.createInstructionArgument(dto, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          argument: argument.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [argument],
      });
      await program.rpc.deleteInstruction({
        accounts: {
          instruction: instruction.publicKey,
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
        },
      });
    } catch (err) {
      error = err;
    }
    console.log(error);
    // assert
    assert.equal(error.code, 6018);
  });

  it('should fail when deleting instruction with accounts', async () => {
    // arrange
    const instructionName = 'sample';
    const instruction = Keypair.generate();
    const account = Keypair.generate();
    const dto = {
      name: 'data',
      kind: 1,
      modifier: null,
      space: null,
    };
    let error: ProgramError;
    // act
    try {
      await program.rpc.createInstruction(
        { name: instructionName },
        {
          accounts: {
            instruction: instruction.publicKey,
            application: application.publicKey,
            workspace: workspace.publicKey,
            authority: program.provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
            clock: SYSVAR_CLOCK_PUBKEY,
          },
          signers: [instruction],
        }
      );
      await program.rpc.createInstructionAccount(dto, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          account: account.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [account],
      });
      await program.rpc.deleteInstruction({
        accounts: {
          instruction: instruction.publicKey,
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
        },
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6020);
  });

  it('should fail when providing wrong "application" to delete', async () => {
    // arrange
    const newApplication = Keypair.generate();
    const newApplicationName = 'sample';
    const newInstruction = Keypair.generate();
    const newInstructionName = 'sample';
    let error: ProgramError;
    // act
    try {
      await program.rpc.createApplication(
        { name: newApplicationName },
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: newApplication.publicKey,
            systemProgram: SystemProgram.programId,
            clock: SYSVAR_CLOCK_PUBKEY,
          },
          signers: [newApplication],
        }
      );
      await program.rpc.createInstruction(
        { name: newInstructionName },
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: newApplication.publicKey,
            instruction: newInstruction.publicKey,
            systemProgram: SystemProgram.programId,
            clock: SYSVAR_CLOCK_PUBKEY,
          },
          signers: [newInstruction],
        }
      );
      await program.rpc.deleteInstruction({
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          instruction: newInstruction.publicKey,
        },
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6025);
  });
});
