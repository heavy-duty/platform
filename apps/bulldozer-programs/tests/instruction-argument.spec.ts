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

describe('instruction argument', () => {
  const program = new Program(bulldozerIdl as Idl, BULLDOZER_PROGRAM_ID);
  setProvider(Provider.env());
  const instruction = Keypair.generate();
  const instructionArgument = Keypair.generate();
  const instructionName = 'create_document';
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

  it('should create account', async () => {
    // arrange
    const dto = {
      name: 'attr1_name',
      kind: 0,
      modifier: null,
      size: null,
      max: null,
      maxLength: null,
    };
    // act
    await program.rpc.createInstructionArgument(dto, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        argument: instructionArgument.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [instructionArgument],
    });
    // assert
    const instructionArgumentAccount =
      await program.account.instructionArgument.fetch(
        instructionArgument.publicKey
      );
    const instructionAccount = await program.account.instruction.fetch(
      instruction.publicKey
    );
    assert.ok(
      instructionArgumentAccount.authority.equals(
        program.provider.wallet.publicKey
      )
    );
    assert.ok(instructionArgumentAccount.workspace.equals(workspace.publicKey));
    assert.ok(
      instructionArgumentAccount.application.equals(application.publicKey)
    );
    assert.ok(
      instructionArgumentAccount.instruction.equals(instruction.publicKey)
    );
    assert.equal(instructionArgumentAccount.data.name, dto.name);
    assert.ok('boolean' in instructionArgumentAccount.data.kind);
    assert.equal(instructionArgumentAccount.data.kind.boolean.id, dto.kind);
    assert.equal(instructionArgumentAccount.data.kind.boolean.size, 1);
    assert.equal(instructionArgumentAccount.data.modifier, null);
    assert.equal(instructionAccount.quantityOfArguments, 1);
  });

  it('should update account', async () => {
    // arrange
    const dto = {
      name: 'attr1_name',
      kind: 1,
      modifier: 0,
      size: 5,
      max: 10,
      maxLength: null,
    };
    // act
    await program.rpc.updateInstructionArgument(dto, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        argument: instructionArgument.publicKey,
      },
    });
    // assert
    const account = await program.account.instructionArgument.fetch(
      instructionArgument.publicKey
    );
    assert.equal(account.data.name, dto.name);
    assert.ok('number' in account.data.kind);
    assert.equal(account.data.kind.number.id, dto.kind);
    assert.equal(account.data.kind.number.size, dto.max);
    assert.ok('array' in account.data.modifier);
    assert.equal(account.data.modifier.array.id, dto.modifier);
    assert.equal(account.data.modifier.array.size, dto.size);
  });

  it('should delete account', async () => {
    // act
    await program.rpc.deleteInstructionArgument({
      accounts: {
        authority: program.provider.wallet.publicKey,
        argument: instructionArgument.publicKey,
        instruction: instruction.publicKey,
      },
    });
    // assert
    const argumentAccount =
      await program.account.instructionArgument.fetchNullable(
        instructionArgument.publicKey
      );
    const instructionAccount = await program.account.instruction.fetch(
      instruction.publicKey
    );
    assert.equal(argumentAccount, null);
    assert.equal(instructionAccount.quantityOfArguments, 0);
  });

  it('should fail when max is not provided with a number', async () => {
    // arrange
    const dto = {
      name: 'attr1_name',
      kind: 1,
      modifier: 0,
      size: null,
      max: null,
      maxLength: null,
    };
    let error: ProgramError;
    // act
    try {
      await program.rpc.createInstructionArgument(dto, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          argument: instructionArgument.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [instructionArgument],
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6011);
  });

  it('should fail when max length is not provided with a string', async () => {
    // arrange
    const dto = {
      name: 'attr1_name',
      kind: 2,
      modifier: 0,
      size: null,
      max: null,
      maxLength: null,
    };
    let error: ProgramError;
    // act
    try {
      await program.rpc.createInstructionArgument(dto, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          argument: instructionArgument.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [instructionArgument],
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6012);
  });

  it('should fail when providing wrong "instruction" to delete', async () => {
    // arrange
    const newInstruction = Keypair.generate();
    const newInstructionName = 'sample';
    const newArgument = Keypair.generate();
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
      await program.rpc.createInstructionArgument(dto, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: newInstruction.publicKey,
          argument: newArgument.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [newArgument],
      });
      await program.rpc.deleteInstructionArgument({
        accounts: {
          authority: program.provider.wallet.publicKey,
          instruction: instruction.publicKey,
          argument: newArgument.publicKey,
        },
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6019);
  });
});
